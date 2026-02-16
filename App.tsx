import React, { useState, useEffect, useMemo } from 'react';
import { Scan, Trash2, Plus, Minus, ShoppingCart, ShoppingBag, XCircle, User, LogOut, Crown } from 'lucide-react';
import Scanner from './components/Scanner';
import ProductModal from './components/ProductModal';
import MemberLoginModal from './components/MemberLoginModal';
import { CartItem, Member } from './types';
import { saveCart, loadCart, savePrice, getPriceForBarcode, saveProductToDictionary } from './services/storageService';
import { fetchProductByBarcode } from './services/apiService';
import { fetchAndValidateMember, getMemberSession, saveMemberSession, clearMemberSession } from './services/memberService';

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showMemberLogin, setShowMemberLogin] = useState(false);
  
  // Member State
  const [member, setMember] = useState<Member | null>(null);

  // Modal State
  const [currentBarcode, setCurrentBarcode] = useState<string | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalPrice, setModalPrice] = useState('');
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Initialize cart and member from storage
  useEffect(() => {
    const storedCart = loadCart();
    setCart(storedCart);

    const storedMember = getMemberSession();
    if (storedMember) {
      setMember(storedMember);
    }
  }, []);

  // Update storage when cart changes
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const subTotalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!member) return 0;
    return subTotalAmount * (member.discountPercentage / 100);
  }, [subTotalAmount, member]);

  const totalAmount = subTotalAmount - discountAmount;

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handleScanSuccess = async (barcode: string) => {
    setIsScanning(false);
    setCurrentBarcode(barcode);
    
    // Check if we have this price saved locally
    const savedPrice = getPriceForBarcode(barcode);
    if (savedPrice) {
      setModalPrice(savedPrice.toString());
    } else {
      setModalPrice('');
    }

    // Try to find name in API
    setIsLoadingProduct(true);
    setModalName('');
    setShowModal(true);

    const apiName = await fetchProductByBarcode(barcode);
    setIsLoadingProduct(false);
    
    if (apiName) {
      setModalName(apiName);
    }
  };

  const handleManualAdd = () => {
    setCurrentBarcode(null);
    setModalName('');
    setModalPrice('');
    setIsLoadingProduct(false);
    setShowModal(true);
  };

  const addToCart = (name: string, price: number) => {
    if (currentBarcode) {
      savePrice(currentBarcode, price);
    }
    
    // Save to product dictionary for future suggestions
    saveProductToDictionary(name, price);

    setCart(prev => {
      // Check if item exists (by barcode if available, else by name)
      const existingIndex = prev.findIndex(item => 
        (currentBarcode && item.barcode === currentBarcode) || 
        (!currentBarcode && item.name.toLowerCase() === name.toLowerCase() && item.price === price)
      );

      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      } else {
        return [{
          id: currentBarcode || Date.now().toString(),
          barcode: currentBarcode || undefined,
          name,
          price,
          quantity: 1,
          addedAt: Date.now()
        }, ...prev];
      }
    });

    setShowModal(false);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setShowClearConfirm(false);
  };

  const handleMemberLogin = async (memberId: string): Promise<boolean> => {
    const foundMember = await fetchAndValidateMember(memberId);
    if (foundMember) {
      setMember(foundMember);
      saveMemberSession(foundMember);
      setShowMemberLogin(false);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setMember(null);
    clearMemberSession();
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto">
            {/* Title & Items Count */}
            <div className="px-4 pt-4 pb-2 flex justify-between items-end">
                <h1 className="text-emerald-600 font-bold tracking-tight text-lg flex items-center gap-2">
                    <ShoppingBag size={20} />
                    Keranjang Kita
                </h1>
                <span className="text-gray-500 text-sm font-medium">{totalItems} Barang</span>
            </div>

            {/* Total Amount (Main) */}
            <div className="px-4 pb-2">
                <div className="text-slate-800 text-4xl font-bold tracking-tight">
                    {formatRupiah(totalAmount)}
                </div>
            </div>

            {/* Member Bar */}
            <div className={`px-4 pb-3 border-t border-gray-100 mt-2 pt-2 ${member ? 'bg-amber-50' : ''}`}>
                {member ? (
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-amber-700">
                            <Crown size={16} className="fill-amber-500 text-amber-600" />
                            <div className="text-sm font-medium leading-tight">
                                <span className="block font-bold">{member.name}</span>
                                <span className="text-xs opacity-90">{member.level} • Diskon {member.discountPercentage}%</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="text-xs text-gray-500 underline decoration-gray-300 hover:text-red-500"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Punya member?</span>
                        <button 
                            onClick={() => setShowMemberLogin(true)}
                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-700 transition-colors"
                        >
                            <User size={14} /> Login Member
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center opacity-80">
            <div className="w-48 h-48 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
              <ShoppingCart size={80} className="text-emerald-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Keranjang Kosong</h3>
            <p className="text-gray-500 max-w-[250px]">
              Belum ada barang nih. Yuk, scan barang pertamamu!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                   <div className="pr-8">
                     <h3 className="font-semibold text-slate-800 text-lg leading-tight mb-1">{item.name}</h3>
                     <p className="text-gray-500 text-sm">{formatRupiah(item.price)} / pcs</p>
                   </div>
                   <button 
                     onClick={() => removeItem(item.id)}
                     className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm text-emerald-600 active:scale-95 transition-transform"
                    >
                      <Minus size={18} strokeWidth={3} />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-800 text-lg">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-10 h-10 flex items-center justify-center bg-emerald-600 border border-emerald-600 rounded-lg shadow-sm text-white active:scale-95 transition-transform"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium mb-0.5">Subtotal</p>
                    <p className="text-lg font-bold text-emerald-600">{formatRupiah(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
                <div className="flex justify-between text-gray-600">
                    <span>Total (Kotor)</span>
                    <span>{formatRupiah(subTotalAmount)}</span>
                </div>
                {member && discountAmount > 0 && (
                    <div className="flex justify-between text-red-500 font-medium">
                        <span>Potongan Member ({member.discountPercentage}%)</span>
                        <span>- {formatRupiah(discountAmount)}</span>
                    </div>
                )}
                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-lg">Total Bayar</span>
                    <span className="font-bold text-slate-800 text-2xl">{formatRupiah(totalAmount)}</span>
                </div>
            </div>

            <div className="pt-2 pb-4">
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-3 text-red-500 font-medium flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={18} />
                Bersihkan Keranjang
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-4">
        <button
           onClick={handleManualAdd}
           className="bg-white text-emerald-600 p-4 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all transform hover:scale-105"
           aria-label="Input Manual"
        >
          <Plus size={24} />
        </button>
        <button 
          onClick={() => setIsScanning(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-5 rounded-full shadow-xl shadow-emerald-200 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
          aria-label="Scan Barcode"
        >
          <Scan size={32} />
        </button>
      </div>

      {/* Scanner Overlay */}
      {isScanning && (
        <Scanner 
          onScanSuccess={handleScanSuccess}
          onClose={() => setIsScanning(false)}
        />
      )}

      {/* Input Modal */}
      <ProductModal
        barcode={currentBarcode}
        initialName={modalName}
        initialPrice={modalPrice}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={addToCart}
        isLoading={isLoadingProduct}
      />

      {/* Member Login Modal */}
      <MemberLoginModal
        isOpen={showMemberLogin}
        onClose={() => setShowMemberLogin(false)}
        onLogin={handleMemberLogin}
      />

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto text-red-500">
               <XCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Hapus Semua Barang?</h3>
            <p className="text-center text-gray-500 mb-6">
              Apakah kamu yakin ingin menghapus semua barang di keranjang? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={clearCart}
                className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;