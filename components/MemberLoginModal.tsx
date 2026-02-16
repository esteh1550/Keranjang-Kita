import React, { useState } from 'react';
import { X, UserCheck, Loader2 } from 'lucide-react';

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (name: string, last4Phone: string) => Promise<boolean>;
}

const MemberLoginModal: React.FC<MemberLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (name.length < 3) {
        setError('Nama minimal 3 karakter');
        return;
    }
    if (phone.length !== 4) {
        setError('Masukkan tepat 4 digit terakhir nomor HP');
        return;
    }

    setIsLoading(true);
    const success = await onLogin(name, phone);
    setIsLoading(false);

    if (!success) {
        setError('Member tidak ditemukan. Periksa nama dan 4 digit terakhir nomor HP.');
    } else {
        // Reset form on success
        setName('');
        setPhone('');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPhone(val);
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Member</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Budi"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-800 placeholder:text-gray-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">4 Digit Terakhir No. HP</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="Contoh: 1234"
                        inputMode="numeric"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-bold tracking-widest text-center text-lg text-slate-800 placeholder:text-gray-400"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg font-medium text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !name || !phone}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all mt-2"
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