import { Member } from '../types';

const SHEET_ID = '1fYyfBwvohqw6Upik64Kl7C9zagD_CNKsRuJOiXexfVA';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

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

const parseCSV = (csvText: string): any[] => {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]+/g, ''));
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',');
    if (currentLine.length === headers.length) {
      const obj: any = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j] ? currentLine[j].trim().replace(/['"]+/g, '') : '';
      }
      result.push(obj);
    }
  }
  return result;
};

export const fetchAndValidateMember = async (inputName: string, inputLast4Phone: string): Promise<Member | null> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('Failed to fetch member database');
    
    const text = await response.text();
    const rows = parseCSV(text);

    // Map columns flexibly based on likely header names in the sheet
    // We expect headers roughly like: "Nama", "No HP", "Level", "Diskon"
    const memberData = rows.map(row => {
        // Find keys that likely correspond to our needs
        const nameKey = Object.keys(row).find(k => k.includes('nama') || k.includes('name'));
        const phoneKey = Object.keys(row).find(k => k.includes('hp') || k.includes('phone') || k.includes('wa') || k.includes('nomor'));
        const levelKey = Object.keys(row).find(k => k.includes('level') || k.includes('status'));
        const discountKey = Object.keys(row).find(k => k.includes('diskon') || k.includes('potongan') || k.includes('discount'));

        if (!nameKey || !phoneKey) return null;

        // Parse discount (e.g. "10%" -> 10, "0.1" -> 10)
        let discount = 0;
        const rawDiscount = row[discountKey || ''] || '0';
        if (rawDiscount.includes('%')) {
            discount = parseFloat(rawDiscount.replace('%', ''));
        } else {
            const floatVal = parseFloat(rawDiscount);
            discount = floatVal < 1 ? floatVal * 100 : floatVal;
        }

        return {
            name: row[nameKey],
            phone: row[phoneKey].replace(/[^0-9]/g, ''), // Sanitize phone to numbers only
            level: row[levelKey || ''] || 'Member',
            discountPercentage: isNaN(discount) ? 0 : discount
        } as Member;
    }).filter(m => m !== null) as Member[];

    // Logic: Name contains input (case-insensitive) AND Phone ends with input
    const foundMember = memberData.find(m => 
        m.name.toLowerCase().includes(inputName.toLowerCase()) && 
        m.phone.endsWith(inputLast4Phone)
    );

    return foundMember || null;
  } catch (error) {
    console.error("Member validation error:", error);
    return null;
  }
};