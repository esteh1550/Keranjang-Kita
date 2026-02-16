import React, { useState } from 'react';
import { X, Globe, Search, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { searchGlobalProducts } from '../services/apiService';
import { ApiProduct } from '../types';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      const data = await searchGlobalProducts(query);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Globe size={20} />
                <h2 className="text-lg font-bold">Cek Katalog API</h2>
            </div>
            <button onClick={onClose} className="p-1.5 bg-blue-700 rounded-full hover:bg-blue-800 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ketik nama produk (misal: indomie)..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-800"
                        autoFocus
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading || !query}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Cari'}
                </button>
            </form>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
            {!hasSearched && (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-center">
                    <Globe size={48} className="mb-3 opacity-20" />
                    <p className="text-sm">Cari produk dari database eksternal<br/>(ariph007 API)</p>
                </div>
            )}

            {hasSearched && !isLoading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-center">
                    <AlertCircle size={48} className="mb-3 text-gray-300" />
                    <p className="font-medium">Tidak ada hasil ditemukan.</p>
                    <p className="text-xs text-gray-400 mt-1">Coba kata kunci lain atau cek ejaan.</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="p-3">Nama Produk</th>
                                <th className="p-3 w-24 hidden sm:table-cell">Brand</th>
                                <th className="p-3 text-right">Barcode</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {results.map((item, idx) => (
                                <tr key={idx} className="hover:bg-blue-50 transition-colors group">
                                    <td className="p-3">
                                        <div className="font-medium text-slate-800">{item.product_name || '-'}</div>
                                        <div className="sm:hidden text-xs text-gray-500 mt-0.5">{item.product_brand}</div>
                                    </td>
                                    <td className="p-3 hidden sm:table-cell text-gray-600">
                                        {item.product_brand || '-'}
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-slate-700">{item.product_barcode}</code>
                                            <button 
                                                onClick={() => copyToClipboard(item.product_barcode, idx)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                title="Salin Barcode"
                                            >
                                                {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        
        {/* Footer */}
        {results.length > 0 && (
            <div className="bg-gray-50 p-2 text-center text-xs text-gray-400 border-t border-gray-100">
                Data provided by api-product-indonesia
            </div>
        )}
      </div>
    </div>
  );
};

export default CatalogModal;
