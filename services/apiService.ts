import { ApiProduct } from '../types';

// Using OpenFoodFacts as a robust, public API for product data
const BASE_URL = 'https://world.openfoodfacts.org';

interface OffProduct {
  product_name?: string;
  brands?: string;
  code?: string;
}

interface OffSearchResponse {
  products?: OffProduct[];
}

interface OffProductResponse {
  status: number;
  product?: OffProduct;
}

export const fetchProductByBarcode = async (barcode: string): Promise<string | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v0/product/${barcode}.json`);
    
    if (!response.ok) {
      return null;
    }

    const data: OffProductResponse = await response.json();
    
    // OpenFoodFacts returns status 1 if found
    if (data.status === 1 && data.product && data.product.product_name) {
      return data.product.product_name;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const searchGlobalProducts = async (query: string): Promise<ApiProduct[]> => {
  if (!query) return [];
  try {
    // Using OpenFoodFacts search API
    // page_size=20 to limit results
    const response = await fetch(`${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`);
    
    if (!response.ok) {
      return [];
    }

    const json: OffSearchResponse = await response.json();
    
    if (json.products && Array.isArray(json.products)) {
        return json.products.map((p) => ({
            product_name: p.product_name || 'Unknown Product',
            product_brand: p.brands || '',
            product_barcode: p.code || ''
        })).filter(p => p.product_name && p.product_barcode); // Filter out incomplete data
    }
    
    return [];
  } catch (error) {
    console.error('Error searching global products:', error);
    return [];
  }
};