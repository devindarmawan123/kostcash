"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useExpense } from "@/components/pengeluaran/ExpensesContext";
import { saveIncome, loadIncome } from "@/services/incomeSevice";

export default function PenghasilanBulanan() {
  const { expenses } = useExpense();
  const [penghasilanBulanan, setPenghasilanBulanan] = useState(null);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);

  // Load penghasilan dari storage saat komponen mount
  useEffect(() => {
    loadIncome().then(value => {
      if (value !== null && value !== undefined) setPenghasilanBulanan(value);
    });
  }, []);

  // Hitung total pengeluaran bulan terbaru
  useEffect(() => {
    if (!expenses || expenses.length === 0) {
      setTotalPengeluaran(0);
      return;
    }

    // Ambil tanggal terbaru dari semua pengeluaran
    const latestExpenseDate = expenses
      .map(exp => new Date(exp.tanggal))
      .sort((a, b) => b - a)[0];

    if (!latestExpenseDate) {
      setTotalPengeluaran(0);
      return;
    }

    const latestMonth = latestExpenseDate.getMonth();
    const latestYear = latestExpenseDate.getFullYear();

    // Filter pengeluaran yang ada di bulan terbaru
    const latestMonthExpenses = expenses.filter(exp => {
      const d = new Date(exp.tanggal);
      return d.getFullYear() === latestYear && d.getMonth() === latestMonth;
    });

    // Hitung total nominal bulan terbaru
    const total = latestMonthExpenses.reduce(
      (acc, e) => acc + e.items.reduce((a, b) => a + b, 0),
      0
    );

    setTotalPengeluaran(total);
  }, [expenses]);

  // Update penghasilan
  const updateIncome = val => {
    const num = val === "" ? null : parseFloat(val);
    setPenghasilanBulanan(num);
    saveIncome(num);
  };

  // Buat alert
  let alert = null;
  if (penghasilanBulanan && penghasilanBulanan > 0) {
    const isWarning = totalPengeluaran > penghasilanBulanan;
    alert = isWarning
      ? {
          type: "warning",
          message: `Anda terlalu boros! Pengeluaran bulan ini melebihi penghasilan sebesar Rp ${(totalPengeluaran - penghasilanBulanan).toLocaleString("id-ID")}`,
          detail: `Coba kontrol pengeluaran bulan ini agar tidak defisit.`,
        }
      : {
          type: "success",
          message: "Manajemen keuangan Anda sangat baik! 🎉",
          detail: `Anda menghemat Rp ${(penghasilanBulanan - totalPengeluaran).toLocaleString("id-ID")}. Pertahankan! 💪`,
        };
  }

  return (
    <div className="mx-[12px]">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg py-8 px-6 mt-4 mb-6 text-white">
        <span className="text-sm opacity-90">Penghasilan Bulanan</span>
        <input
          type="number"
          value={penghasilanBulanan ?? ""}
          onChange={e => updateIncome(e.target.value)}
          className="text-3xl font-bold bg-transparent border-b-2 border-white/30 focus:border-white outline-none w-full mb-2"
        />
        {penghasilanBulanan && (
          <p className="text-sm opacity-75">
            Rp {penghasilanBulanan.toLocaleString("id-ID")}
          </p>
        )} 
        <div className="text-sm font-medium mb-4 mt-3">
        Total pengeluaran bulan ini: Rp {totalPengeluaran.toLocaleString("id-ID")}
        </div>
      </div>

      {alert && (
        <div
          className={`rounded-2xl shadow-lg p-6 mb-6 ${
            alert.type === "warning"
              ? "bg-gradient-to-r from-red-500 to-orange-500"
              : "bg-gradient-to-r from-green-500 to-teal-500"
          } text-white`}
        >
          <div className="flex items-start gap-3">
            {alert.type === "warning" ? (
              <AlertCircle className="w-6 h-6 mt-1" />
            ) : (
              <CheckCircle className="w-6 h-6 mt-1" />
            )}
            <div>
              <h3 className="font-bold text-lg mb-1">{alert.message}</h3>
              <p className="text-sm opacity-90">{alert.detail}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
