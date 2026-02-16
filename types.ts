
export interface CartItem {
  id: string; // Unique ID (usually barcode, but can be random for manual entry)
  barcode?: string;
  name: string;
  price: number;
  quantity: number;
  addedAt: number;
}

export interface ProductResponse {
  data?: {
    product_name?: string;
    product_price?: string; // API might return string
  };
  status?: string;
}

export interface ApiProduct {
  product_name: string;
  product_brand?: string;
  product_barcode: string;
}

export interface PriceHistory {
  [barcode: string]: number;
}

export interface Member {
  name: string;
  phone: string;
  level: string;
  discountPercentage: number;
}

export interface ProductSuggestion {
  name: string;
  price: number;
  source: 'history' | 'database';
}
