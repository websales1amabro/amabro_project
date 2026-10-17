import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex print:bg-white print:block">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 ml-64 flex flex-col min-w-0 print:ml-0 print:block">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto print:p-0 print:overflow-visible print:block">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
