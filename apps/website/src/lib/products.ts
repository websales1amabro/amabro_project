import { supabase } from './supabase';

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  model_number?: string | null;
  short_description?: string | null;
  description?: string | null;
  specifications?: Record<string, string> | null;
  features?: string[] | null;
  image_url?: string | null;
  datasheet_url?: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
}

export const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-001',
    name: 'Emerson AMS Trex Device Communicator',
    slug: 'emerson-ams-trex-device-communicator',
    brand: 'Rosemount',
    category: 'Instrument Products',
    model_number: 'AMS Trex',
    short_description: 'HART and Foundation Fieldbus handheld device communicator untuk konfigurasi dan diagnosa transmitter di lapangan.',
    description: 'Emerson AMS Trex Device Communicator memberikan efisiensi tinggi bagi teknisi instrumen di lapangan untuk mengonfigurasi, mengkalibrasi, dan mendiagnosis perangkat HART dan Foundation Fieldbus secara aman dan cepat tanpa memerlukan power supply eksternal.',
    specifications: {
      'Protocol': 'HART & Foundation Fieldbus',
      'Display': '4.3 inch Resistive Touchscreen VGA',
      'Battery': 'Rechargeable Li-Ion (8+ hours)',
      'Operating Temp': '-20 to 55°C',
      'Hazardous Area': 'ATEX, CSA, IECEx Intrinsically Safe'
    },
    features: [
      'Dukungan Power the Loop untuk menguji transmitter tanpa sumber listrik tambahan',
      'Diagnostik canggih katup kontrol dan transmitter',
      'Layar sentuh responsif bahkan saat menggunakan sarung tangan kerja'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 1
  },
  {
    id: 'prod-002',
    name: 'Emerson Rosemount 3051CD Differential Pressure Transmitter',
    slug: 'rosemount-3051cd-differential-pressure-transmitter',
    brand: 'Rosemount',
    category: 'Instrument Products',
    model_number: '3051CD',
    short_description: 'Industry standard differential pressure transmitter untuk pengukuran flow, level, dan differential pressure dengan akurasi 0.04%.',
    description: 'Rosemount 3051CD adalah transmitter tekanan diferensial paling terpercaya di dunia industri manufaktur dan pembangkit listrik. Mengintegrasikan teknologi sensor kapasitif silikon yang kokoh dan stabilitas 10 tahun.',
    specifications: {
      'Accuracy': 'Up to 0.04% of span',
      'Stability': '10-year stability (0.2% of URL)',
      'Rangedown': 'Up to 150:1',
      'Output': '4-20 mA HART, WirelessHART',
      'Pressure Range': 'Up to 2000 psi (137.89 bar)'
    },
    features: [
      'Desain Coplanar fleksibel untuk manifold terintegrasi',
      'Sertifikasi keselamatan SIL 2/3 IEC 61508',
      'Diagnosa integritas loop kelistrikan canggih'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 2
  },
  {
    id: 'prod-003',
    name: 'Rosemount 1056 Dual Channel Liquid Analyzer',
    slug: 'rosemount-1056-dual-channel-liquid-analyzer',
    brand: 'Rosemount',
    category: 'Instrument Products',
    model_number: '1056',
    short_description: 'Dual channel analyzer untuk pemantauan pH, ORP, Conductivity, Dissolved Oxygen, dan Chlorine secara presisi.',
    description: 'Rosemount 1056 Dual-Input Transmitter menyediakan pengukuran analisis cairan multi-parameter dengan konfigurasi modular. Memudahkan instalasi pada pengolahan air boiler dan limbah industri.',
    specifications: {
      'Inputs': 'Dual sensor inputs',
      'Parameters': 'pH, ORP, Conductivity, DO, Chlorine',
      'Enclosure': 'NEMA 4X / IP65 weatherproof',
      'Output': 'Dual 4-20 mA with HART'
    },
    features: [
      'Konfigurasi cepat dengan auto-recognition sensor',
      'Mendukung sensor pH/ORP seri Rosemount 3900 dan 396R',
      'Penyimpanan kalibrasi data terintegrasi'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 3
  },
  {
    id: 'prod-004',
    name: 'Yokogawa EJA110A Differential Pressure Transmitter',
    slug: 'yokogawa-eja110a-differential-pressure-transmitter',
    brand: 'Yokogawa',
    category: 'Instrument Products',
    model_number: 'EJA110A',
    short_description: 'High performance differential pressure transmitter dengan resonant silicon sensor DPharp technology.',
    description: 'Yokogawa EJA110A menggunakan teknologi sensor DPharp silikon resonan digital yang memberikan pengukuran tekanan diferensial cairan, gas, atau uap secara stabil dengan pengaruh temperatur minimal.',
    specifications: {
      'Accuracy': '±0.065% of Span',
      'Output': '4-20 mA DC with BRAIN or HART protocol',
      'Span Limits': '0.5 to 500 kPa',
      'Static Pressure Rating': 'Up to 16 MPa (2300 psi)'
    },
    features: [
      'Teknologi sensor resonan digital tanpa konversi A/D analog',
      'Stabilitas jangka panjang terverifikasi di industri berat',
      'Kompatibel dengan communicator Yokogawa BT200'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 4
  },
  {
    id: 'prod-005',
    name: 'Yokogawa BT200 Brain & HART Terminal Communicator',
    slug: 'yokogawa-bt200-communicator',
    brand: 'Yokogawa',
    category: 'Instrument Products',
    model_number: 'BT200',
    short_description: 'Portable terminal operator untuk setup, konfigurasi parameter, dan monitoring transmitter Yokogawa di lapangan.',
    description: 'Yokogawa BT200 BRAIN Terminal adalah perangkat handheld handal yang dirancang khusus untuk teknisi pemeliharaan instrumen pabrik untuk membaca data pengukuran dan mengatur parameter lapangan.',
    specifications: {
      'Protocol': 'BRAIN Communication',
      'Display': '21 characters x 8 lines LCD',
      'Power': '5 dry alkaline batteries (AA)'
    },
    features: [
      'Konfigurasi parameter cepat dan upload/download setting',
      'Bodi tahan benturan untuk lingkungan pabrik ekstrem'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 5
  },
  {
    id: 'prod-006',
    name: 'ABB TZIDC110 V18345 Digital Valve Positioner',
    slug: 'abb-tzidc110-v18345-digital-valve-positioner',
    brand: 'ABB',
    category: 'Valve Products',
    model_number: 'TZIDC110 (V18345)',
    short_description: 'Intelligent electro-pneumatic digital positioner untuk katup kontrol linear dan rotary.',
    description: 'ABB TZIDC110 (V18345) adalah positioner katup cerdas digital yang dilengkapi dengan autostroke kalibrasi otomatis dalam hitungan detik. Mengoptimalkan konsumsi udara instrumen hingga nol saat posisi katup stabil.',
    specifications: {
      'Input Signal': '4-20 mA with HART',
      'Air Supply': '1.4 to 6 bar (20 to 90 psi)',
      'Travel Range': 'Linear 10-150 mm, Rotary up to 120°',
      'Protection': 'IP65 / NEMA 4X'
    },
    features: [
      'Fitur Autostroke: kalibrasi otomatis tanpa membuka casing',
      'Konsumsi udara nol pada titik steady-state menghemat biaya kompresor',
      'Ketahanan getaran tinggi hingga 10g pada 80 Hz'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 6
  },
  {
    id: 'prod-007',
    name: 'Azbil AVP100-H Smart Valve Positioner 100 Series',
    slug: 'azbil-avp100-h-smart-valve-positioner',
    brand: 'Azbil',
    category: 'Valve Products',
    model_number: 'AVP100-H',
    short_description: 'Smart pneumatic positioner dengan kalibrasi digital mandiri untuk control valve industri proses.',
    description: 'Azbil AVP100-H Smart Valve Positioner menawarkan keandalan kontrol katup pneumatik kelas industri Jepang. Dilengkapi dengan diagnostik internal dan deteksi kebocoran seal katup secara dini.',
    specifications: {
      'Input Signal': '4-20 mA DC',
      'Communication': 'HART / DE',
      'Supply Air Pressure': '140 to 700 kPa',
      'Stroke Range': '10 to 100 mm'
    },
    features: [
      'Kalibrasi mandiri yang cepat dengan tombol setting eksternal',
      'Desain pneumatik tangguh dengan filtrasi internal',
      'Presisi positioning respon tinggi terhadap sinyal kontrol'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 7
  },
  {
    id: 'prod-008',
    name: 'Endress+Hauser Promass 83F Coriolis Mass Flowmeter',
    slug: 'endress-hauser-promass-83f-coriolis-flowmeter',
    brand: 'Endress+Hauser',
    category: 'Instrument Products',
    model_number: 'Promass 83F',
    short_description: 'Flowmeter massa Coriolis akurasi tertinggi untuk pengukuran cairan dan gas bersuhu ekstrem.',
    description: 'Endress+Hauser Promass 83F adalah solusi pengukuran aliran massa cairan kimia, minyak, dan gas dengan toleransi kesalahan hingga 0.05%. Mengukur massa, volume, densitas, dan temperatur sekaligus dalam satu sensor.',
    specifications: {
      'Measuring Principle': 'Coriolis Mass Flow',
      'Accuracy': '±0.05% o.r.',
      'Process Temp': '-200 to +350°C',
      'Pressure Rating': 'Up to PN 100 / Cl 600'
    },
    features: [
      'Pengukuran multivariabel simultan (massa, densitas, temperatur)',
      'Tidak memerlukan straight pipe run di hulu maupun hilir',
      'Sensor tahan korosi Alloy C22 dan Stainless Steel 316L'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 8
  },
  {
    id: 'prod-009',
    name: 'SOR 101NN Differential Pressure Switch',
    slug: 'sor-101nn-differential-pressure-switch',
    brand: 'SOR',
    category: 'Instrument Products',
    model_number: '101NN',
    short_description: 'Heavy-duty differential pressure switch dengan mekanisme diaphragm-piston untuk safety interlock pabrik.',
    description: 'SOR 101NN Series Pressure Switches adalah standar proteksi keselamatan pada industri pembangkit listrik (PLN), pabrik kertas, dan kimia. Dirancang tahan cuaca ekstrem dan getaran tinggi.',
    specifications: {
      'Adjustment Range': '0.5 to 150 psi (35 mbar to 10 bar)',
      'Proof Pressure': 'Up to 3000 psi',
      'Switch Contacts': 'SPDT / DPDT snap-action',
      'Housing': 'NEMA 4, 4X, IP66 cast aluminium'
    },
    features: [
      'Mekanisme sensor statis terbukti handal tanpa gesekan mekanis berlebih',
      'Tersedia opsi explosion proof',
      'Setting setpoint dapat disetel dengan akurat di lapangan'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 9
  },
  {
    id: 'prod-010',
    name: 'Siemens SIPART PS2 Valve Positioner 6DR5',
    slug: 'siemens-sipart-ps2-valve-positioner',
    brand: 'Siemens',
    category: 'Valve Products',
    model_number: 'SIPART PS2',
    short_description: 'Positioner katup pneumatik terlaris di dunia dengan konsumsi udara minimal dan fungsi diagnosa online.',
    description: 'Siemens SIPART PS2 adalah positioner katup elektro-pneumatik yang sangat fleksibel untuk katup gerak lurus (linear) dan putar (part-turn). Menggunakan piezo valve yang menghemat pemakaian udara tekan hingga 90%.',
    specifications: {
      'Stroke Range': '3 to 130 mm (linear), 30 to 100° (rotary)',
      'Control Signal': '4-20 mA HART',
      'Air Supply': '1.4 to 7 bar',
      'Certifications': 'SIL 2, ATEX'
    },
    features: [
      'Teknologi Piezo valve revolusioner dengan konsumsi udara minimal',
      'Inisialisasi otomatis hanya dengan menekan 3 tombol',
      'Diagnostik keausan valve dan partial stroke test (PST)'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 10
  },
  {
    id: 'prod-011',
    name: 'Rotork YT-3700 Smart Valve Positioner Aluminium',
    slug: 'rotork-yt-3700-smart-valve-positioner',
    brand: 'Rotork',
    category: 'Valve Products',
    model_number: 'YT-3700',
    short_description: 'Smart electro-pneumatic positioner dengan LCD visual dan limit switch terintegrasi untuk kontrol presisi.',
    description: 'Rotork YT-3700 Series mengontrol pergerakan katup kontrol pneumatik dengan akurat berdasarkan sinyal 4-20 mA. Casing aluminium kokoh IP66 cocok untuk pabrik kimia, boiler pembangkit, dan industri semen.',
    specifications: {
      'Input Signal': '4-20 mA DC with HART 7',
      'Supply Pressure': '1.4 to 7.0 bar',
      'Housing': 'Aluminium Diecast IP66',
      'Display': 'Graphic LCD with push buttons'
    },
    features: [
      'Menu LCD grafik besar yang mudah dibaca di lapangan',
      'Tersedia opsi remote mounting sensor YT-3702',
      'Dukungan Auto-Tuning respons katup cepat tanpa overshooting'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 11
  },
  {
    id: 'prod-012',
    name: 'Honeywell STG700 SmartLine Gauge Pressure Transmitter',
    slug: 'honeywell-stg700-smartline-pressure-transmitter',
    brand: 'Honeywell',
    category: 'Instrument Products',
    model_number: 'STG700',
    short_description: 'Gauge pressure transmitter dengan modularitas tinggi, akurasi 0.065%, dan layar grafis canggih.',
    description: 'Honeywell STG700 SmartLine menyediakan pengukuran tekanan fluida pipa dan tangki dengan stabilitas jangka panjang hingga 0.02% URL per tahun. Komponen modular memudahkan penggantian sensor tanpa kalibrasi ulang.',
    specifications: {
      'Span Limit': 'Up to 10,000 psi (690 bar)',
      'Accuracy': '±0.065% standard',
      'Stability': '±0.02% URL per year for 10 years',
      'Output': '4-20 mA HART'
    },
    features: [
      'Desain modular: sensor dan elektronik dapat diganti terpisah',
      'Layar LCD grafis dengan diagnostik pesan kesalahan jelas',
      'Ketahanan overpressure ekstrem'
    ],
    is_featured: true,
    is_published: true,
    sort_order: 12
  }
];

export async function getPublishedProducts(): Promise<ProductItem[]> {
  try {
    const { data, error } = await supabase
      .from('site_products')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as ProductItem[];
    }
  } catch (err) {
    console.error('Error fetching products from Supabase, using fallback:', err);
  }
  return FALLBACK_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<ProductItem | null> {
  const products = await getPublishedProducts();
  return products.find(p => p.slug === slug) || null;
}
