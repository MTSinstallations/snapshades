import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthContext';
import QuickOrder from './QuickOrder';

function renderPage(initialEntry = '/order') {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialEntry]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <QuickOrder />
        </AuthProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

function chooseCellularAndReachSize() {
  fireEvent.click(screen.getByRole('button', { name: /Cellular Shades/i }));
  fireEvent.click(screen.getByRole('button', { name: /Continue to Mount/i }));
  fireEvent.click(screen.getByRole('button', { name: /Continue to Size/i }));
}

describe('QuickOrder simplified value flow', () => {
  beforeEach(() => localStorage.clear());

  it('offers exactly the three approved product families', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Choose your product.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cellular Shades/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Roller Shades/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Faux Wood Blinds/i })).toBeInTheDocument();
    expect(screen.queryByText(/shutter/i)).not.toBeInTheDocument();
  });

  it('uses mount-specific measurement instructions and prices a valid size', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Choose your product.' });
    chooseCellularAndReachSize();

    expect(screen.getByText(/Do not deduct/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Width whole inches'), { target: { value: '36' } });
    fireEvent.change(screen.getByLabelText('Height whole inches'), { target: { value: '48' } });

    expect(screen.getByText('Your price: $59.40')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue to Details/i })).toBeEnabled();
  });

  it('stores the complete configured window with zero tax and shipping fees', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Choose your product.' });
    chooseCellularAndReachSize();
    fireEvent.change(screen.getByLabelText('Width whole inches'), { target: { value: '36' } });
    fireEvent.change(screen.getByLabelText('Height whole inches'), { target: { value: '48' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue to Details/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to Review/i }));

    expect(screen.getByText('Supplier cost')).toBeInTheDocument();
    expect(screen.getByText('SnapShades 10%')).toBeInTheDocument();
    expect(screen.getAllByText('$0.00')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: /Add to cart/i }));

    const stored = JSON.parse(localStorage.getItem('snapshades_cart') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      product: 'Cellular Shades',
      mountType: 'inside',
      width: 36,
      height: 48,
      customerPrice: 59.4,
      ourCost: 54,
      installFee: 0,
      designFee: 0,
    });
  });
});
