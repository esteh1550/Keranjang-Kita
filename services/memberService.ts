import { Member } from '../types';

// ID Sheet database member
const SHEET_ID = '1fYyfBwvohqw6Upik64Kl7C9zagD_CNKsRuJOiXexfVA';

// Menggunakan endpoint gviz/tq karena lebih stabil untuk fetch data publik dan menghindari isu CORS
// dibandingkan endpoint /export?format=csv biasa.
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

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

/**
 * Custom CSV Parser
 * Diperlukan karena data dari Google Sheets seringkali mengandung kutipan (quotes)
 * jika cell mengandung koma, yang akan merusak parser split(',') biasa.
 */
const splitCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes; // Toggle status quote
    } else if (char === ',' && !inQuotes) {
      // Jika ketemu koma dan TIDAK di dalam quote, berarti pemisah kolom
      result.push(current.trim().replace(/^"|"$/g, '')); // Hapus quote pembungkus jika ada
      current = '';
    } else {
      current += char;
    }
  }
  // Push kolom terakhir
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
};

const parseCSV = (csvText: string): any[] => {
  // Split per baris, filter baris kosong
  const lines = csvText.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Ambil header dari baris pertama
  const headers = splitCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = splitCSVLine(lines[i]);
    
    // Pastikan baris memiliki data
    if (currentLine.length > 0) {
      const obj: any = {};
      // Map data ke header. Gunakan index header untuk keamanan.
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j] || '';
      }
      result.push(obj);
    }
  }
  return result;
};

export const fetchAndValidateMember = async (inputName: string, inputLast4Phone: string): Promise<Member | null> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch member database: ${response.status}`);
    }
    
    const text = await response.text();
    const rows = parseCSV(text);

    // Mapping kolom yang fleksibel (case-insensitive & loose matching) untuk antisipasi nama kolom beda dikit
    const memberData = rows.map(row => {
        const keys = Object.keys(row);
        
        // Cari key yang cocok dengan kriteria
        const nameKey = keys.find(k => k.includes('nama') || k.includes('name'));
        const phoneKey = keys.find(k => k.includes('hp') || k.includes('phone') || k.includes('wa') || k.includes('nomor') || k.includes('telp'));
        const levelKey = keys.find(k => k.includes('level') || k.includes('status') || k.includes('tipe'));
        const discountKey = keys.find(k => k.includes('diskon') || k.includes('potongan') || k.includes('discount'));

        // Nama dan HP wajib ada
        if (!nameKey || !phoneKey) return null;

        // Parse diskon
        let discount = 0;
        const rawDiscount = row[discountKey || ''] || '0';
        
        if (typeof rawDiscount === 'string' && rawDiscount.includes('%')) {
            discount = parseFloat(rawDiscount.replace('%', ''));
        } else {
            const floatVal = parseFloat(rawDiscount);
            // Asumsi: jika < 1 berarti desimal (0.1 = 10%), jika >= 1 berarti integer (10 = 10%)
            discount = floatVal < 1 && floatVal > 0 ? floatVal * 100 : floatVal;
        }

        return {
            name: row[nameKey],
            phone: row[phoneKey].replace(/[^0-9]/g, ''), // Hanya ambil angka
            level: row[levelKey || ''] || 'Member',
            discountPercentage: isNaN(discount) ? 0 : discount
        } as Member;
    }).filter(m => m !== null) as Member[];

    // Logika Pencarian:
    // 1. Nama mengandung input user (case-insensitive)
    // 2. Nomor HP berakhiran dengan 4 digit input user
    const cleanInputName = inputName.trim().toLowerCase();
    
    const foundMember = memberData.find(m => {
        const mName = m.name.toLowerCase();
        // Cek nama (contains) dan HP (endsWith)
        return mName.includes(cleanInputName) && m.phone.endsWith(inputLast4Phone);
    });

    return foundMember || null;
  } catch (error) {
    console.error("Member validation error:", error);
    return null;
  }
};