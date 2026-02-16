import { ProductResponse } from '../types';

const BASE_URL = 'https://api-product-indonesia.vercel.app/api/products';

export const fetchProductByBarcode = async (barcode: string): Promise<string | null> => {
  try {
    const response = await fetch(`${BASE_URL}?barcode=${barcode}`);
    
    if (!response.ok) {
      return null;
    }

    const data: ProductResponse = await response.json();
    
    if (data && data.data && data.data.product_name) {
      return data.data.product_name;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};