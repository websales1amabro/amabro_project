import type { Inquiry, InquiryItem } from '../types/database';

export function generateWhatsAppRFQ(
  inquiry: Inquiry,
  items: InquiryItem[],
  vendorName: string
): string {
  const itemList = items
    .map(
      (it, idx) =>
        `${idx + 1}. *${it.item_name}*\n   - Spesifikasi: ${it.specifications || '-'}\n   - Merek Ref: ${it.brand || '-'}\n   - Qty: *${it.quantity} ${it.unit}*`
    )
    .join('\n\n');

  return `Yth. *${vendorName}*,

Halo, kami dari Tim Pengadaan *PT Automation Solusi Nusantara*.
Mohon bantuan penawaran harga resmi (RFQ) untuk kebutuhan proyek kami (*Ref: ${inquiry.inquiry_number}*):

${itemList}

Mohon dapat mencantumkan:
1. Harga satuan (IDR / Valas jika import)
2. Ketersediaan stok & estimasi Lead Time pengiriman
3. Masa garansi produk
4. Syarat pembayaran & masa berlaku penawaran

Penawaran dapat dikirimkan via balasan chat ini atau email ke purchasing@automationsolusi.co.id.
Terima kasih atas kerja samanya.`;
}

export function generateEmailRFQ(
  inquiry: Inquiry,
  items: InquiryItem[],
  vendorName: string
): string {
  const itemList = items
    .map(
      (it, idx) =>
        `${idx + 1}. ${it.item_name}\n   Spesifikasi: ${it.specifications || '-'}\n   Merek: ${it.brand || '-'}\n   Jumlah: ${it.quantity} ${it.unit}\n`
    )
    .join('\n');

  return `Kepada Yth.
Tim Penjualan / Sales ${vendorName}

Dengan hormat,

Sehubungan dengan kebutuhan komponen otomasi sistem industri kami, kami dari PT Automation Solusi Nusantara bermaksud meminta surat penawaran harga (Request for Quotation - RFQ) dengan rincian kebutuhan sebagai berikut:

Nomor Referensi: ${inquiry.inquiry_number}
Judul Kebutuhan: ${inquiry.title}

DAFTAR KEBUTUHAN ITEM:
${itemList}

Ketentuan yang kami butuhkan dalam surat penawaran:
- Harga satuan dan total sebelum/sesudah PPN
- Ketersediaan stok (Ready Stock / Indent berapa hari/minggu)
- Ketentuan garansi resmi pabrikan
- Termin pembayaran yang berlaku
- Masa berlaku surat penawaran

Surat penawaran resmi dapat dikirimkan ke email purchasing@automationsolusi.co.id sebelum batas waktu ${inquiry.deadline || 'secepatnya'}.

Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.

Hormat kami,
Divisi Purchasing & Procurement
PT Automation Solusi Nusantara`;
}
