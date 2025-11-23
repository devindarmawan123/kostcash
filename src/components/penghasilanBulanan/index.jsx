"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useExpense } from "@/components/pengeluaran/ExpensesContext";
import { saveIncome, loadIncome } from "@/services/incomeSevice";

export default function PenghasilanBulanan() {
  const { expenses } = useExpense();
  const [penghasilanBulanan, setPenghasilanBulanan] = useState(null);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);

  useEffect(() => {
    loadIncome().then((value) => {
      if (value !== null && value !== undefined)
        setPenghasilanBulanan(value);
    });
  }, []);

  useEffect(() => {
    if (!expenses || expenses.length === 0) {
      setTotalPengeluaran(0);
      return;
    }

    const latestExpenseDate = expenses
      .map((exp) => new Date(exp.tanggal))
      .sort((a, b) => b - a)[0];

    if (!latestExpenseDate) {
      setTotalPengeluaran(0);
      return;
    }

    const latestMonth = latestExpenseDate.getMonth();
    const latestYear = latestExpenseDate.getFullYear();

    const latestMonthExpenses = expenses.filter((exp) => {
      const d = new Date(exp.tanggal);
      return d.getFullYear() === latestYear && d.getMonth() === latestMonth;
    });

    const total = latestMonthExpenses.reduce(
      (acc, e) => acc + e.items.reduce((a, b) => a + b, 0),
      0
    );

    setTotalPengeluaran(total);
  }, [expenses]);

  const updateIncome = (val) => {
    const num = val === "" ? null : parseFloat(val);
    setPenghasilanBulanan(num);
    saveIncome(num);
  };

  let alert = null;

  const alertColors = {
    successLow: "bg-gradient-to-r from-green-500 to-emerald-600",
    successMid: "bg-gradient-to-r from-blue-500 to-indigo-600",
    warning: "bg-gradient-to-r from-orange-500 to-yellow-500",
    danger: "bg-gradient-to-r from-red-600 to-red-800",
  };

  if (penghasilanBulanan && penghasilanBulanan > 0) {
    const percentage = (totalPengeluaran / penghasilanBulanan) * 100;

    if (percentage <= 30) {
      alert = {
        type: "success",
        color: alertColors.successLow,
        icon: "success",
        message: "Manajemen Anda Sangat Baik! 🎉",
        detail: `Pengeluaran hanya ${percentage.toFixed(
          1
        )}% dari penghasilan. Lanjutkan hidup hemat ini! 💪`,
      };
    } else if (percentage <= 50) {
      alert = {
        type: "success",
        color: alertColors.successMid,
        icon: "success",
        message: "Anda Sudah Cukup Baik 👍",
        detail: `Pengeluaran mencapai ${percentage.toFixed(
          1
        )}%. Masih aman, tapi bisa lebih hemat lagi.`,
      };
    } else if (percentage <= 75) {
      alert = {
        type: "warning",
        color: alertColors.warning,
        icon: "warning",
        message: "Waspada, Pengeluaran Mulai Tinggi ⚠️",
        detail: `Pengeluaran sudah ${percentage.toFixed(
          1
        )}% dari penghasilan. Awas jangan melebar.`,
      };
    } else if (percentage <= 100) {
      alert = {
        type: "warning",
        color: alertColors.warning,
        icon: "warning",
        message: "Harus Berhemat! ⚠️",
        detail: `Pengeluaran sudah ${percentage.toFixed(
          1
        )}% dari penghasilan. Anda hampir mencapai batas.`,
      };
    } else {
      alert = {
        type: "danger",
        color: alertColors.danger,
        icon: "warning",
        message: "BOROS! Pengeluaran Melebihi Penghasilan 🚨",
        detail: `Anda minus Rp ${(totalPengeluaran - penghasilanBulanan).toLocaleString(
          "id-ID"
        )}. Segera perbaiki!`,
      };
    }
  }

  return (
    <div className="mx-[12px] animate-fadeSlide">

      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg py-8 px-6 mt-4 mb-6 text-white">
        <span className="text-sm opacity-90">Penghasilan Bulanan</span>

        <input
          type="number"
          value={penghasilanBulanan ?? ""}
          onChange={(e) => updateIncome(e.target.value)}
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
          className={`rounded-2xl shadow-lg p-6 mb-6 text-white ${alert.color}
        transition-all duration-500 ease-out transform opacity-0 translate-y-3 animate-fadeSlide`}
        >
          <div className="flex items-start gap-3">
            {alert.icon === "warning" ? (
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
