import { CartItem, PriceHistory, ProductSuggestion } from '../types';

const CART_KEY = 'keranjang_kita_cart';
const PRICE_HISTORY_KEY = 'keranjang_kita_prices';
const PRODUCT_DICT_KEY = 'keranjang_kita_product_dict';

// Database Awal (Seed Data) yang diperbanyak
const SEED_PRODUCTS: ProductSuggestion[] = [
  // Makanan Instan & Roti
  { name: 'Indomie Goreng Original', price: 3500, source: 'database' },
  { name: 'Indomie Soto Mie', price: 3500, source: 'database' },
  { name: 'Indomie Ayam Bawang', price: 3500, source: 'database' },
  { name: 'Indomie Kari Ayam', price: 3800, source: 'database' },
  { name: 'Mie Sedaap Goreng', price: 3500, source: 'database' },
  { name: 'Pop Mie Rasa Ayam', price: 6000, source: 'database' },
  { name: 'Roti Tawar Sari Roti', price: 16000, source: 'database' },
  { name: 'Roti Sobek Coklat', price: 18000, source: 'database' },
  
  // Minuman
  { name: 'Aqua Botol 600ml', price: 4000, source: 'database' },
  { name: 'Aqua Botol 1.5L', price: 6500, source: 'database' },
  { name: 'Le Minerale 600ml', price: 3500, source: 'database' },
  { name: 'Teh Pucuk Harum 350ml', price: 4000, source: 'database' },
  { name: 'Teh Botol Sosro Kotak', price: 4500, source: 'database' },
  { name: 'Pocari Sweat 500ml', price: 8500, source: 'database' },
  { name: 'Floridina Orange', price: 3500, source: 'database' },
  { name: 'Susu Bear Brand', price: 10000, source: 'database' },
  { name: 'Ultra Milk Coklat 250ml', price: 7000, source: 'database' },
  { name: 'Yakult (1 Pack)', price: 10500, source: 'database' },
  { name: 'Kopi Kapal Api Special Mix', price: 1500, source: 'database' },
  { name: 'Good Day Cappuccino Botol', price: 7500, source: 'database' },

  // Sembako
  { name: 'Telur Ayam (1 kg)', price: 28000, source: 'database' },
  { name: 'Minyak Goreng Sania 2L', price: 38000, source: 'database' },
  { name: 'Minyak Goreng Bimoli 2L', price: 39000, source: 'database' },
  { name: 'Beras Premium 5kg', price: 75000, source: 'database' },
  { name: 'Gula Pasir Gulaku 1kg', price: 16000, source: 'database' },
  { name: 'Tepung Terigu Segitiga Biru 1kg', price: 14000, source: 'database' },
  { name: 'Garam Dapur Refina', price: 3500, source: 'database' },
  { name: 'Santan Kara 65ml', price: 3500, source: 'database' },
  { name: 'Kecap Manis Bango 550ml', price: 26000, source: 'database' },
  { name: 'Saus Sambal ABC', price: 8000, source: 'database' },
  { name: 'Masako Ayam Sachet', price: 500, source: 'database' },

  // Snack
  { name: 'Chitato Sapi Panggang', price: 11500, source: 'database' },
  { name: 'Qtela Singkong Balado', price: 15000, source: 'database' },
  { name: 'Oreo Original', price: 9500, source: 'database' },
  { name: 'Beng Beng', price: 2500, source: 'database' },
  { name: 'Silverqueen Chunky Bar', price: 25000, source: 'database' },
  { name: 'Taro Net Seaweed', price: 5000, source: 'database' },

  // Kebersihan & Personal Care
  { name: 'Sabun Lifebuoy Cair 450ml', price: 25000, source: 'database' },
  { name: 'Sabun Detol Original', price: 35000, source: 'database' },
  { name: 'Shampoo Pantene 160ml', price: 22000, source: 'database' },
  { name: 'Shampoo Clear Menthol', price: 23000, source: 'database' },
  { name: 'Pasta Gigi Pepsodent 190g', price: 12000, source: 'database' },
  { name: 'Pasta Gigi Ciptadent', price: 8000, source: 'database' },
  { name: 'Deterjen Rinso Bubuk 800g', price: 24000, source: 'database' },
  { name: 'Deterjen Daia Bunga', price: 18000, source: 'database' },
  { name: 'Sunlight Jeruk Nipis 755ml', price: 15000, source: 'database' },
  { name: 'Molto Pewangi Sachet', price: 1000, source: 'database' },
  { name: 'Tisu Wajah Nice 250s', price: 15000, source: 'database' }
];

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

// --- Product Dictionary / Suggestion System ---

export const saveProductToDictionary = (name: string, price: number) => {
  if (!name) return;
  try {
    const rawData = localStorage.getItem(PRODUCT_DICT_KEY);
    let dict: ProductSuggestion[] = rawData ? JSON.parse(rawData) : [];
    
    // Check if exists, update price if so
    const existingIndex = dict.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
    
    if (existingIndex >= 0) {
      dict[existingIndex].price = price; // Update latest price
      // Move to top (most recently used)
      const item = dict.splice(existingIndex, 1)[0];
      dict.unshift(item);
    } else {
      dict.unshift({ name, price, source: 'history' });
    }

    // Limit dictionary size to 200 items to keep it fast
    if (dict.length > 200) dict = dict.slice(0, 200);

    localStorage.setItem(PRODUCT_DICT_KEY, JSON.stringify(dict));
  } catch (error) {
    console.error('Error saving product dict:', error);
  }
};

export const searchProducts = (query: string): ProductSuggestion[] => {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  
  // 1. Load User History
  let history: ProductSuggestion[] = [];
  try {
    const raw = localStorage.getItem(PRODUCT_DICT_KEY);
    history = raw ? JSON.parse(raw) : [];
  } catch (e) { console.error(e); }

  // 2. Combine with Seed Data
  // Priority: History first, then Seed data
  const combined = [...history, ...SEED_PRODUCTS];

  // 3. Filter and Deduplicate (by name)
  const results: ProductSuggestion[] = [];
  const seenNames = new Set<string>();

  for (const item of combined) {
    if (item.name.toLowerCase().includes(lowerQuery) && !seenNames.has(item.name.toLowerCase())) {
      results.push(item);
      seenNames.add(item.name.toLowerCase());
    }
    if (results.length >= 5) break; // Limit to 5 suggestions
  }

  return results;
};

export const getAllProducts = (): ProductSuggestion[] => {
  // 1. Load User History
  let history: ProductSuggestion[] = [];
  try {
    const raw = localStorage.getItem(PRODUCT_DICT_KEY);
    history = raw ? JSON.parse(raw) : [];
  } catch (e) { console.error(e); }

  // 2. Combine with Seed Data
  const combined = [...history, ...SEED_PRODUCTS];

  // 3. Deduplicate
  const uniqueProducts = new Map<string, ProductSuggestion>();
  
  combined.forEach(item => {
    // Gunakan nama lowercase sebagai key untuk deduplikasi
    if (!uniqueProducts.has(item.name.toLowerCase())) {
        uniqueProducts.set(item.name.toLowerCase(), item);
    }
  });

  // 4. Convert to array and sort alphabetically
  return Array.from(uniqueProducts.values()).sort((a, b) => a.name.localeCompare(b.name));
};