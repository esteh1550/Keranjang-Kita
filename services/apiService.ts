import { ApiProduct } from '../types';

// Using OpenFoodFacts as a robust, public API for product data
const BASE_URL = 'https://world.openfoodfacts.org';

interface OffProduct {
  product_name?: string;
  product_name_id?: string;
  product_name_en?: string;
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch(`${BASE_URL}/api/v0/product/${barcode}.json`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }

    const data: OffProductResponse = await response.json();
    
    // OpenFoodFacts returns status 1 if found
    if (data.status === 1 && data.product) {
      return data.product.product_name || data.product.product_name_id || data.product.product_name_en || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const searchGlobalProducts = async (query: string): Promise<ApiProduct[]> => {
  if (!query) return [];
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased timeout for larger payload

  try {
    // Using OpenFoodFacts search API
    // Increased page_size to 100
    const response = await fetch(`${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=100`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return [];
    }

    const json: OffSearchResponse = await response.json();
    
    if (json.products && Array.isArray(json.products)) {
        return json.products.map((p) => ({
            product_name: p.product_name || p.product_name_id || p.product_name_en || 'Unknown Product',
            product_brand: p.brands || 'No Brand',
            product_barcode: p.code || ''
        })).filter(p => p.product_name && p.product_barcode); // Filter out incomplete data
    }
    
    return [];
  } catch (error) {
    console.error('Error searching global products:', error);
    return [];
  }
};