"use client";

import { useState } from "react";
import { X, Edit, Trash2, CheckCircle, Plus } from "lucide-react";
import { useMethod } from "@/components/payment/PaymentMethodContext";

export default function MethodManager({ onClose }) {
  const { method, addMethod, deleteMethod, updateMethod } = useMethod();
  const [newMet, setNewMet] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    if (!newMet.trim()) return;
    await addMethod(newMet);
    setNewMet("");
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    await updateMethod(id, { name: editName });
    setEditMode(null);
    setEditName("");
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border rounded-xl w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kelola Metode Pembayaran</h2>
        <button onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Metode baru…"
          className="flex-1 border rounded-lg p-2"
          value={newMet}
          onChange={(e) => setNewMet(e.target.value)}
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
        {method.length === 0 && (
          <p className="text-gray-500 text-sm">Belum ada metode pembayaran.</p>
        )}

        {method.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between p-2 bg-white rounded-lg border"
          >
            {editMode === m.id ? (
              <input
                type="text"
                className="flex-1 border rounded-lg p-1"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            ) : (
              <span className="text-lg">{m.name}</span>
            )}

            <div className="flex gap-2">
              {editMode === m.id ? (
                <button
                  className="text-green-600"
                  onClick={() => handleUpdate(m.id)}
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              ) : (
                <button
                  className="text-yellow-600"
                  onClick={() => {
                    setEditMode(m.id);
                    setEditName(m.name);
                  }}
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}

              <button
                className="text-red-600"
                onClick={() => deleteMethod(m.id)}
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
