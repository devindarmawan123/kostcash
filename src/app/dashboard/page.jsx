"use client";

import { useExpense } from "@/components/pengeluaran/ExpensesContext";
import { useState, useMemo, useEffect } from "react";
import { db } from "@/components/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import useAuthListener from "@/components/navbar/Login/useAuthListener";
import { useRouter } from "next/navigation";
import { saveIncome, loadIncome } from "@/services/incomeSevice";
import ExpenseSearch from "@/components/pengeluaran/ExpenseSearch";

export default function Dashboard() {
  const router = useRouter();
  const { expenses } = useExpense();

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showAll, setShowAll] = useState(false);

  const { user, loading: authLoading } = useAuthListener();
  const [username, setUsername] = useState("");
  const [loadingUsername, setLoadingUsername] = useState(true);

  const [penghasilanBulanan, setPenghasilanBulanan] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  // AUTO GENERATE TAHUN SESUAI DATA FIRESTORE
  const years = useMemo(() => {
    return [
      ...new Set(expenses.map((e) => new Date(e.tanggal).getFullYear())),
    ].sort((a, b) => b - a);
  }, [expenses]);

  // Cek login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading]);

  // Load username
  useEffect(() => {
    if (!user) {
      setLoadingUsername(false);
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUsername(docSnap.data().username || "");
      }
      setLoadingUsername(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Load income
  // Load income setiap kali bulan/tahun berubah
  useEffect(() => {
    if (!showAll && selectedMonth && selectedYear) {
      loadIncome().then((val) => {
        setPenghasilanBulanan(val);
      });
    } else {
      setPenghasilanBulanan(null);
    }
  }, [selectedMonth, selectedYear, showAll]);

  const handleSaveUsername = async () => {
    if (!username.trim()) return alert("Username tidak boleh kosong!");
    if (!user) return alert("User belum login!");
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { username: username.trim() }, { merge: true });
      alert(`Username berhasil diupdate menjadi "${username}"!`);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan username.");
    }
  };

  // FILTER EXPENSES
  const filteredExpenses = useMemo(() => {
    let list = showAll
      ? expenses
      : expenses.filter((e) => {
          const date = new Date(e.tanggal);
          const matchYear = selectedYear
            ? date.getFullYear() === selectedYear
            : true;
          const matchMonth = selectedMonth
            ? date.getMonth() + 1 === selectedMonth
            : true;
          return matchYear && matchMonth;
        });

    // --- FILTER SEARCH ---
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();

      list = list.filter((exp) => {
        const matchKategori = exp.kategori.toLowerCase().includes(q);
        const matchTanggal = exp.tanggal.includes(q);
        const matchNominal = exp.items.some((i) => i.toString().includes(q));
        const matchPayment = exp.paymentMethod?.toLowerCase().includes(q);

        return matchKategori || matchTanggal || matchNominal || matchPayment;
      });
    }

    return list;
  }, [expenses, selectedMonth, selectedYear, showAll, searchQuery]);

  const totalPengeluaran = filteredExpenses.reduce(
    (acc, e) => acc + e.items.reduce((a, b) => a + b, 0),
    0
  );
  const jumlahTransaksi = filteredExpenses.length;

  // Hitung kategori
  const kategoriMap = {};
  filteredExpenses.forEach((e) => {
    e.items.forEach((item) => {
      kategoriMap[e.kategori] = (kategoriMap[e.kategori] || 0) + item;
    });
  });

  const topKategori = Object.entries(kategoriMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const topNominal = filteredExpenses
    .map((e) => ({ ...e, total: e.items.reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const sisaUang =
    penghasilanBulanan !== null ? penghasilanBulanan - totalPengeluaran : null;

  if (authLoading || loadingUsername)
    return (
      <div className="flex items-center justify-center min-h-screen min-w-full bg-gray-50/75">
        <div className="loader w-40 h-40"></div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* USERNAME */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <label className="font-medium text-gray-700 w-full md:w-auto">
          Username
        </label>
        <div className="flex flex-col sm:flex-row w-full gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSaveUsername}
            className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition w-full sm:w-auto"
          >
            Simpan
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center rounded-md gap-3 md:justify-between">
        <div className="flex md:flex-row flex-col gap-4">
          <div className="flex items-center gap-2">
            <label className="font-semibold">Bulan:</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(
                  e.target.value ? parseInt(e.target.value) : ""
                );
                setShowAll(false);
              }}
              className="border border-gray-400 rounded-md px-3 py-2 bg-white"
            >
              <option value="">Semua Bulan</option>
              {[...Array(12).keys()].map((m) => (
                <option key={m + 1} value={m + 1}>
                  Bulan {m + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold">Tahun:</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value ? parseInt(e.target.value) : "");
                setShowAll(false);
              }}
              className="border border-gray-400 rounded-md px-3 py-2 bg-white"
            >
              <option value="">Semua Tahun</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (!showAll) {
                setShowAll(true);
                setSelectedMonth("");
                setSelectedYear("");
              } else {
                setShowAll(false);
                setSelectedMonth("");
                setSelectedYear(new Date().getFullYear());
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            {showAll ? "Tampilkan Bulan/Tahun" : "Lihat Semua"}
          </button>
        </div>
        <ExpenseSearch
          className="right-0"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {/* 4 STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          !showAll &&
            selectedMonth !== "" &&
            selectedYear !== "" &&
            penghasilanBulanan !== null && {
              label: "Sisa Uang Bulan Ini",
              value: sisaUang,
              color: sisaUang >= 0 ? "text-green-600" : "text-red-600",
            },

          {
            label: "Total Pengeluaran",
            value: totalPengeluaran,
            color: "text-blue-600",
          },

          {
            label: "Jumlah Transaksi",
            value: jumlahTransaksi,
            color: "text-purple-600",
          },

          {
            label: "Kategori Terbanyak",
            value: topKategori[0]?.[0] || "-",
            color: "text-pink-600",
          },
        ]
          .filter(Boolean)
          .map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-gray-400 text-sm">{card.label}</div>
              <div className={`mt-2 text-2xl font-bold ${card.color}`}>
                {typeof card.value === "number"
                  ? `Rp ${card.value.toLocaleString("id-ID")}`
                  : card.value}
              </div>
            </div>
          ))}
      </div>

      {/* TOP KATEGORI */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <h2 className="text-xl font-bold mb-4">Top 3 Kategori Terbanyak</h2>
        <div className="flex flex-col md:flex-row gap-4">
          {topKategori.length === 0 ? (
            <p className="text-gray-500">Belum ada pengeluaran.</p>
          ) : (
            topKategori.map(([kategori, total], idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg p-4 text-white shadow"
              >
                <div className="font-semibold">{kategori}</div>
                <div className="mt-2 text-lg">
                  Rp {total.toLocaleString("id-ID")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* TOP NOMINAL */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <h2 className="text-xl font-bold mb-4">Top 3 Nominal Terbesar</h2>
        <div className="flex flex-col gap-4">
          {topNominal.length === 0 ? (
            <p className="text-gray-500">Belum ada pengeluaran.</p>
          ) : (
            topNominal.map((exp, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-50 rounded-lg p-4 shadow"
              >
                <div>
                  <div className="font-semibold">{exp.kategori}</div>
                  <div className="text-gray-500 text-sm">{exp.tanggal}</div>
                </div>
                <div className="text-blue-600 font-bold text-lg">
                  Rp {exp.total.toLocaleString("id-ID")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIWAYAT */}
      {!showAll && selectedMonth !== "" && selectedYear !== "" && (
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold">
            Riwayat Pengeluaran Bulan {selectedMonth} {selectedYear}
          </h2>

          {filteredExpenses.length === 0 ? (
            <p className="text-gray-500">Tidak ada riwayat pada bulan ini.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow"
                >
                  <div>
                    <div className="flex gap-2">
                      <div className="font-semibold">{exp.kategori}</div>
                      <div className="text-gray-500">{exp.tanggal}</div>
                    </div>

                    <div className="text-sm text-gray-700">
                      Metode: <b>{exp.paymentMethod}</b>
                    </div>

                    {exp.items.length > 1 && (
                      <div className="text-sm mt-1">
                        {exp.items.map((n, i) => (
                          <span key={i}>
                            Rp {parseInt(n).toLocaleString("id-ID")}
                            {i !== exp.items.length - 1 && " + "}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* NOMINAL KANAN */}
                  <div className="text-blue-700 text-xl font-bold">
                    Rp{" "}
                    {exp.items
                      .reduce((a, b) => a + b, 0)
                      .toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
