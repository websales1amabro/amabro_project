import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { PipelineKanban } from './pages/PipelineKanban';
import { Inquiries } from './pages/Inquiries';
import { InquiryDetail } from './pages/InquiryDetail';
import { Customers } from './pages/Customers';
import { Vendors } from './pages/Vendors';
import { Quotations } from './pages/Quotations';
import { Approvals } from './pages/Approvals';
import { Transactions } from './pages/Transactions';
import { Finance } from './pages/Finance';
import { Products } from './pages/Products';
import { AuditLog } from './pages/AuditLog';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="pipeline" element={<PipelineKanban />} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="inquiries/:id" element={<InquiryDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="finance" element={<Finance />} />
            <Route path="products" element={<Products />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
