import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      contact_name,
      contact_email,
      contact_phone,
      company_name,
      category,
      description,
      honeypot,
    } = body;

    // 1. Honeypot spam trap
    if (honeypot) {
      console.warn('Spam trap triggered by honeypot field');
      return NextResponse.json({ success: true, reference_number: 'INQ-ACK-SPAM' });
    }

    // 2. Validate input
    if (!contact_name || !contact_email || !contact_phone || !description) {
      return NextResponse.json(
        { error: 'Nama, email, telepon, dan deskripsi kebutuhan wajib diisi.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // If Supabase is connected with real credentials
    if (supabaseUrl && !supabaseUrl.includes('placeholder-project') && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Generate sequence number atomically
      const { data: seqData } = await supabase.rpc('next_document_number', { p_code: 'INQ' });
      const inqNumber = seqData || `INQ/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(Math.random() * 9000 + 1000)}`;

      // Check/create customer
      let customerId: string | null = null;
      if (company_name) {
        const { data: existingCust } = await supabase
          .from('customers')
          .select('id')
          .ilike('name', company_name.trim())
          .is('deleted_at', null)
          .maybeSingle();

        if (existingCust) {
          customerId = existingCust.id;
        } else {
          const { data: newCust } = await supabase
            .from('customers')
            .insert({
              name: company_name.trim(),
              pic_name: contact_name.trim(),
              pic_email: contact_email.trim(),
              pic_phone: contact_phone.trim(),
              notes: 'Inquiry baru dari formulir website publik',
            })
            .select('id')
            .maybeSingle();

          if (newCust) customerId = newCust.id;
        }
      }

      // Insert inquiry
      const { error: inqError } = await supabase.from('inquiries').insert({
        inquiry_number: inqNumber,
        customer_id: customerId,
        title: `Inquiry ${category || 'Sistem Otomasi'}: ${company_name || contact_name}`,
        description,
        source: 'website',
        contact_name: contact_name.trim(),
        contact_email: contact_email.trim(),
        contact_phone: contact_phone.trim(),
        consent_at: new Date().toISOString(),
        status: 'inquiry',
        priority: 'high',
      });

      if (inqError) {
        console.error('Supabase inquiry insert error:', inqError);
      }

      return NextResponse.json({
        success: true,
        reference_number: inqNumber,
        message: 'Permintaan penawaran Anda telah berhasil dikirim ke tim sales kami.',
      });
    }

    // Local / Dev Fallback
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const randomSeq = String(Math.floor(Math.random() * 9000 + 1000));
    const demoInqNumber = `INQ/${currentYear}/${currentMonth}/${randomSeq}`;

    return NextResponse.json({
      success: true,
      reference_number: demoInqNumber,
      message: 'Permintaan penawaran Anda telah berhasil dikirim ke pipeline penjualan.',
    });
  } catch (error: any) {
    console.error('API Error in /api/inquiry:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
