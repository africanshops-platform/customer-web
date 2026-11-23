import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StoreProducts from '../StoreProducts';

const published = { id: 'p1', slug: 'rice', name: 'Rice 50kg', price: 46799, isPublished: true, imageLinks: [] };
const hidden = { id: 'p2', slug: 'perfume', name: 'Afnan 9pm', price: 40000, isPublished: false, imageLinks: [] };

const renderStore = (products, onAdd = jest.fn()) =>
  render(
    <MemoryRouter>
      <StoreProducts products={products} isLoading={false} isError={false} total={products.length} hasMore={false} onAdd={onAdd} />
    </MemoryRouter>,
  );

describe('a shop page with an unpublished product', () => {
  it('greys the unpublished product out, says it is not available, and cannot add it to the cart', () => {
    const onAdd = jest.fn();
    renderStore([published, hidden], onAdd);

    const cards = screen.getAllByTestId('store-product-card');
    expect(cards).toHaveLength(2);

    // the published one is normal
    expect(cards[0].querySelector('[data-testid="not-available-badge"]')).toBeNull();
    fireEvent.click(cards[0].querySelector('button'));
    expect(onAdd).toHaveBeenCalledWith(published);

    // the unpublished one is marked, noted and disabled
    expect(cards[1].querySelector('[data-testid="not-available-badge"]')).toBeTruthy();
    expect(cards[1].querySelector('[data-testid="not-available-note"]').textContent).toMatch(/not available/i);
    const button = cards[1].querySelector('button');
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('Not available');
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('a product with no publish flag in the payload still shows as available (nothing is hidden by guesswork)', () => {
    renderStore([{ ...published, isPublished: undefined }]);
    expect(screen.queryByTestId('not-available-badge')).toBeNull();
  });
});
