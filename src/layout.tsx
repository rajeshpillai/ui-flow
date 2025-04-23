// Layout.tsx
import React from "react";
import { Link } from "react-router-dom";
import { listAllPages } from "./schema-loader";

const pages = listAllPages();

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <aside className="w-60 bg-gray-800 text-white p-4 space-y-3">
        <h2 className="text-xl font-bold mb-4">📋 Menu</h2>
        {pages.map((p) => (
          <Link
            key={p.path}
            to={p.path}
            className="block px-3 py-2 rounded hover:bg-gray-700"
          >
            {p.title}
          </Link>
        ))}
      </aside>
      <main className="flex-1 bg-gray-50 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
