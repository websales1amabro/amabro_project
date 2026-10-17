# Automation Sales Flow & Web Portal

Aplikasi manajemen penawaran harga, alur transaksi, dan portal publik untuk perusahaan di bidang **Industrial Automation & Systems Integration**, dibangun berdasarkan PRD versi 1.2.

---

## 🏛️ Arsitektur Proyek

```
Project Automation Amabro/
├── apps/
│   ├── internal/        # Aplikasi Internal Tim (React 19 + Vite 8 + Tailwind CSS v4)
│   │   ├── src/
│   │   │   ├── components/  # Layout, Sidebar, Header, Modals
│   │   │   ├── context/     # AuthContext (5 Role + Interactive Role Switcher)
│   │   │   ├── pages/       # Dashboard, Kanban, Inquiries, Detail BOM, Customer, Vendor, Quotation, Approval
│   │   │   ├── services/    # Data services (Dual mode: Supabase / persistent localStorage)
│   │   │   └── utils/       # RFQ Generator, Terbilang Rupiah
│   │   └── .env.example
│   │
│   └── website/         # Website Publik (Next.js 16 App Router + Tailwind CSS)
│       ├── src/
│       │   ├── app/         # Beranda, Layanan, Portofolio, Tentang Kami, Kontak, Minta Penawaran, API
│       │   ├── components/  # Navbar, Footer, Floating WhatsApp Button
│       │   └── lib/         # Public Supabase Client
│       └── .env.example
│
├── supabase/
│   ├── migrations/      # 20261017000000_initial_schema.sql (RLS 5 Role, Atomic Sequence, Secret Tables)
│   └── functions/       # submit_inquiry (Turnstile Anti-spam & Server Service Role)
│
├── .env.example         # Master template variabel lingkungan
└── package.json         # Root scripts shortcut
```

---

## 🚀 Fitur yang Telah Dibangun

### 1. Fase 1A (MVP Inti Penawaran & Transaksi)
- **F1: Data Customer & Vendor**: CRUD profil perusahaan, kontak PIC, NPWP, dan termin pembayaran.
- **F2: Inquiry Masuk**: Form inquiry dengan penomoran otomatis berurutan (`INQ/YYYY/MM/0001`), filter sumber (Website vs Internal).
- **F3: Analisis Teknis V1/V2**: Checklist kelayakan teknis (proteksi lingkungan IP54/IP65, protokol komunikasi Profinet/Modbus, daya/safety) dan Bill of Materials (BOM).
- **F4: Vendor Sourcing V3 & RFQ**: Generator pesan RFQ 1-klik untuk WhatsApp dan Email, komparasi harga multi-supplier, dan tombol pemilihan vendor terpilih.
- **F5: Analisis Komersial V4 (Rahasia Owner)**: Kalkulator interaktif modal cost, slider target margin (5%-60%), slider cadangan risiko (0%-20%), perhitungan otomatis Harga Jual, Harga Minimum (batas bawah), dan Ruang Negosiasi Sales.
- **F6: Dua Dokumen Quotation**:
  - *Customer Quotation*: Penawaran resmi ber-kop surat siap cetak A4/PDF, tarif PPN 11%, dan nominal Terbilang otomatis.
  - *Internal Control Quotation*: Dokumen rahasia kontrol harga modal dan margin per item.
  - *Editor Syarat & Ketentuan*: Garansi 12 bulan, tempo 30 hari pasca BAST, pengiriman DDP.
- **F7: Owner Approval Center**: Otorisasi Owner (Approve, Minta Revisi dengan catatan wajib, atau Reject) beserta rekam jejak audit.
- **F8: Kirim ke Customer**: Penawaran terkunci dan tidak dapat dikirim sebelum status `Approved` oleh Owner.
- **F9: Negosiasi & Deal**: Pencatatan counter-offer customer, deteksi otomatis pelanggaran harga minimum, serta penandaan deal Won / Lost beserta alasan.

### 2. Fase 1B (Website Publik & Form Inquiry)
- **Halaman Profil Publik**: Beranda, Layanan/Produk Otomasi, Portofolio Studi Kasus, Tentang Kami, dan Kontak.
- **Tombol WhatsApp Mengambang**: Akses komunikasi langsung dengan animasi indikator aktif.
- **Form Permintaan Penawaran Publik (`/minta-penawaran`)**: Dilengkapi anti-spam *honeypot trap*, validasi input, nomor referensi instan, dan integrasi otomatis ke pipeline internal.
- **Edge Function `submit_inquiry`**: Proteksi server-side token Cloudflare Turnstile, pencocokan customer otomatis, dan pembuatan record inquiry.

---

## ⚡ Panduan Menjalankan di Lokal

### Menjalankan Aplikasi Internal (Tim Sales/Owner/Engineer)
```bash
npm run dev:internal
# Akses di browser: http://localhost:5173
```
*Gunakan menu "Mode Peran (Role)" di sidebar kiri untuk menguji tampilan dan pembatasan hak akses 5 peran (Owner, Sales, Engineer, Purchasing, Finance).*

### Menjalankan Website Publik
```bash
npm run dev:website
# Akses di browser: http://localhost:3000
```

### Build Produksi Keduanya
```bash
npm run build
```

---

## 🔐 Keamanan & Aturan Row Level Security (RLS)
- Data sensitif modal cost, margin, dan harga minimum dienkapsulasi pada tabel `commercial_analysis` dan `internal_quotations`.
- Role `sales` dan `engineer` tidak memiliki akses baca/tulis ke tabel komersial rahasia.
- Pengunjung website publik (role `anon`) hanya dapat membaca tabel CMS berstatus `is_published = true` (`site_settings`, `site_services`, `site_projects`) dan tidak dapat membaca tabel transaksi internal apapun.
