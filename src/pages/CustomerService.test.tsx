import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import CustomerService from './CustomerService';

describe('storefront customer service', () => {
  it('shows accurate custom-order and warranty guidance', async () => {
    render(<HelmetProvider><MemoryRouter initialEntries={['/warranty']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><CustomerService /></AuthProvider></MemoryRouter></HelmetProvider>);
    expect(await screen.findByRole('heading', { name: 'Warranty and claims' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Read Norman’s warranty/i })).toHaveAttribute('href', 'https://normanusa.com/warranties/');
    expect(screen.getByText(/shipping and labor are not included/i)).toBeInTheDocument();
    expect(screen.queryByText(/free shipping/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/555-0123/)).not.toBeInTheDocument();
  });
});
