"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, ChevronDown } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiClient.get('/products')
      .then(data => setProducts(data || []))
      .catch(err => console.error(err));
  }, []);

  const filtered = products.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1>Products</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2"
            size={15}
            style={{ color: "var(--text-tertiary)" }}
          />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <table className="table-base">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th style={{ textAlign: "right" }}>Price (₹)</th>
              <th style={{ textAlign: "right" }}>Tax (%)</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product: any) => (
              <tr key={product.id}>
                <td style={{ fontWeight: 500 }}>{product.name}</td>
                <td>
                  <span className="status-badge status-badge-draft">
                    {product.category?.name || "Uncategorized"}
                  </span>
                </td>
                <td className="numeric font-mono-num">₹{product.price?.toFixed(2)}</td>
                <td className="numeric font-mono-num">{product.tax}%</td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button className="btn-ghost" style={{ padding: "6px 8px" }}>
                      <Edit2 size={15} />
                    </button>
                    <button className="btn-danger" style={{ padding: "6px 8px" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-tertiary)", padding: "var(--space-8)" }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div
            className="h-full flex flex-col relative"
            style={{
              width: 480,
              background: "var(--bg-surface)",
              borderLeft: "1px solid var(--border)",
            }}
          >
            <div
              className="flex justify-between items-center px-6 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h2>Add New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-ghost" style={{ padding: 8 }}>
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 organic-scrollbar">
              <div>
                <label className="form-label">Product Name</label>
                <input type="text" className="form-input" placeholder="e.g. Latte" />
              </div>

              <div>
                <label className="form-label">Category</label>
                <div className="relative">
                  <select className="form-input" style={{ appearance: "none", paddingRight: 36 }}>
                    <option value="">Select Category</option>
                    <option value="bev">Beverages</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    size={14}
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="btn-ghost mt-2"
                  style={{ fontSize: "var(--text-xs)", color: "var(--accent-700)", padding: "4px 0" }}
                >
                  + Create New Category
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Price (₹)</label>
                  <input type="number" className="form-input font-mono-num" placeholder="0.00" />
                </div>
                <div>
                  <label className="form-label">Tax (%)</label>
                  <input type="number" className="form-input font-mono-num" placeholder="5" />
                </div>
              </div>

              <div>
                <label className="form-label">Unit of Measure</label>
                <select className="form-input">
                  <option>per piece</option>
                  <option>per kg</option>
                  <option>per litre</option>
                </select>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  className="form-input"
                  style={{ height: "auto", resize: "none" }}
                  placeholder="Short product description…"
                />
              </div>

              <div>
                <label className="form-label">Product Image</label>
                <div
                  className="flex flex-col items-center justify-center p-8 rounded-lg cursor-pointer transition-colors"
                  style={{ border: "2px dashed var(--border-strong)", color: "var(--text-tertiary)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                >
                  <ImageIcon size={28} className="mb-2" />
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--accent-700)", fontWeight: 600 }}>Click to upload</span>
                  <span style={{ fontSize: "var(--text-xs)", marginTop: 4 }}>SVG, PNG, JPG (max 2MB)</span>
                </div>
              </div>
            </div>

            <div
              className="p-6 flex gap-3"
              style={{ borderTop: "1px solid var(--border)", background: "var(--bg-subtle)" }}
            >
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button className="btn-primary flex-1 justify-center">
                Save Product
              </button>
            </div>

            {/* Category mini-modal */}
            {isCategoryModalOpen && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center p-6">
                <div className="card w-full space-y-4">
                  <h3>Create Category</h3>
                  <div>
                    <label className="form-label">Category Name</label>
                    <input type="text" className="form-input" placeholder="e.g. Desserts" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setIsCategoryModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                    <button className="btn-primary flex-1 justify-center">Save</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
