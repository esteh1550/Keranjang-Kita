import { CartItem, PriceHistory } from '../types';

const CART_KEY = 'keranjang_kita_cart';
const PRICE_HISTORY_KEY = 'keranjang_kita_prices';

export const saveCart = (cart: CartItem[]): void => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

export const loadCart = (): CartItem[] => {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading cart:', error);
    return [];
  }
};

export const savePrice = (barcode: string, price: number): void => {
  try {
    const history = loadPriceHistory();
    history[barcode] = price;
    localStorage.setItem(PRICE_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving price history:', error);
  }
};

export const loadPriceHistory = (): PriceHistory => {
  try {
    const data = localStorage.getItem(PRICE_HISTORY_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading price history:', error);
    return {};
  }
};

export const getPriceForBarcode = (barcode: string): number | null => {
  const history = loadPriceHistory();
  return history[barcode] || null;
};