"use client";

import { useExpense } from "@/components/pengeluaran/ExpensesContext";
import { useEffect, useState, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import dynamic from "next/dynamic";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const jsPDF = dynamic(() => import("jspdf"), { ssr: false });
const html2canvas = dynamic(() => import("html2canvas"), { ssr: false });

export default function Summary() {
  const { expenses } = useExpense();
  const [hiddenCharts, setHiddenCharts] = useState({});
  const [isExporting, setIsExporting] = useState(false);
  const [chartsReady, setChartsReady] = useState(false);
  const ringkasanRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("hiddenCharts");
    if (saved) setHiddenCharts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setChartsReady(true), 1200); // 1.2 detik setelah mount
    return () => clearTimeout(timer);
  }, [expenses]);

  const hideChart = (key) => {
    const updated = { ...hiddenCharts, [key]: true };
    setHiddenCharts(updated);
    localStorage.setItem("hiddenCharts", JSON.stringify(updated));
  };

  const resetCharts = () => {
    setHiddenCharts({});
    localStorage.removeItem("hiddenCharts");
  };

  const exportPDF = async () => {
    if (!jsPDF || !html2canvas) return;
    if (!ringkasanRef.current) return;

    setIsExporting(true);

    try {
      await new Promise((res) => setTimeout(res, 1200));

      const canvas = await html2canvas.default(ringkasanRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF.jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("ringkasan-pengeluaran.pdf");
    } catch (err) {
      console.error("Export PDF gagal:", err);
    }

    setIsExporting(false);
  };

  const monthlyCharts = {};
  expenses.forEach((exp) => {
    const date = new Date(exp.tanggal);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const dayKey = date.getDate();
    const total = exp.items.reduce((acc, item) => acc + (parseFloat(item) || 0), 0);

    if (!monthlyCharts[monthKey]) monthlyCharts[monthKey] = {};
    if (!monthlyCharts[monthKey][dayKey]) monthlyCharts[monthKey][dayKey] = 0;
    monthlyCharts[monthKey][dayKey] += total;
  });

  const yearlyCharts = {};
  expenses.forEach((exp) => {
    const date = new Date(exp.tanggal);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const total = exp.items.reduce((acc, item) => acc + (parseFloat(item) || 0), 0);

    if (!yearlyCharts[year]) yearlyCharts[year] = {};
    if (!yearlyCharts[year][month]) yearlyCharts[year][month] = 0;
    yearlyCharts[year][month] += total;
  });

  const categoryTotals = {};
  expenses.forEach((exp) => {
    const total = exp.items.reduce((acc, item) => acc + (parseFloat(item) || 0), 0);
    categoryTotals[exp.kategori] = (categoryTotals[exp.kategori] || 0) + total;
  });

  const chartHeight = 200;

  return (
    <div className="p-5 mx-[15px]" ref={ringkasanRef}>
      <h1 className="text-3xl font-bold mb-5">Ringkasan Pengeluaran</h1>

      <div className="flex gap-3 mb-4">
        <button
          onClick={resetCharts}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Reset Semua Grafik
        </button>
        {/* <button
          onClick={exportPDF}
          disabled={!chartsReady || isExporting}
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            !chartsReady || isExporting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
        >
          {isExporting ? "Membuat PDF..." : "Download PDF"}
        </button> */}
      </div>

      <h2 className="text-2xl font-bold mt-6 mb-3">Pengeluaran Per Bulan (Bar per Hari)</h2>
      {Object.entries(monthlyCharts).map(([monthKey, days]) =>
        hiddenCharts[monthKey] ? null : (
          <div
            key={monthKey}
            className="bg-white p-4 rounded-xl shadow mb-6"
            style={{ height: chartHeight + 50 }}
          >
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-semibold">{monthKey}</h3>
              <button className="text-red-500" onClick={() => hideChart(monthKey)}>
                Hapus Grafik
              </button>
            </div>
            <Bar
              data={{
                labels: Object.keys(days),
                datasets: [
                  {
                    label: "Total Pengeluaran",
                    data: Object.values(days),
                    backgroundColor: "#60a5fa",
                  },
                ],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        )
      )}

      <h2 className="text-2xl font-bold mt-6 mb-3">Pengeluaran Per Tahun (Bar per Bulan)</h2>
      {Object.entries(yearlyCharts).map(([year, months]) =>
        hiddenCharts[`tahun-${year}`] ? null : (
          <div
            key={year}
            className="bg-white p-4 rounded-xl shadow mb-6"
            style={{ height: chartHeight + 50 }}
          >
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-semibold">{year}</h3>
              <button className="text-red-500" onClick={() => hideChart(`tahun-${year}`)}>
                Hapus Grafik
              </button>
            </div>
            <Bar
              data={{
                labels: Object.keys(months),
                datasets: [
                  {
                    label: year,
                    data: Object.values(months),
                    backgroundColor: "#34d399",
                  },
                ],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        )
      )}

      <h2 className="text-2xl font-bold mt-6 mb-3">Pengeluaran per Kategori</h2>
      <div className="bg-white p-4 rounded-xl shadow mb-6" style={{ height: chartHeight + 50 }}>
        <Pie
          data={{
            labels: Object.keys(categoryTotals),
            datasets: [
              {
                data: Object.values(categoryTotals),
                backgroundColor: ["#f472b6", "#60a5fa", "#34d399", "#fbbf24", "#fb7185", "#a78bfa"],
              },
            ],
          }}
          options={{ maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
}
