import React, { useEffect, useState } from 'react';
import { X, Search, Plus, ShoppingBag } from 'lucide-react';
import { getAllProducts } from '../services/storageService';
import { ProductSuggestion } from '../types';

interface ProductListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (name: string, price: number) => void;
}

const ProductListModal: React.FC<ProductListModalProps> = ({ isOpen, onClose, onAddProduct }) => {
  const [products, setProducts] = useState<ProductSuggestion[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductSuggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      const all = getAllProducts();
      setProducts(all);
      setFilteredProducts(all);
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredProducts(products);
    } else {
      const lower = term.toLowerCase();
      const filtered = products.filter(p => p.name.toLowerCase().includes(lower));
      setFilteredProducts(filtered);
    }
  };

  const handleAdd = (product: ProductSuggestion) => {
    onAddProduct(product.name, product.price);
    // Optional: Show a small toast or vibration feedback
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/50 pointer-events-auto backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-md h-[90vh] sm:h-[80vh] sm:rounded-2xl rounded-t-2xl pointer-events-auto shadow-2xl flex flex-col relative animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl z-10">
           <div className="flex items-center gap-2 text-emerald-600">
             <ShoppingBag size={20} />
             <h2 className="text-lg font-bold text-slate-800">Daftar Produk</h2>
           </div>
           <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
             <X size={20} />
           </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-gray-50">
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Cari nama barang..." 
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-slate-800"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
               <Search size={48} className="mb-2 opacity-20" />
               <p>Produk tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredProducts.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                   <div className="overflow-hidden">
                      <p className="font-medium text-slate-800 truncate">{item.name}</p>
                      <p className="text-sm text-emerald-600 font-bold">{formatRupiah(item.price)}</p>
                   </div>
                   <button 
                     onClick={() => handleAdd(item)}
                     className="p-2.5 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-600 hover:text-white transition-colors active:scale-95"
                     aria-label="Tambah ke keranjang"
                   >
                     <Plus size={20} />
                   </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="p-3 bg-gray-50 text-center text-xs text-gray-400 rounded-b-2xl">
           Menampilkan {filteredProducts.length} produk
        </div>
      </div>
    </div>
  );
};

export default ProductListModal;