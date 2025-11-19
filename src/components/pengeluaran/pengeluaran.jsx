// src/components/pengeluaran/ExpenseInput.jsx
"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useExpense } from "@/components/pengeluaran/ExpensesContext";
import { useCategory } from "@/components/category/index";
import CategoryManager from "@/components/category/CategoryManager";

export default function ExpenseInput() {
  const {
    expenses,
    newExpense,
    setNewExpense,
    handleItemChange,
    addItem,
    removeItem,
    addExpense,
    deleteExpense,
    saving
  } = useExpense();

  const { categories } = useCategory();
  const [openCategoryManager, setOpenCategoryManager] = useState(false);

  return (
    <div className="py-6 px-5 bg-gray-200 flex flex-col rounded mx-[15px]">
      <h2 className="text-2xl font-bold mb-4">Tambah Pengeluaran Baru</h2>

      {/* Tanggal */}
      <div className="flex flex-col gap-2 mb-3">
        <label>Tanggal</label>
        <input
          type="date"
          value={newExpense.tanggal}
          onChange={e => setNewExpense({...newExpense, tanggal: e.target.value})}
          className="p-2 rounded"
        />
      </div>

      {/* Kategori */}
      <div className="flex flex-col gap-2 mb-3">
        <label>Kategori</label>
        <div className="flex gap-2">
          <select
            value={newExpense.kategori}
            onChange={e => setNewExpense({...newExpense, kategori: e.target.value})}
            className="flex-grow p-2 rounded"
          >
            <option value="" disabled>Pilih kategori</option>
            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
          <button onClick={() => setOpenCategoryManager(true)} className="p-2 bg-blue-300 rounded text-blue-600"><Plus /></button>
        </div>
        {openCategoryManager && <CategoryManager onClose={() => setOpenCategoryManager(false)} />}
      </div>

      {/* Nominal */}
      <div className="flex flex-col gap-2 mb-3">
        <label>Nominal</label>
        {newExpense.items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="number"
              value={item}
              onChange={e => handleItemChange(i, e.target.value)}
              placeholder="contoh 20000"
              className="flex-grow p-2 rounded"
            />
            {newExpense.items.length > 1 &&
              <button onClick={() => removeItem(i)} className="p-1"><Trash2 /></button>
            }
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <button onClick={addItem} className="flex items-center gap-1 p-2 rounded bg-gray-300"><Plus /> Tambah Nominal</button>
          <button
            onClick={addExpense}
            disabled={saving || !newExpense.kategori || newExpense.items.every(i => !i || parseInt(i) <= 0)}
            className={`flex-grow p-2 rounded font-semibold text-white ${saving || !newExpense.kategori || newExpense.items.every(i => !i || parseInt(i) <= 0) ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"}`}
          >
            Simpan Pengeluaran
          </button>
        </div>
      </div>

      {/* Riwayat */}
      <h2 className="text-2xl font-bold mt-6 mb-2">Riwayat Pengeluaran</h2>
      {expenses.length === 0 && <p className="text-gray-500">Belum ada pengeluaran.</p>}
      {expenses.slice(-10).reverse().map(exp => (
        <div key={exp.id} className="flex justify-between items-center p-3 bg-white rounded mb-2">
          <div>
            <div className="flex gap-2">
              <div className="font-semibold">{exp.kategori}</div>
              <div className="text-gray-500">{exp.tanggal}</div>
            </div>
            <div>
              {exp.items.map((n,i) => (
                <span key={i}>
                  Rp {parseInt(n).toLocaleString("id-ID")}
                  {i !== exp.items.length-1 && " + "}
                </span>
              ))}
            </div>
            <div className="text-blue-700 font-bold mt-1">
              Rp {exp.items.reduce((a,b) => a+b,0).toLocaleString("id-ID")}
            </div>
          </div>
          <button onClick={() => deleteExpense(exp.id)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded">Hapus</button>
        </div>
      ))}
    </div>
  );
}
