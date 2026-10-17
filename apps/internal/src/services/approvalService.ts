import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  Quotation, 
  Approval, 
  ApprovalDecision, 
  UserRole, 
  AuditLog 
} from '../types/database';

const APPROVALS_STORAGE_KEY = 'asf_approvals_data';
const AUDIT_LOGS_STORAGE_KEY = 'asf_audit_logs_data';
const QUOTATIONS_STORAGE_KEY = 'asf_quotations_data';
const INQUIRIES_STORAGE_KEY = 'asf_inquiries_data';

const initialMockApprovals: Approval[] = [
  {
    id: 'app1',
    quotation_id: 'q1111111-1111-1111-1111-111111111111',
    approver_id: '11111111-1111-1111-1111-111111111111',
    decision: 'approved',
    comment: 'Margin 30% dan risk buffer 5% disetujui. Silakan kirimkan penawaran resmi ke PT Indofood.',
    decided_at: '2026-10-17T11:45:00Z',
    created_at: '2026-10-17T11:45:00Z',
    approver: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'owner@automation.co.id',
      full_name: 'Budi Santoso (Owner)',
      role: 'owner',
      is_active: true,
      created_at: '',
      updated_at: '',
    },
  },
];

function getStoredApprovals(): Approval[] {
  try {
    const data = localStorage.getItem(APPROVALS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(initialMockApprovals));
  return initialMockApprovals;
}

function saveStoredApprovals(items: Approval[]) {
  localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(items));
}

function getStoredAuditLogs(): AuditLog[] {
  try {
    const data = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return [];
}

function saveStoredAuditLogs(items: AuditLog[]) {
  localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(items));
}

export const approvalService = {
  async getApprovalHistory(quotationId: string): Promise<Approval[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('approvals')
        .select(`
          *,
          approver:profiles(id, full_name, email, role)
        `)
        .eq('quotation_id', quotationId)
        .order('decided_at', { ascending: false });

      if (error) {
        console.error('Error fetching approvals from Supabase:', error);
        return getStoredApprovals().filter((a) => a.quotation_id === quotationId);
      }
      return data as Approval[];
    }
    return getStoredApprovals().filter((a) => a.quotation_id === quotationId);
  },

  async executeApproval(params: {
    quotationId: string;
    decision: ApprovalDecision;
    comment?: string;
    approverId: string;
    approverName: string;
    role: UserRole;
  }): Promise<void> {
    // PRD Hard Rule: Only Owner can approve/reject/request revision
    if (params.role !== 'owner') {
      throw new Error('Hanya peran Owner yang berwenang memberikan persetujuan (approval) penawaran.');
    }

    if (params.decision === 'revision_requested' && (!params.comment || !params.comment.trim())) {
      throw new Error('Komentar wajib diisi apabila meminta revisi penawaran.');
    }

    if (isSupabaseConfigured) {
      try {
        // Execute atomic database function
        const { error } = await supabase.rpc('approve_quotation', {
          p_quotation_id: params.quotationId,
          p_decision: params.decision,
          p_comment: params.comment || null,
        });

        if (!error) return;
        console.warn('Supabase approve_quotation error, falling back to local audit:', error?.message);
      } catch (e) {
        console.warn('Supabase approve_quotation failed, falling back to local audit:', e);
      }
    }

    // Local simulation with audit log recording
    const newApproval: Approval = {
      id: crypto.randomUUID(),
      quotation_id: params.quotationId,
      approver_id: params.approverId,
      decision: params.decision,
      comment: params.comment || null,
      decided_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      approver: {
        id: params.approverId,
        email: 'owner@automation.co.id',
        full_name: params.approverName,
        role: 'owner',
        is_active: true,
        created_at: '',
        updated_at: '',
      },
    };

    const approvals = getStoredApprovals();
    approvals.unshift(newApproval);
    saveStoredApprovals(approvals);

    // Update quotation status in local storage
    const rawQuotes = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
    if (rawQuotes) {
      const quotes: Quotation[] = JSON.parse(rawQuotes);
      const qIndex = quotes.findIndex((q) => q.id === params.quotationId);
      if (qIndex !== -1) {
        const nextStatus = 
          params.decision === 'approved' 
            ? 'approved' 
            : params.decision === 'revision_requested' 
            ? 'revision_requested' 
            : 'rejected';
        quotes[qIndex].status = nextStatus;
        quotes[qIndex].updated_at = new Date().toISOString();
        localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(quotes));

        // Update inquiry status
        const rawInquiries = localStorage.getItem(INQUIRIES_STORAGE_KEY);
        if (rawInquiries) {
          const inquiries = JSON.parse(rawInquiries);
          const inqIdx = inquiries.findIndex((i: any) => i.id === quotes[qIndex].inquiry_id);
          if (inqIdx !== -1) {
            inquiries[inqIdx].status = params.decision === 'approved' ? 'approved' : 'revision';
            inquiries[inqIdx].updated_at = new Date().toISOString();
            localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
          }
        }
      }
    }

    // Record audit log
    const auditLogs = getStoredAuditLogs();
    auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'quotations',
      record_id: params.quotationId,
      action: params.decision === 'approved' ? 'APPROVE' : 'REJECT',
      performed_by: params.approverId,
      old_data: { status: 'waiting_approval' },
      new_data: { status: params.decision, comment: params.comment },
      created_at: new Date().toISOString(),
    });
    saveStoredAuditLogs(auditLogs);
  },

  async sendToCustomer(params: {
    quotationId: string;
    sentBy: string;
  }): Promise<void> {
    const rawQuotes = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
    if (!rawQuotes) return;

    const quotes: Quotation[] = JSON.parse(rawQuotes);
    const qIndex = quotes.findIndex((q) => q.id === params.quotationId);
    if (qIndex === -1) throw new Error('Quotation tidak ditemukan');

    // PRD Hard Rule: Cannot send without Owner Approval
    if (quotes[qIndex].status !== 'approved') {
      throw new Error('Customer Quotation TIDAK DAPAT dikirim tanpa persetujuan (Approved) dari Owner.');
    }

    quotes[qIndex].status = 'sent';
    quotes[qIndex].sent_at = new Date().toISOString();
    quotes[qIndex].sent_by = params.sentBy;
    quotes[qIndex].updated_at = new Date().toISOString();
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(quotes));

    // Update inquiry status to sent_to_customer
    const rawInquiries = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    if (rawInquiries) {
      const inquiries = JSON.parse(rawInquiries);
      const inqIdx = inquiries.findIndex((i: any) => i.id === quotes[qIndex].inquiry_id);
      if (inqIdx !== -1) {
        inquiries[inqIdx].status = 'sent_to_customer';
        inquiries[inqIdx].updated_at = new Date().toISOString();
        localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
      }
    }

    // Record audit log
    const auditLogs = getStoredAuditLogs();
    auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'quotations',
      record_id: params.quotationId,
      action: 'SEND',
      performed_by: params.sentBy,
      new_data: { status: 'sent', sent_at: new Date().toISOString() },
      created_at: new Date().toISOString(),
    });
    saveStoredAuditLogs(auditLogs);
  },

  async recordNegotiation(params: {
    quotationId: string;
    counterOfferPrice: number;
    minimumPrice: number;
    decision: 'won' | 'lost' | 'negotiation';
    lostReason?: string;
    notes?: string;
  }): Promise<{ requiresReapproval: boolean; status: string }> {
    const rawQuotes = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
    if (!rawQuotes) throw new Error('Quotation data not found');

    const quotes: Quotation[] = JSON.parse(rawQuotes);
    const qIndex = quotes.findIndex((q) => q.id === params.quotationId);
    if (qIndex === -1) throw new Error('Quotation tidak ditemukan');

    // Check if counter offer violates minimum price
    const violatesMinimum = params.counterOfferPrice > 0 && params.counterOfferPrice < params.minimumPrice;

    if (violatesMinimum && params.decision === 'won') {
      // Must reset to waiting_approval for Owner override!
      quotes[qIndex].status = 'waiting_approval';
      quotes[qIndex].subtotal = params.counterOfferPrice;
      quotes[qIndex].tax_amount = params.counterOfferPrice * (quotes[qIndex].tax_rate / 100);
      quotes[qIndex].grand_total = quotes[qIndex].subtotal + quotes[qIndex].tax_amount;
      quotes[qIndex].customer_notes = `Harga counter offer (Rp ${params.counterOfferPrice.toLocaleString('id-ID')}) DI BAWAH harga minimum. Menunggu approval Owner.`;
      localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(quotes));

      return {
        requiresReapproval: true,
        status: 'waiting_approval',
      };
    }

    if (params.decision === 'won') {
      quotes[qIndex].status = 'accepted';
      quotes[qIndex].updated_at = new Date().toISOString();
      localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(quotes));

      // Update inquiry to won
      const rawInquiries = localStorage.getItem(INQUIRIES_STORAGE_KEY);
      if (rawInquiries) {
        const inquiries = JSON.parse(rawInquiries);
        const inqIdx = inquiries.findIndex((i: any) => i.id === quotes[qIndex].inquiry_id);
        if (inqIdx !== -1) {
          inquiries[inqIdx].status = 'won';
          inquiries[inqIdx].updated_at = new Date().toISOString();
          localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
        }
      }
    } else if (params.decision === 'lost') {
      quotes[qIndex].status = 'declined';
      quotes[qIndex].updated_at = new Date().toISOString();
      localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(quotes));

      const rawInquiries = localStorage.getItem(INQUIRIES_STORAGE_KEY);
      if (rawInquiries) {
        const inquiries = JSON.parse(rawInquiries);
        const inqIdx = inquiries.findIndex((i: any) => i.id === quotes[qIndex].inquiry_id);
        if (inqIdx !== -1) {
          inquiries[inqIdx].status = 'lost';
          inquiries[inqIdx].lost_reason = params.lostReason || 'Kalah harga atau kompetitor';
          inquiries[inqIdx].updated_at = new Date().toISOString();
          localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
        }
      }
    }

    return {
      requiresReapproval: false,
      status: quotes[qIndex].status,
    };
  },
};
