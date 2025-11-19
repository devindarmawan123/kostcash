"use client";

import { useState } from "react";
import { X, Edit, Trash2, CheckCircle, Plus } from "lucide-react";
import { useCategory } from "@/components/category/index"; 

export default function CategoryManager({ onClose }) {
  const { categories, addCategory, deleteCategory, updateCategory } = useCategory();
  const [newCat, setNewCat] = useState("");
  const [editMode, setEditMode] = useState(null);

  const handleAdd = async () => {
    if (!newCat.trim()) return;
    await addCategory(newCat);
    setNewCat("");
  };

  const handleUpdate = async (id) => {
    if (!newCat.trim()) return;
    await updateCategory(id, { name: newCat });
    setEditMode(null);
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border rounded-xl w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kelola Kategori</h2>
        <button onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Kategori baru…"
          className="flex-1 border rounded-lg p-2"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
          <Plus /> Tambah
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-2 bg-white rounded-lg border"
          >
            {editMode === cat.id ? (
              <input
                type="text"
                className="flex-1 border rounded-lg p-1"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
              />
            ) : (
              <span className="text-lg">{cat.name}</span>
            )}

            <div className="flex gap-2">
              {editMode === cat.id ? (
                <button
                  className="text-green-600"
                  onClick={() => handleUpdate(cat.id)}
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              ) : (
                <button
                  className="text-yellow-600"
                  onClick={() => {
                    setNewCat(cat.name);
                    setEditMode(cat.id);
                  }}
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}

              <button
                className="text-red-600"
                onClick={() => deleteCategory(cat.id)}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
