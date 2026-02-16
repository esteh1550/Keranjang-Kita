import { Member } from '../types';

// Endpoint Google Apps Script Web App
const API_URL = 'https://script.google.com/macros/s/AKfycbzUnekW7ysp8-8gToU_p0gyUHTFFxH4LIaiHcq9wFv3ixmtvWnPgwQ8QC03EE2146A9/exec';

export const getMemberSession = (): Member | null => {
  try {
    const data = sessionStorage.getItem('keranjang_kita_member');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveMemberSession = (member: Member) => {
  sessionStorage.setItem('keranjang_kita_member', JSON.stringify(member));
};

export const clearMemberSession = () => {
  sessionStorage.removeItem('keranjang_kita_member');
};

export const fetchAndValidateMember = async (memberId: string): Promise<Member | null> => {
  try {
    // Kirim request ke API Google Apps Script
    // Menambahkan parameter 'id' sesuai dokumentasi
    const response = await fetch(`${API_URL}?id=${encodeURIComponent(memberId)}`);
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const json = await response.json();

    // Cek status response dari API
    if (json.status === 'success' && json.data) {
        return {
            name: json.data.nama_lengkap,
            phone: memberId, // Simpan ID yang digunakan untuk login
            level: 'Member', // Default level, atau bisa ditambahkan di API jika ada
            discountPercentage: typeof json.data.diskon_persen === 'string' 
                ? parseFloat(json.data.diskon_persen) 
                : json.data.diskon_persen
        };
    } else {
        // Jika status 'not_found' atau lainnya
        console.warn('Member check response:', json);
        return null;
    }

  } catch (error) {
    console.error("Member validation error:", error);
    return null;
  }
};