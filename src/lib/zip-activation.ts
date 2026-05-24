/**
 * ZIP Code Activation Workflow
 * 
 * One ZIP entry triggers a full infrastructure cascade:
 * 1. Resolve ZIP metadata (city, state, lat/lng, population)
 * 2. Create territory record
 * 3. Set pricing based on zone
 * 4. Match available contractors
 * 5. Update scheduling availability
 * 6. Generate SEO pages
 * 7. Update service availability
 * 8. Log activation
 */

import { supabase } from './supabase';
import { STATE_TAX_RATES } from './tax';

export interface ActivationStep {
  step: number;
  name: string;
  status: 'pending' | 'running' | 'done' | 'error' | 'skipped';
  detail?: string;
}

export interface ActivationResult {
  zip: string;
  success: boolean;
  steps: ActivationStep[];
  territory_id?: string;
  city?: string;
  state?: string;
  pricing_zone?: number;
  contractors_matched?: number;
  seo_pages_created?: number;
  warnings: string[];
  error?: string;
}

function getPricingZone(population: number | null): number {
  if (!population) return 3;
  if (population > 100000) return 1;
  if (population > 25000) return 2;
  if (population > 5000) return 3;
  return 4;
}

function getTravelSurcharge(zone: number): number {
  switch (zone) {
    case 1: return 0;
    case 2: return 0;
    case 3: return 1;
    case 4: return 2;
    default: return 0;
  }
}

function getMinimumOrder(zone: number): number {
  return zone === 4 ? 200 : 0;
}

export async function activateZip(zip: string, activatedBy?: string): Promise<ActivationResult> {
  const steps: ActivationStep[] = [
    { step: 1, name: 'Resolve ZIP metadata', status: 'pending' },
    { step: 2, name: 'Create territory', status: 'pending' },
    { step: 3, name: 'Set pricing', status: 'pending' },
    { step: 4, name: 'Match contractors', status: 'pending' },
    { step: 5, name: 'Update scheduling', status: 'pending' },
    { step: 6, name: 'Generate SEO pages', status: 'pending' },
    { step: 7, name: 'Update availability', status: 'pending' },
    { step: 8, name: 'Log activation', status: 'pending' },
  ];

  const warnings: string[] = [];
  const result: ActivationResult = { zip, success: false, steps, warnings };

  const updateStep = (n: number, status: ActivationStep['status'], detail?: string) => {
    steps[n - 1].status = status;
    if (detail) steps[n - 1].detail = detail;
  };

  try {
    // ── Step 1: Resolve ZIP metadata ──
    updateStep(1, 'running');
    const { data: meta, error: metaErr } = await supabase
      .from('zip_metadata')
      .select('*')
      .eq('zip', zip)
      .single();

    if (metaErr || !meta) {
      // ZIP not in our database — try to create a basic record
      updateStep(1, 'error', 'ZIP not found in metadata table. Add ZIP data first.');
      result.error = `ZIP ${zip} not found. Import ZIP metadata first.`;
      return result;
    }

    updateStep(1, 'done', `${meta.city}, ${meta.state}`);
    result.city = meta.city;
    result.state = meta.state;

    // ── Step 2: Create territory ──
    updateStep(2, 'running');
    const zone = getPricingZone(meta.population);
    result.pricing_zone = zone;

    // Check if already exists
    const { data: existing } = await supabase
      .from('territories')
      .select('id, status')
      .eq('zip', zip)
      .single();

    let territoryId: string;

    if (existing) {
      // Reactivate
      const { error } = await supabase
        .from('territories')
        .update({
          status: 'active',
          pricing_zone: zone,
          diy_available: true,
          activated_at: new Date().toISOString(),
          activated_by: activatedBy || null,
          deactivated_at: null,
        })
        .eq('id', existing.id);
      if (error) throw error;
      territoryId = existing.id;
      updateStep(2, 'done', 'Reactivated existing territory');
    } else {
      const { data: terr, error } = await supabase
        .from('territories')
        .insert({
          zip,
          status: 'active',
          pricing_zone: zone,
          diy_available: true,
          pro_install_available: false,
          design_available: false,
          activated_by: activatedBy || null,
        })
        .select('id')
        .single();
      if (error) throw error;
      territoryId = terr!.id;
      updateStep(2, 'done', `Zone ${zone} (${['', 'Metro', 'Suburban', 'Rural', 'Remote'][zone]})`);
    }
    result.territory_id = territoryId;

    // ── Step 3: Set pricing ──
    updateStep(3, 'running');
    const taxRate = STATE_TAX_RATES[meta.state] ?? 0.06;
    const travelSurcharge = getTravelSurcharge(zone);
    const minOrder = getMinimumOrder(zone);

    await supabase
      .from('territory_pricing')
      .upsert({
        zip,
        tax_rate: taxRate,
        travel_zone: zone,
        travel_surcharge_per_mile: travelSurcharge,
        free_radius_miles: 20,
        minimum_order: minOrder,
      }, { onConflict: 'zip' });

    updateStep(3, 'done', `Tax ${(taxRate * 100).toFixed(2)}%, travel $${travelSurcharge}/mi`);

    // ── Step 4: Match contractors ──
    updateStep(4, 'running');
    const { data: contractors } = await supabase
      .from('installers')
      .select('id, service_zips, latitude, longitude, rating, completed_jobs, status')
      .eq('status', 'active');

    let matched = 0;
    if (contractors && contractors.length > 0) {
      for (const inst of contractors) {
        // Check if ZIP is in their service list
        const servesZip = inst.service_zips?.includes(zip);

        // Check distance if they have coordinates and the ZIP has coordinates
        let withinRadius = false;
        if (!servesZip && inst.latitude && inst.longitude && meta.latitude && meta.longitude) {
          const dist = haversineDistance(
            Number(inst.latitude), Number(inst.longitude),
            Number(meta.latitude), Number(meta.longitude)
          );
          withinRadius = dist <= 30; // 30 mile default radius
        }

        if (servesZip || withinRadius) {
          await supabase
            .from('territory_contractors')
            .upsert({
              zip,
              installer_id: inst.id,
              rank: matched + 1,
              is_primary: matched === 0,
            }, { onConflict: 'zip,installer_id' });
          matched++;
        }
      }
    }

    result.contractors_matched = matched;

    if (matched > 0) {
      await supabase
        .from('territories')
        .update({ pro_install_available: true, status: 'active' })
        .eq('zip', zip);
      updateStep(4, 'done', `${matched} contractor(s) matched`);
    } else {
      await supabase
        .from('territories')
        .update({ status: 'active_no_contractor' })
        .eq('zip', zip);
      warnings.push('No contractors found — DIY only until installer assigned');
      updateStep(4, 'done', 'No contractors — DIY only');
    }

    // ── Step 5: Update scheduling ──
    updateStep(5, 'running');
    // Scheduling is handled dynamically by the scheduling engine querying territory_contractors
    // No additional setup needed — just verify the linkage exists
    if (matched > 0) {
      updateStep(5, 'done', 'Scheduling linked via territory_contractors');
    } else {
      updateStep(5, 'skipped', 'No contractors to schedule');
    }

    // ── Step 6: Generate SEO pages ──
    updateStep(6, 'running');
    const citySlug = meta.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const stateSlug = meta.state.toLowerCase();
    const categories = ['shutters', 'blinds', 'shades'] as const;
    let seoCreated = 0;

    for (const cat of categories) {
      const slug = `${cat}/${citySlug}-${stateSlug}`;
      const title = `${cat.charAt(0).toUpperCase() + cat.slice(1)} in ${meta.city}, ${meta.state} — SnapShades & Shutters`;
      const description = `Shop custom ${cat} in ${meta.city}, ${meta.state}. Free shipping on DIY orders. Professional installation available. Starting at dealer-direct prices.`;

      const { error } = await supabase
        .from('seo_pages')
        .upsert({
          slug,
          city: meta.city,
          state: meta.state,
          product_category: cat,
          title,
          description,
          installer_count: matched,
          is_indexed: true,
        }, { onConflict: 'slug' });

      if (!error) seoCreated++;
    }

    result.seo_pages_created = seoCreated;
    updateStep(6, 'done', `${seoCreated} SEO pages created/updated`);

    // ── Step 7: Update availability ──
    updateStep(7, 'running');
    // This is read dynamically from territories table — no additional work needed
    updateStep(7, 'done', 'Availability live — customers can now see this ZIP');

    // ── Step 8: Log activation ──
    updateStep(8, 'running');
    await supabase.from('zip_activation_log').insert({
      zip,
      action: 'activated',
      activated_by: activatedBy || null,
      steps_completed: steps.map(s => ({ step: s.step, name: s.name, status: s.status })),
      contractors_matched: matched,
      pricing_zone: zone,
      warnings,
    });
    updateStep(8, 'done', 'Logged');

    result.success = true;
    return result;

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    result.error = errMsg;
    // Mark remaining steps as error
    steps.forEach(s => { if (s.status === 'pending' || s.status === 'running') s.status = 'error'; });
    return result;
  }
}

export async function deactivateZip(zip: string, deactivatedBy?: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('territories')
    .update({
      status: 'inactive',
      deactivated_at: new Date().toISOString(),
      pro_install_available: false,
      design_available: false,
    })
    .eq('zip', zip);

  if (error) return { success: false, error: error.message };

  // Noindex SEO pages
  const { data: meta } = await supabase.from('zip_metadata').select('city, state').eq('zip', zip).single();
  if (meta) {
    await supabase
      .from('seo_pages')
      .update({ is_indexed: false })
      .eq('city', meta.city)
      .eq('state', meta.state);
  }

  // Log
  await supabase.from('zip_activation_log').insert({
    zip,
    action: 'deactivated',
    activated_by: deactivatedBy || null,
    steps_completed: [{ step: 1, name: 'Deactivation', status: 'done' }],
  });

  return { success: true };
}

export async function bulkActivateZips(zips: string[], activatedBy?: string): Promise<ActivationResult[]> {
  const results: ActivationResult[] = [];
  for (const zip of zips) {
    const result = await activateZip(zip.trim(), activatedBy);
    results.push(result);
  }
  return results;
}

// Haversine distance in miles
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
