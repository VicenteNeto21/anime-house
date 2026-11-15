import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex mb-6 overflow-x-auto no-scrollbar py-2" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest">
        <li>
          <Link href="/" className="text-slate-500 hover:text-white transition-colors flex items-center">
            <Home className="w-3 h-3 mr-1.5" />
            Início
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <span className="text-slate-700">/</span>
            {item.href ? (
              <Link 
                href={item.href} 
                className="text-slate-500 hover:text-white transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-blue-500 whitespace-nowrap">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
