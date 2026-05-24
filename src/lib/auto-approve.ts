/**
 * Contractor Auto-Approval Engine
 * 
 * Runs after every document upload or status change.
 * If all requirements pass → auto-approve → activate → link territories → send welcome.
 * If any fail → tell contractor exactly what's missing.
 */

import { supabase } from './supabase';

interface ApprovalCheck {
  name: string;
  passed: boolean;
  reason?: string;
}

interface ApprovalResult {
  installerId: string;
  approved: boolean;
  checks: ApprovalCheck[];
  missing: string[];
  autoActivated: boolean;
}

export async function checkAndApprove(installerId: string): Promise<ApprovalResult> {
  const checks: ApprovalCheck[] = [];
  const missing: string[] = [];

  try {
  // Load installer
  const { data: installer } = await supabase
    .from('installers')
    .select('*')
    .eq('id', installerId)
    .single();

  if (!installer) {
    return { installerId, approved: false, checks: [], missing: ['Installer not found'], autoActivated: false };
  }

  // Load state requirements
  const state = installer.service_zips?.[0]?.slice(0, 2); // rough — will improve with zip_metadata
  const { data: banking } = await supabase
    .from('contractor_banking')
    .select('*')
    .eq('installer_id', installerId)
    .single();

  const { data: docs } = await supabase
    .from('contractor_documents')
    .select('*')
    .eq('installer_id', installerId);

  const docsByType: Record<string, typeof docs extends (infer T)[] ? T : never> = {};
  docs?.forEach(d => { docsByType[d.doc_type] = d; });

  // ── Check 1: W-9 on file ──
  const w9 = docsByType['w9'];
  if (w9) {
    checks.push({ name: 'W-9 Tax Form', passed: true });
  } else {
    checks.push({ name: 'W-9 Tax Form', passed: false, reason: 'W-9 not uploaded' });
    missing.push('Upload W-9 tax form');
  }

  // ── Check 2: General Liability Insurance ──
  const gl = docsByType['coi_gl'];
  if (gl && gl.status === 'verified' && gl.expires_at) {
    const daysLeft = Math.floor((new Date(gl.expires_at).getTime() - Date.now()) / 86400000);
    if (daysLeft > 30) {
      checks.push({ name: 'General Liability Insurance', passed: true });
    } else if (daysLeft > 0) {
      checks.push({ name: 'General Liability Insurance', passed: false, reason: `Expires in ${daysLeft} days — must have 30+ days remaining` });
      missing.push('Insurance expires too soon — upload renewed COI');
    } else {
      checks.push({ name: 'General Liability Insurance', passed: false, reason: 'Insurance expired' });
      missing.push('Insurance expired — upload renewed COI');
    }
  } else if (gl && gl.status === 'pending') {
    checks.push({ name: 'General Liability Insurance', passed: false, reason: 'COI uploaded — awaiting verification' });
    missing.push('Insurance certificate pending verification');
  } else {
    checks.push({ name: 'General Liability Insurance', passed: false, reason: 'No COI uploaded' });
    missing.push('Upload Certificate of Insurance (GL, $1M minimum)');
  }

  // ── Check 3: Background Check ──
  if (installer.background_check) {
    checks.push({ name: 'Background Check', passed: true });
  } else {
    const bgConsent = docsByType['background_consent'];
    if (bgConsent) {
      checks.push({ name: 'Background Check', passed: false, reason: 'Consent signed — check in progress' });
      missing.push('Background check in progress (2-3 business days)');
    } else {
      checks.push({ name: 'Background Check', passed: false, reason: 'Consent not signed' });
      missing.push('Sign background check consent form');
    }
  }

  // ── Check 4: Banking ──
  if (banking && banking.routing_number && banking.account_number_last4) {
    checks.push({ name: 'Banking Info', passed: true });
  } else {
    checks.push({ name: 'Banking Info', passed: false, reason: 'Bank account not set up' });
    missing.push('Complete banking setup (routing + account number)');
  }

  // ── Check 5: Agreement Signed ──
  const ica = docsByType['ica'];
  if (ica) {
    checks.push({ name: 'Contractor Agreement', passed: true });
  } else {
    checks.push({ name: 'Contractor Agreement', passed: false, reason: 'Agreement not signed' });
    missing.push('Sign the Independent Contractor Agreement');
  }

  // ── Check 6: State License (if required) ──
  // Look up state from their ZIP
  if (installer.service_zips?.length > 0) {
    const primaryZip = installer.service_zips[0];
    const { data: zipMeta } = await supabase
      .from('zip_metadata')
      .select('state')
      .eq('zip', primaryZip)
      .single();

    if (zipMeta) {
      const { data: stateReq } = await supabase
        .from('state_requirements')
        .select('*')
        .eq('state', zipMeta.state)
        .single();

      if (stateReq?.license_required) {
        const license = docsByType['license'];
        if (license && license.status === 'verified') {
          checks.push({ name: `State License (${zipMeta.state})`, passed: true });
        } else if (license) {
          checks.push({ name: `State License (${zipMeta.state})`, passed: false, reason: 'License uploaded — awaiting verification' });
          missing.push(`State contractor license (${stateReq.license_type}) pending verification`);
        } else {
          checks.push({ name: `State License (${zipMeta.state})`, passed: false, reason: `${stateReq.license_type} required in ${zipMeta.state}` });
          missing.push(`Upload ${stateReq.license_type} — required in ${zipMeta.state}`);
        }
      }
    }
  }

  // ── Decision ──
  const allPassed = checks.every(c => c.passed);
  let autoActivated = false;

  if (allPassed && installer.status !== 'active') {
    // AUTO-APPROVE
    await supabase
      .from('installers')
      .update({ status: 'active', onboarded: true })
      .eq('id', installerId);

    // Auto-link to active territories
    const zips = installer.service_zips || [];
    for (const zip of zips) {
      const { data: terr } = await supabase
        .from('territories')
        .select('zip')
        .eq('zip', zip)
        .in('status', ['active', 'active_no_contractor'])
        .single();

      if (terr) {
        await supabase.from('territory_contractors').upsert(
          { zip, installer_id: installerId, rank: 50, is_primary: false },
          { onConflict: 'zip,installer_id' }
        );
        await supabase.from('territories').update({
          pro_install_available: true,
          status: 'active',
        }).eq('zip', zip);
      }
    }

    autoActivated = true;

    // TODO: Send welcome email via Resend/SendGrid
    // TODO: Send Telegram notification to admin
  }

  return { installerId, approved: allPassed, checks, missing, autoActivated };
  } catch (err: unknown) {
    return { installerId, approved: false, checks, missing: [err instanceof Error ? err.message : 'Unexpected error'], autoActivated: false };
  }
}

/**
 * Run compliance check on ALL active contractors.
 * Called by daily cron job.
 * Auto-suspends contractors with expired documents.
 */
export async function dailyComplianceCheck(): Promise<{ checked: number; suspended: number; warned: number }> {
  const { data: contractors } = await supabase
    .from('installers')
    .select('id, email, full_name, status')
    .in('status', ['active', 'verified']);

  if (!contractors) return { checked: 0, suspended: 0, warned: 0 };

  let suspended = 0;
  let warned = 0;

  for (const contractor of contractors) {
    // Check GL insurance expiry
    const { data: gl } = await supabase
      .from('contractor_documents')
      .select('expires_at, status')
      .eq('installer_id', contractor.id)
      .eq('doc_type', 'coi_gl')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (gl?.expires_at) {
      const daysLeft = Math.floor((new Date(gl.expires_at).getTime() - Date.now()) / 86400000);

      if (daysLeft <= 0) {
        // EXPIRED → auto-suspend
        await supabase.from('installers').update({ status: 'suspended' }).eq('id', contractor.id);
        await supabase.from('contractor_documents').update({ status: 'expired' }).eq('installer_id', contractor.id).eq('doc_type', 'coi_gl');
        // TODO: Send suspension email
        suspended++;
      } else if (daysLeft <= 7) {
        // TODO: Send urgent daily reminder
        warned++;
      } else if (daysLeft <= 30) {
        // TODO: Send reminder email
        warned++;
      } else if (daysLeft <= 60) {
        // TODO: Send early reminder
        warned++;
      }
    }
  }

  return { checked: contractors.length, suspended, warned };
}
