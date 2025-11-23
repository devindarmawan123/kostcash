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
  const ringkasanRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("hiddenCharts");
    if (saved) setHiddenCharts(JSON.parse(saved));
  }, []);

  const hideChart = (key) => {
    const updated = { ...hiddenCharts, [key]: true };
    setHiddenCharts(updated);
    localStorage.setItem("hiddenCharts", JSON.stringify(updated));
  };

  const resetCharts = () => {
    setHiddenCharts({});
    localStorage.removeItem("hiddenCharts");
  };

  // ================== Weekly, Monthly, Yearly ==================
  const weeklyCharts = {};
  const monthlyCharts = {};
  const yearlyCharts = {};
  const categoryTotals = {};

  expenses.forEach((exp) => {
    const date = new Date(exp.tanggal);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const total = exp.items.reduce((acc, item) => acc + (parseFloat(item) || 0), 0);

    // Weekly
    const week = Math.ceil(((date - new Date(year, 0, 1)) / (1000 * 60 * 60 * 24) + 1) / 7);
    const weekKey = `${year}-W${String(week).padStart(2, "0")}`;
    if (!weeklyCharts[weekKey]) weeklyCharts[weekKey] = {};
    weeklyCharts[weekKey][day] = (weeklyCharts[weekKey][day] || 0) + total;

    // Monthly
    const monthKey = `${year}-${String(month).padStart(2,"0")}`;
    if (!monthlyCharts[monthKey]) monthlyCharts[monthKey] = {};
    const weekLabel = `Minggu ${week}`;
    monthlyCharts[monthKey][weekLabel] = (monthlyCharts[monthKey][weekLabel] || 0) + total;

    // Yearly
    if (!yearlyCharts[year]) yearlyCharts[year] = {};
    const monthLabel = String(month).padStart(2, "0");
    yearlyCharts[year][monthLabel] = (yearlyCharts[year][monthLabel] || 0) + total;

    // Category
    categoryTotals[exp.kategori] = (categoryTotals[exp.kategori] || 0) + total;
  });

  const chartHeight = 250;
  const totalCategoryAmount = Object.values(categoryTotals).reduce((a,b)=>a+b,0);
  const topCategories = Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1]);

  return (
    <div className="p-5 mx-[15px]" ref={ringkasanRef}>
      <div className="flex flex-col md:flex-row items center md:justify-between justify-center">
      <h1 className="text-3xl font-bold mb-5 text-center">Ringkasan Pengeluaran</h1>
      <div className="flex gap-3 mb-4 justify-center">
        <button
          onClick={resetCharts}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
          Reset Semua Grafik
        </button>
      </div>
          </div>

      {/* Weekly Charts */}
      <h2 className="text-2xl font-bold mt-6 mb-3">Pengeluaran Per Minggu (Bar per Hari)</h2>
      {Object.entries(weeklyCharts).map(([weekKey, days]) => {
        if (!Object.keys(days).length || hiddenCharts[weekKey]) return null;

        const labels = Object.keys(days).sort((a,b)=>a-b);
        const data = labels.map(d => days[d]);

        return (
          <div key={weekKey} className="bg-white p-4 rounded-xl shadow mb-6" style={{ height: chartHeight + 50 }}>
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-semibold">{weekKey}</h3>
              <button className="text-red-500" onClick={() => hideChart(weekKey)}>Hapus Grafik</button>
            </div>
            <Bar
              data={{
                labels,
                datasets: [{ label: "Total Pengeluaran", data, backgroundColor: "#60a5fa" }],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        );
      })}

      {/* Monthly Charts */}
      <h2 className="text-2xl font-bold mt-6 mb-3">Pengeluaran Per Bulan (Bar per Minggu)</h2>
      {Object.entries(monthlyCharts).map(([monthKey, weeks]) => {
        if (!Object.keys(weeks).length || hiddenCharts[monthKey]) return null;

        const labels = Object.keys(weeks).sort((a,b)=>a.localeCompare(b));
        const data = labels.map(l => weeks[l]);

        return (
          <div key={monthKey} className="bg-white p-4 rounded-xl shadow mb-6" style={{ height: chartHeight + 50 }}>
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-semibold">{monthKey}</h3>
              <button className="text-red-500" onClick={() => hideChart(monthKey)}>Hapus Grafik</button>
            </div>
            <Bar
              data={{
                labels,
                datasets: [{ label: "Total Pengeluaran", data, backgroundColor: "#60a5fa" }],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        );
      })}

      {/* Yearly Charts */}
      <h2 className="text-2xl font-bold mt-6 mb-3">Pengeluaran Per Tahun (Bar per Bulan)</h2>
      {Object.entries(yearlyCharts).map(([year, months]) => {
        if (!Object.keys(months).length || hiddenCharts[year]) return null;

        const labels = Object.keys(months).sort((a,b)=>a-b);
        const data = labels.map(l => months[l]);

        return (
          <div key={year} className="bg-white p-4 rounded-xl shadow mb-6" style={{ height: chartHeight + 50 }}>
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-semibold">{year}</h3>
              <button className="text-red-500" onClick={() => hideChart(year)}>Hapus Grafik</button>
            </div>
            <Bar
              data={{
                labels,
                datasets: [{ label: year, data, backgroundColor: "#34d399" }],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        );
      })}

      {/* Per Kategori */}
      <h2 className="text-2xl font-bold mt-6 mb-3 text-center">Pengeluaran per Kategori</h2>
      <div className="flex md:flex-row flex-col justify-center items-center md:items-start md:gap-8 gap-1 flex-wrap">
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-xl shadow w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
          <Pie
            data={{
              labels: topCategories.map(([cat]) => cat),
              datasets: [{
                data: topCategories.map(([_, amt]) => amt),
                backgroundColor: [
                  "#f472b6","#60a5fa","#34d399","#fbbf24","#fb7185",
                  "#a78bfa","#f87171","#a5b4fc","#facc15","#22d3ee"
                ]
              }],
            }}
            options={{ maintainAspectRatio: true }}
          />
        </div>

        {/* Legend di samping */}
        <div className="flex flex-col md:gap-2 md:mt-4 max-w-xs">
          {topCategories.map(([cat, amt], idx) => (
            <div key={idx} className="flex justify-between items-center bg-gray-50 rounded p-2 shadow text-sm w-full">
              <span>{cat} :</span>
              <span className="ml-1">{((amt / totalCategoryAmount) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
