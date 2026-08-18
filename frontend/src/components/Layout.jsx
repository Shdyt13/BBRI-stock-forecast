import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex flex-row min-h-screen w-full overflow-y-auto bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-h-screen w-full overflow-y-auto p-4 md:p-6 pb-24">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
