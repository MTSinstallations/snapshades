import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import QuickOrder from './QuickOrder';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/order']}>
      <AuthProvider>
        <QuickOrder />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('QuickOrder (1-2-3 express flow)', () => {
  beforeEach(() => localStorage.clear());

  it('renders the measure step with the product picker', async () => {
    renderPage();
    expect(await screen.findByText('What are you covering?')).toBeInTheDocument();
    // The third step label is unique to the step indicator.
    expect(screen.getByText('Pay')).toBeInTheDocument();
    // Product cards render with a "from $" starting price.
    expect(screen.getAllByText(/from \$\d/).length).toBeGreaterThan(0);
  });

  it('reveals measurement inputs only after a product is chosen', async () => {
    renderPage();
    await screen.findByText('What are you covering?');
    expect(screen.queryByText('Your measurements')).not.toBeInTheDocument();

    const productCard = screen
      .getAllByRole('button')
      .find((b) => /from \$\d/.test(b.textContent || ''));
    expect(productCard).toBeTruthy();
    fireEvent.click(productCard!);

    expect(screen.getByText('Your measurements')).toBeInTheDocument();
  });

  it('keeps the "Customize" advance button disabled until a valid size is entered', async () => {
    renderPage();
    await screen.findByText('What are you covering?');
    const productCard = screen
      .getAllByRole('button')
      .find((b) => /from \$\d/.test(b.textContent || ''));
    fireEvent.click(productCard!);

    // The footer advance button reads "Customize" on step 1; disabled with no size.
    const advance = screen
      .getAllByRole('button')
      .find((b) => b.textContent?.trim().startsWith('Customize'));
    expect(advance).toBeDefined();
    expect(advance).toBeDisabled();
  });
});
