"use client";

export default function ExpenseSearch({ searchQuery, setSearchQuery }) {
  return (
    <>
    <input
      type="text"
      placeholder="Cari Riwayat Pengeluaran...."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pr-8 pl-3 py-2 md:max-w-md  w-full px-4 rounded border  border-gray-400 text-start placeholder:text-gray-400"
    />
    </>
  );
}
