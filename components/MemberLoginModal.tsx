import React, { useState } from 'react';
import { X, UserCheck, Loader2, Phone } from 'lucide-react';

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (memberId: string) => Promise<boolean>;
}

const MemberLoginModal: React.FC<MemberLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [memberId, setMemberId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validasi sederhana: minimal 8 digit angka (asumsi no WA/HP)
    if (memberId.length < 5) {
        setError('ID Member atau Nomor WA tidak valid');
        return;
    }

    setIsLoading(true);
    const success = await onLogin(memberId);
    setIsLoading(false);

    if (!success) {
        setError('Member tidak ditemukan. Pastikan nomor/ID sudah terdaftar.');
    } else {
        // Reset form on success
        setMemberId('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya perbolehkan angka
    const val = e.target.value.replace(/[^0-9]/g, '');
    setMemberId(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        <div className="bg-emerald-600 p-6 text-white">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold">Login Member</h2>
                    <p className="text-emerald-100 text-sm mt-1">Dapatkan diskon khusus member!</p>
                </div>
                <button onClick={onClose} className="p-1 bg-emerald-700/50 rounded-full hover:bg-emerald-700 transition-colors">
                    <X size={20} />
                </button>
            </div>
        </div>

        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp / ID Member</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3.5 text-gray-400">
                            <Phone size={18} />
                        </span>
                        <input
                            type="text"
                            value={memberId}
                            onChange={handleInputChange}
                            placeholder="Contoh: 08123456789"
                            inputMode="numeric"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-bold text-lg text-slate-800 placeholder:text-gray-400 placeholder:font-normal"
                            autoFocus
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg font-medium text-center border border-red-100">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !memberId}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all mt-2 active:scale-95"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <UserCheck size={20} />}
                    {isLoading ? 'Mengecek...' : 'Cek Status Member'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default MemberLoginModal;