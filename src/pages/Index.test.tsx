import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from './Index';

describe('simplified storefront home', () => {
  beforeEach(() => localStorage.clear());

  it('presents the three-product catalog and transparent price promise', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <Index />
          </AuthProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(await screen.findByRole('heading', { name: /Without the markup/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cellular Shades' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Roller Shades' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Faux Wood Blinds' })).toBeInTheDocument();
    expect(screen.getAllByText(/Supplier cost \+ 10%/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Roman Shades/i)).not.toBeInTheDocument();
  });
});
