-- ==============================================================================
-- MIGRATION: 20261017000002_site_products.sql
-- Katalog Produk Website & CMS Internal Amabro Bintang Inovasi
-- ==============================================================================

create table if not exists public.site_products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    brand text not null, -- e.g. 'Rosemount', 'Yokogawa', 'ABB', 'Azbil', 'Endress+Hauser', 'SOR', 'Siemens', 'Honeywell', 'Rotork'
    category text not null default 'Instrument Products', -- 'Instrument Products', 'Valve Products'
    model_number text, -- e.g. 'AMS Trex', '3051CD', 'EJA110A', 'TZIDC110', 'YT-3700'
    short_description text,
    description text,
    specifications jsonb default '{}'::jsonb,
    features text[] default '{}',
    image_url text,
    datasheet_url text,
    is_featured boolean not null default true,
    is_published boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.site_products enable row level security;

-- Public can view published products
create policy "Public can read published products"
    on public.site_products for select
    to anon, authenticated
    using (is_published = true);

-- Staff can manage products (CMS)
create policy "Staff can manage products"
    on public.site_products for all
    to authenticated
    using (public.current_role() in ('owner', 'sales', 'engineer'));

-- Seed Real Products from PT. Amabro Bintang Inovasi Official PDF Catalog
insert into public.site_products (
    name, slug, brand, category, model_number, short_description, description, specifications, features, sort_order, is_featured, is_published
) values
(
    'Emerson AMS Trex Device Communicator',
    'emerson-ams-trex-device-communicator',
    'Rosemount',
    'Instrument Products',
    'AMS Trex',
    'HART and Foundation Fieldbus handheld device communicator untuk konfigurasi dan diagnosa transmitter di lapangan.',
    'Emerson AMS Trex Device Communicator memberikan efisiensi tinggi bagi teknisi instrumen di lapangan untuk mengonfigurasi, mengkalibrasi, dan mendiagnosis perangkat HART dan Foundation Fieldbus secara aman dan cepat tanpa memerlukan power supply eksternal.',
    '{"Protocol": "HART & Foundation Fieldbus", "Display": "4.3 inch Resistive Touchscreen VGA", "Battery": "Rechargeable Li-Ion (8+ hours)", "Operating Temp": "-20 to 55°C", "Hazardous Area": "ATEX, CSA, IECEx Intrinsically Safe"}',
    array['Dukungan Power the Loop untuk menguji transmitter tanpa sumber listrik tambahan', 'Diagnostik canggih katup kontrol dan transmitter', 'Layar sentuh responsif bahkan saat menggunakan sarung tangan keselamatan kerja'],
    1, true, true
),
(
    'Emerson Rosemount 3051CD Differential Pressure Transmitter',
    'rosemount-3051cd-differential-pressure-transmitter',
    'Rosemount',
    'Instrument Products',
    '3051CD',
    'Industry standard differential pressure transmitter untuk pengukuran flow, level, dan differential pressure dengan akurasi 0.04%.',
    'Rosemount 3051CD adalah transmitter tekanan diferensial paling terpercaya di dunia industri manufaktur dan pembangkit listrik. Mengintegrasikan teknologi sensor kapasitif silikon yang kokoh dan stabilitas 10 tahun.',
    '{"Accuracy": "Up to 0.04% of span", "Stability": "10-year stability (0.2% of URL)", "Rangedown": "Up to 150:1", "Output": "4-20 mA HART, WirelessHART, FOUNDATION Fieldbus", "Pressure Range": "Up to 2000 psi (137.89 bar)"}',
    array['Desain Coplanar fleksibel untuk manifold terintegrasi', 'Sertifikasi keselamatan SIL 2/3 IEC 61508', 'Diagnosa integritas loop kelistrikan canggih'],
    2, true, true
),
(
    'Rosemount 1056 Dual Channel Liquid Analyzer',
    'rosemount-1056-dual-channel-liquid-analyzer',
    'Rosemount',
    'Instrument Products',
    '1056',
    'Dual channel analyzer untuk pemantauan pH, ORP, Conductivity, Dissolved Oxygen, dan Chlorine secara presisi.',
    'Rosemount 1056 Dual-Input Transmitter menyediakan pengukuran analisis cairan multi-parameter dengan konfigurasi modular. Memudahkan instalasi pada pengolahan air boiler dan limbah industri.',
    '{"Inputs": "Dual sensor inputs", "Parameters": "pH, ORP, Resistivity/Conductivity, DO, Chlorine", "Display": "High contrast LCD", "Enclosure": "NEMA 4X / IP65 weatherproof", "Output": "Dual 4-20 mA with HART"}',
    array['Konfigurasi cepat dengan auto-recognition sensor', 'Mendukung sensor pH/ORP seri Rosemount 3900 dan 396R', 'Penyimpanan kalibrasi data terintegrasi'],
    3, true, true
),
(
    'Yokogawa EJA110A Differential Pressure Transmitter',
    'yokogawa-eja110a-differential-pressure-transmitter',
    'Yokogawa',
    'Instrument Products',
    'EJA110A',
    'High performance differential pressure transmitter dengan resonant silicon sensor DPharp technology.',
    'Yokogawa EJA110A menggunakan teknologi sensor DPharp silikon resonan digital yang memberikan pengukuran tekanan diferensial cairan, gas, atau uap secara stabil dengan pengaruh temperatur minimal.',
    '{"Accuracy": "±0.065% of Span", "Output": "4-20 mA DC with BRAIN or HART protocol", "Span Limits": "0.5 to 500 kPa", "Static Pressure Rating": "Up to 16 MPa (2300 psi)", "Enclosure": "IP67 and NEMA 4X"}',
    array['Teknologi sensor resonan digital tanpa sinyal konversi A/D analog', 'Stabilitas jangka panjang terverifikasi di industri berat', 'Kompatibel dengan communicator Yokogawa BT200'],
    4, true, true
),
(
    'Yokogawa BT200 Brain & HART Terminal Communicator',
    'yokogawa-bt200-communicator',
    'Yokogawa',
    'Instrument Products',
    'BT200',
    'Portable terminal operator untuk setup, konfigurasi parameter, dan monitoring transmitter Yokogawa di lapangan.',
    'Yokogawa BT200 BRAIN Terminal adalah perangkat handheld handal yang dirancang khusus untuk teknisi pemeliharaan instrumen pabrik untuk membaca data pengukuran dan mengatur parameter lapangan.',
    '{"Protocol": "BRAIN Communication", "Display": "21 characters x 8 lines LCD", "Power": "5 dry alkaline batteries (AA)", "Dimensions": "228 x 110 x 51 mm", "Weight": "Approx. 700g"}',
    array['Konfigurasi parameter cepat dan upload/download setting', 'Bodi tahan benturan untuk lingkungan pabrik ekstrem', 'Navigasi menu alfanumerik intuitif'],
    5, true, true
),
(
    'ABB TZIDC110 V18345 Digital Valve Positioner',
    'abb-tzidc110-v18345-digital-valve-positioner',
    'ABB',
    'Valve Products',
    'TZIDC110 (V18345)',
    'Intelligent electro-pneumatic digital positioner untuk katup kontrol linear dan rotary.',
    'ABB TZIDC110 (V18345) adalah positioner katup cerdas digital yang dilengkapi dengan autostroke kalibrasi otomatis dalam hitungan detik. Mengoptimalkan konsumsi udara instrumen hingga nol saat posisi katup stabil.',
    '{"Input Signal": "4-20 mA with HART", "Air Supply": "1.4 to 6 bar (20 to 90 psi)", "Travel Range": "Linear 10-150 mm, Rotary up to 120°", "Protection": "IP65 / NEMA 4X", "Ex-Proof": "ATEX / IECEx Intrinsically Safe"}',
    array['Fitur Autostroke: kalibrasi otomatis tanpa membuka casing', 'Konsumsi udara nol pada titik steady-state menghemat biaya kompresor', 'Ketahanan getaran tinggi hingga 10g pada 80 Hz'],
    6, true, true
),
(
    'Azbil AVP100-H Smart Valve Positioner 100 Series',
    'azbil-avp100-h-smart-valve-positioner',
    'Azbil',
    'Valve Products',
    'AVP100-H',
    'Smart pneumatic positioner dengan kalibrasi digital mandiri untuk control valve industri proses.',
    'Azbil AVP100-H Smart Valve Positioner menawarkan keandalan kontrol katup pneumatik kelas industri Jepang. Dilengkapi dengan diagnostik internal dan deteksi kebocoran seal katup secara dini.',
    '{"Input Signal": "4-20 mA DC", "Communication": "HART / DE", "Supply Air Pressure": "140 to 700 kPa", "Stroke Range": "10 to 100 mm", "Ambient Temp": "-40 to 80°C"}',
    array['Kalibrasi mandiri yang cepat dengan tombol setting eksternal', 'Desain pneumatik tangguh dengan filtrasi internal', 'Presisi positioning respon tinggi terhadap sinyal kontrol'],
    7, true, true
),
(
    'Endress+Hauser Promass 83F Coriolis Mass Flowmeter',
    'endress-hauser-promass-83f-coriolis-flowmeter',
    'Endress+Hauser',
    'Instrument Products',
    'Promass 83F',
    'Flowmeter massa Coriolis akurasi tertinggi untuk pengukuran cairan dan gas bersuhu ekstrem.',
    'Endress+Hauser Promass 83F adalah solusi pengukuran aliran massa cairan kimia, minyak, dan gas dengan toleransi kesalahan hingga 0.05%. Mengukur massa, volume, densitas, dan temperatur sekaligus dalam satu sensor.',
    '{"Measuring Principle": "Coriolis Mass Flow", "Accuracy": "±0.05% o.r. (premium calibrated)", "Process Temp": "-200 to +350°C", "Pressure Rating": "Up to PN 100 / Cl 600", "Outputs": "HART, Modbus, Profibus DP/PA, Foundation Fieldbus"}',
    array['Pengukuran multivariabel simultan (massa, densitas, temperatur)', 'Tidak memerlukan straight pipe run di hulu maupun hilir', 'Sensor tahan korosi dengan material Alloy C22 dan Stainless Steel 316L'],
    8, true, true
),
(
    'Endress+Hauser Levelflex FMP51 Guided Wave Radar',
    'endress-hauser-levelflex-fmp51-radar-level',
    'Endress+Hauser',
    'Instrument Products',
    'FMP51',
    'Guided wave radar level measurement untuk cairan pada kondisi suhu dan tekanan ekstrem.',
    'Endress+Hauser Levelflex FMP51 mengukur ketinggian permukaan cairan dan antarmuka (interface) pada tangki proses dan bejana reaktor bertekanan tinggi tanpa terpengaruh uap, busa, atau perubahan densitas.',
    '{"Measurement Range": "Rod probe up to 4m, Rope probe up to 45m", "Process Temp": "-50 to +200°C (-58 to +392°F)", "Process Pressure": "Vacuum up to 40 bar (580 psi)", "Accuracy": "±2 mm", "Protection": "SIL 2 / SIL 3 IEC 61508"}',
    array['Teknologi Multi-Echo Tracking untuk keandalan sinyal pantulan', 'Dapat mengukur interface cairan bertingkat (minyak dan air)', 'Integrasi Heartbeat Technology untuk verifikasi tanpa interupsi proses'],
    9, true, true
),
(
    'SOR 101NN Differential Pressure Switch',
    'sor-101nn-differential-pressure-switch',
    'SOR',
    'Instrument Products',
    '101NN-K45-N4-F1A',
    'Heavy-duty differential pressure switch dengan mekanisme diaphragm-piston untuk safety interlock pabrik.',
    'SOR 101NN Series Pressure Switches adalah standar proteksi keselamatan pada industri pembangkit listrik (PLN), pabrik kertas, dan kimia. Dirancang tahan cuaca ekstrem dan tahan getaran tinggi.',
    '{"Adjustment Range": "0.5 to 150 psi (35 mbar to 10 bar)", "Proof Pressure": "Up to 3000 psi", "Switch Contacts": "SPDT or DPDT snap-action", "Housing": "NEMA 4, 4X, IP66 cast aluminium", "Process Connection": "1/4 NPT Female"}',
    array['Mekanisme sensor statis terbukti handal tanpa gesekan mekanis berlebih', 'Tersedia opsi explosion proof (101L Series)', 'Setting setpoint dapat disetel dengan akurat di lapangan'],
    10, true, true
),
(
    'Siemens SIPART PS2 Valve Positioner 6DR5',
    'siemens-sipart-ps2-valve-positioner',
    'Siemens',
    'Valve Products',
    'SIPART PS2 (6DR5010/5200)',
    'Positioner katup pneumatik terlaris di dunia dengan konsumsi udara minimal dan fungsi diagnosa online.',
    'Siemens SIPART PS2 adalah positioner katup elektro-pneumatik yang sangat fleksibel untuk katup gerak lurus (linear) dan putar (part-turn). Menggunakan piezo valve yang menghemat pemakaian udara tekan hingga 90%.',
    '{"Stroke Range": "3 to 130 mm (linear), 30 to 100° (rotary)", "Control Signal": "4-20 mA HART, Profibus PA, Foundation Fieldbus", "Air Supply": "1.4 to 7 bar", "Enclosure": "Makrolon, Aluminium, or Stainless Steel", "Certifications": "SIL 2, ATEX, FM, CSA"}',
    array['Teknologi Piezo valve revolusioner dengan konsumsi udara mendekati nol saat diam', 'Inisialisasi otomatis hanya dengan menekan 3 tombol', 'Diagnostik keausan valve, trend gesekan, dan partial stroke test (PST)'],
    11, true, true
),
(
    'Rotork YT-3700 Smart Valve Positioner Aluminium',
    'rotork-yt-3700-smart-valve-positioner',
    'Rotork',
    'Valve Products',
    'YT-3700',
    'Smart electro-pneumatic positioner dengan LCD visual dan limit switch terintegrasi untuk kontrol presisi.',
    'Rotork YT-3700 Series mengontrol pergerakan katup kontrol pneumatik dengan akurat berdasarkan sinyal 4-20 mA. Casing aluminium kokoh IP66 cocok untuk pabrik kimia, boiler pembangkit, dan industri semen.',
    '{"Input Signal": "4-20 mA DC with HART 7", "Supply Pressure": "1.4 to 7.0 bar", "Feedback Options": "Analog 4-20 mA & Mechanical/Proximity Limit Switches", "Housing": "Aluminium Diecast IP66", "Display": "Graphic LCD with push buttons"}',
    array['Menu LCD grafik besar yang mudah dibaca di lapangan', 'Tersedia opsi remote mounting sensor YT-3702 untuk area suhu/getaran tinggi', 'Dukungan Auto-Tuning respons katup cepat tanpa overshooting'],
    12, true, true
),
(
    'Rotork YT-2600 Aluminium Ex d Explosion Proof Positioner',
    'rotork-yt-2600-explosion-proof-positioner',
    'Rotork',
    'Valve Products',
    'YT-2600',
    'Flameproof & explosion proof smart valve positioner bersertifikasi Ex d IIC T6 untuk area berbahaya gas dan debu.',
    'Rotork YT-2600 dirancang khusus untuk memenuhi standar keselamatan ledakan paling ketat pada fasilitas refinery minyak, gas, kimia, dan boiler biomassa bertekanan.',
    '{"Protection Type": "Ex d IIC T6 Gb / Ex tb IIIC T85°C Db", "Input Signal": "4-20 mA with HART", "Stroke": "10-150 mm (linear), 0-90° (rotary)", "Operating Temp": "-30 to +80°C", "Enclosure": "Heavy Duty Aluminium Diecast"}',
    array['Sertifikasi tahan ledakan Flameproof Ex d resmi internasional', 'Performa stabil pada lingkungan korosif dan berbahaya', 'Indikator tekanan udara gauge ganda terpasang rapi'],
    13, true, true
),
(
    'Honeywell STG700 SmartLine Gauge Pressure Transmitter',
    'honeywell-stg700-smartline-pressure-transmitter',
    'Honeywell',
    'Instrument Products',
    'STG700',
    'Gauge pressure transmitter dengan modularitas tinggi, akurasi 0.065%, dan layar grafis canggih.',
    'Honeywell STG700 SmartLine menyediakan pengukuran tekanan fluida pipa dan tangki dengan stabilitas jangka panjang hingga 0.02% URL per tahun. Komponen modular memudahkan penggantian sensor tanpa kalibrasi ulang.',
    '{"Span Limit": "Up to 10,000 psi (690 bar)", "Accuracy": "±0.065% standard", "Stability": "±0.02% of URL per year for 10 years", "Output": "4-20 mA HART, DE, Foundation Fieldbus", "Total Response Time": "80 ms"}',
    array['Desain modular: sensor dan elektronik dapat diganti terpisah dengan mudah', 'Layar LCD grafis dengan diagnostik pesan kesalahan teks jelas', 'Kemampuan withstand overpressure ekstrim tanpa merusak kalibrasi'],
    14, true, true
)
on conflict (slug) do nothing;
