import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Legal from './Legal';

function renderLegal(path: string) {
  render(<HelmetProvider><MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><Legal /></AuthProvider></MemoryRouter></HelmetProvider>);
}

describe('storefront legal pages', () => {
  it('publishes a real privacy policy without a fake phone number', async () => {
    renderLegal('/privacy');
    expect(await screen.findByRole('heading', { name: 'Privacy policy' })).toBeInTheDocument();
    expect(screen.getByText(/does not receive or store your complete card number/i)).toBeInTheDocument();
    expect(screen.queryByText(/555-0123/)).not.toBeInTheDocument();
  });

  it('states the custom-order and supplier-acceptance terms', async () => {
    renderLegal('/terms');
    expect(await screen.findByRole('heading', { name: 'Terms of sale' })).toBeInTheDocument();
    expect(screen.getByText(/does not mean the supplier has accepted it/i)).toBeInTheDocument();
    expect(screen.getByText(/48 contiguous United States/i)).toBeInTheDocument();
  });
});
