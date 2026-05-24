import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';

/**
 * Protects admin routes. Redirects to /auth if not logged in.
 * 
 * TODO: Add role-based check when admin roles are implemented.
 * For now, any authenticated user can access admin pages.
 * In production, check user metadata for admin role.
 */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
