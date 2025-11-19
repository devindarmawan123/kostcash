"use client";

import { useState } from "react";
import ExpenseInput from "@/components/pengeluaran/pengeluaran";
import CategorySummary from "@/components/summary/categorySummary";

const Pilihan = () => {
  const [page, setPage] = useState("input"); // default: input

  return (
    <div className="flex flex-col gap-4">
      <div className="flex border-b">
        <button 
          onClick={() => setPage("input")}
          className={`flex-1 py-4 px-6 font-semibold transition-colors ${page === "input" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          INPUT PENGELUARAN
        </button>

        <button 
          onClick={() => setPage("summary")}
          className={`flex-1 py-4 px-6 font-semibold transition-colors ${page === "summary" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          RINGKASAN
        </button>
      </div>

      {/* Tampilan berdasarkan pilihan */}
      {page === "input" && <ExpenseInput />}
      {page === "summary" && <CategorySummary />}
    </div>
  );
};

export default Pilihan;
