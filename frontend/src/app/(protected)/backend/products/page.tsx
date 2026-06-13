"use client";

import { useState } from "react";
import { Search, Plus, Trash2, Edit } from "lucide-react";
import { useInventoryStore, InventoryProduct } from "@/store/useInventoryStore";
import ProductForm from "@/components/backend/ProductForm";

export default function ProductsPage() {
  const { products, categories, deleteProducts } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter products by name or category
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchName = p.name.toLowerCase().includes(q);
    const matchCategory = p.categories.some(c => c.toLowerCase().includes(q));
    return matchName || matchCategory;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      deleteProducts(selectedIds);
      setSelectedIds([]);
    }
  };

  const openNewForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditForm = (prod: InventoryProduct) => {
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cafe-primary transition-colors"
            />
          </div>
          
          <button 
            onClick={openNewForm}
            className="flex items-center gap-2 bg-cafe-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
          >
            <Plus size={18} />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-[#2a2a2a] p-3 rounded-lg mb-4 flex items-center justify-between border border-cafe-primary/30 animate-in fade-in">
          <span className="text-sm text-white font-medium">{selectedIds.length} items selected</span>
          <button 
            onClick={handleDeleteSelected}
            className="flex items-center gap-2 bg-cafe-danger hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
          >
            <Trash2 size={16} /> Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 bg-[#1e1e1e] border border-gray-700 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2a2a2a] sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b border-gray-700 w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    className="w-4 h-4 rounded border-gray-600 text-cafe-primary focus:ring-cafe-primary bg-[#1e1e1e]"
                  />
                </th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">Name</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">Category</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">Price</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">Tax</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300">Status</th>
                <th className="p-4 border-b border-gray-700 text-sm font-semibold text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(prod => (
                <tr key={prod.id} className="hover:bg-gray-800/50 transition-colors border-b border-gray-700/50 last:border-0">
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(prod.id)}
                      onChange={() => handleSelectOne(prod.id)}
                      className="w-4 h-4 rounded border-gray-600 text-cafe-primary focus:ring-cafe-primary bg-[#1e1e1e]"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{prod.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{prod.description}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {prod.categories.map(c => {
                        const catData = categories.find(cat => cat.name === c);
                        return (
                          <span 
                            key={c} 
                            className="text-xs px-2 py-1 rounded-full border"
                            style={{ 
                              backgroundColor: catData ? `${catData.color}20` : '#4a556820',
                              borderColor: catData ? `${catData.color}50` : '#4a556850',
                              color: catData?.color || '#a0aec0'
                            }}
                          >
                            {c}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-white">${prod.price.toFixed(2)}</td>
                  <td className="p-4 text-gray-300">{prod.tax}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      prod.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                      prod.status === 'Archived' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {prod.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openEditForm(prod)}
                      className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors inline-flex"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <ProductForm 
          initialData={editingProduct} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
