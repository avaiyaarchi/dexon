'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

interface HeaderFooterWrapperProps {
  children: React.ReactNode;
}

export default function HeaderFooterWrapper({ children }: HeaderFooterWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isHome = pathname === '/';

  if (isAdmin) {
    return <div className="flex-grow flex flex-col">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <main className={`flex-grow flex flex-col ${isHome ? '' : 'pt-[76px]'}`}>
        {children}
      </main>
      <Footer />
    </>
  );
}
