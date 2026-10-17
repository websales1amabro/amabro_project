/**
 * Konversi angka rupiah ke teks terbilang Bahasa Indonesia resmi
 * Contoh: 288600000 -> "Dua Ratus Delapan Puluh Delapan Juta Enam Ratus Ribu Rupiah"
 */
export function terbilang(nominal: number): string {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function toWords(n: number): string {
    if (n < 12) {
      return bilangan[n];
    } else if (n < 20) {
      return bilangan[n - 10] + ' Belas';
    } else if (n < 100) {
      return bilangan[Math.floor(n / 10)] + ' Puluh ' + bilangan[n % 10];
    } else if (n < 200) {
      return 'Seratus ' + toWords(n - 100);
    } else if (n < 1000) {
      return bilangan[Math.floor(n / 100)] + ' Ratus ' + toWords(n % 100);
    } else if (n < 2000) {
      return 'Seribu ' + toWords(n - 1000);
    } else if (n < 1000000) {
      return toWords(Math.floor(n / 1000)) + ' Ribu ' + toWords(n % 1000);
    } else if (n < 1000000000) {
      return toWords(Math.floor(n / 1000000)) + ' Juta ' + toWords(n % 1000000);
    } else if (n < 1000000000000) {
      return toWords(Math.floor(n / 1000000000)) + ' Miliar ' + toWords(n % 1000000000);
    } else {
      return toWords(Math.floor(n / 1000000000000)) + ' Triliun ' + toWords(n % 1000000000000);
    }
  }

  const rounded = Math.round(nominal);
  if (rounded <= 0) return 'Nol Rupiah';
  return (toWords(rounded).trim().replace(/\s+/g, ' ') + ' Rupiah');
}

export const terbilangRupiah = terbilang;

