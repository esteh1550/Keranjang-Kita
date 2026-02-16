import React, { useEffect, useRef, useState } from 'react';
import { X, Check, Search, History } from 'lucide-react';
import { searchProducts } from '../services/storageService';
import { ProductSuggestion } from '../types';

interface ProductModalProps {
  barcode: string | null;
  initialName: string;
  initialPrice: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, price: number) => void;
  isLoading: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  barcode,
  initialName,
  initialPrice,
  isOpen,
  onClose,
  onSave,
  isLoading
}) => {
  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const inputPriceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setPrice(initialPrice);
      setSuggestions([]);
      setShowSuggestions(false);
      // Auto focus price if name exists, otherwise focus name
      setTimeout(() => {
        if (initialName && inputPriceRef.current) {
          inputPriceRef.current.focus();
        }
      }, 300);
    }
  }, [isOpen, initialName, initialPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    
    // Convert price string to number
    const numPrice = parseInt(price.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numPrice)) return;

    onSave(name, numPrice);
  };

  const formatDisplayPrice = (val: string) => {
    // Basic formatting for display while typing
    const number = val.replace(/[^0-9]/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(number, 10));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setPrice(raw);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    
    // Trigger Search
    if (val.length >= 2) {
      const results = searchProducts(val);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (item: ProductSuggestion) => {
    setName(item.name);
    setPrice(item.price.toString());
    setShowSuggestions(false);
    // Focus price input after selection
    if (inputPriceRef.current) {
      inputPriceRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 pointer-events-auto backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 pointer-events-auto transform transition-transform duration-300 ease-out shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 shrink-0"></div>
        
        <div className="flex justify-between items-center mb-6 shrink-0">
           <h2 className="text-xl font-bold text-slate-800">
             {barcode ? 'Produk Ditemukan' : 'Input Manual'}
           </h2>
           <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500">
             <X size={20} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto no-scrollbar pb-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              onFocus={() => name.length >= 2 && setShowSuggestions(true)}
              placeholder="Contoh: Indomie Goreng"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-800"
              disabled={isLoading}
              autoComplete="off"
            />
            {isLoading && <p className="text-xs text-emerald-600 mt-1 animate-pulse">Mencari nama produk...</p>}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {suggestions.map((item, index) => (
                  <li 
                    key={index}
                    onClick={() => selectSuggestion(item)}
                    className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-2">
                       {item.source === 'history' ? <History size={14} className="text-gray-400" /> : <Search size={14} className="text-gray-400" />}
                       <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      Rp {new Intl.NumberFormat('id-ID').format(item.price)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga Satuan (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">Rp</span>
              <input
                ref={inputPriceRef}
                type="text"
                value={formatDisplayPrice(price)}
                onChange={handlePriceChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-lg font-bold text-slate-800"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="pt-4 mt-auto">
            <button
              type="submit"
              disabled={!name || !price}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Check size={20} />
              Tambah ke Keranjang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;