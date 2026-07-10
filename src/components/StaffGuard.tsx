import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function StaffGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(isSupabaseConfigured);
  const [isStaff, setIsStaff] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (!user) return;

    let cancelled = false;
    const verify = async () => {
      const { data, error } = await supabase.rpc('is_staff');
      if (cancelled) return;
      setIsStaff(!error && data === true);
      setChecking(false);
    };
    verify();
    return () => { cancelled = true; };
  }, [loading, navigate, user]);

  if (!isSupabaseConfigured) return <>{children}</>;
  if (loading || checking) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>;
  }
  if (!user) return null;
  if (!isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Staff access required</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">This account is signed in but is not on the SnapShades staff allowlist.</p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white">Back to storefront</Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
