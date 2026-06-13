"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function BackendLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // E.g. /backend/products -> ["backend", "products"]
  const pathSegments = pathname.split("/").filter(Boolean);
  
  return (
    <div className="flex flex-col h-full bg-cafe-bg text-cafe-text">
      {/* Breadcrumb Navigation */}
      <div className="bg-[#1e1e1e] border-b border-gray-700 px-6 py-3 flex items-center gap-2 text-sm">
        <Link href="/pos" className="text-gray-400 hover:text-cafe-primary transition-colors flex items-center gap-1">
          <Home size={14} />
          <span>Home</span>
        </Link>
        
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const routeTo = `/${pathSegments.slice(0, index + 1).join("/")}`;
          
          // Format text (e.g., "payment-methods" -> "Payment Methods")
          const formattedSegment = segment.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

          return (
            <div key={routeTo} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-gray-600" />
              {isLast ? (
                <span className="text-cafe-primary font-medium">{formattedSegment}</span>
              ) : (
                <Link href={routeTo} className="text-gray-400 hover:text-gray-200 transition-colors">
                  {formattedSegment}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Backend Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
