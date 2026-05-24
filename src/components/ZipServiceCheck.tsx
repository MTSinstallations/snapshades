/**
 * ZipServiceCheck — Customer enters ZIP → instantly shows what's available
 * "Pro install available in your area!" or "DIY shipping available"
 */

import { useState } from 'react';
import { MapPin, Check, Truck, Wrench, Palette, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ZipResult {
  zip: string;
  city: string;
  state: string;
  diy: boolean;
  proInstall: boolean;
  design: boolean;
  contractorCount: number;
}

export default function ZipServiceCheck({ onResult }: { onResult?: (result: ZipResult | null) => void }) {
  const [zip, setZip] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ZipResult | null>(null);

  const checkZip = async (zipCode: string) => {
    if (zipCode.length !== 5) return;
    setChecking(true);

    // Look up ZIP metadata
    const { data: meta } = await supabase
      .from('zip_metadata').select('city, state').eq('zip', zipCode).single();

    if (!meta) {
      setResult(null);
      setChecking(false);
      onResult?.(null);
      return;
    }

    // Check territory
    const { data: territory } = await supabase
      .from('territories')
      .select('diy_available, pro_install_available, design_available')
      .eq('zip', zipCode)
      .eq('status', 'active')
      .single();

    // Count contractors
    const { count } = await supabase
      .from('territory_contractors')
      .select('id', { count: 'exact', head: true })
      .eq('zip', zipCode);

    const r: ZipResult = {
      zip: zipCode,
      city: meta.city,
      state: meta.state,
      diy: true, // always available
      proInstall: territory?.pro_install_available || false,
      design: territory?.design_available || false,
      contractorCount: count || 0,
    };

    setResult(r);
    setChecking(false);
    onResult?.(r);
  };

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={zip}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 5);
              setZip(v);
              if (v.length === 5) checkZip(v);
              else { setResult(null); onResult?.(null); }
            }}
            placeholder="Enter ZIP code"
            maxLength={5}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-lg font-mono tracking-wider"
          />
          {checking && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />}
        </div>
      </div>

      {result && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <div className="bg-green-50 p-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              We serve {result.city}, {result.state}!
            </span>
          </div>
          <div className="bg-gray-50 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">Free shipping to your door</span>
              <Check className="w-4 h-4 text-green-500 ml-auto" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wrench className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700">Professional installation</span>
              {result.proInstall ? (
                <span className="ml-auto flex items-center gap-1 text-green-600 text-xs font-medium"><Check className="w-4 h-4" /> {result.contractorCount} installer{result.contractorCount !== 1 ? 's' : ''}</span>
              ) : (
                <span className="ml-auto text-xs text-gray-400">Coming soon</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Palette className="w-4 h-4 text-orange-600" />
              <span className="text-gray-700">Design consultation</span>
              {result.design ? (
                <span className="ml-auto flex items-center gap-1 text-green-600 text-xs font-medium"><Check className="w-4 h-4" /> Available</span>
              ) : (
                <span className="ml-auto text-xs text-gray-400">Coming soon</span>
              )}
            </div>
          </div>
        </div>
      )}

      {zip.length === 5 && !checking && !result && (
        <div className="mt-3 bg-yellow-50 rounded-xl p-3 text-sm text-yellow-700">
          <Truck className="w-4 h-4 inline mr-1" /> We can ship to any US address! Professional installation is expanding — check back soon.
        </div>
      )}
    </div>
  );
}
