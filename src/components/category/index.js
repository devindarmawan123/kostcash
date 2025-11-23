"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  addCategoryToDB,
  listenCategories,
  deleteCategoryFromDB,
  updateCategoryInDB,
} from "@/services/categoryService";
import useAuthListener from "@/components/navbar/Login/useAuthListener";

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const { user, loading } = useAuthListener();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setCategories([]);
      return;
    }

    const unsub = listenCategories(user.uid, (list) => {
      const userCategories = list.map(c => c.name.toLowerCase());
      let finalCategories = [...list];

      if (!userCategories.includes("makan")) {
        finalCategories = [{ id: "default-makan", name: "Makan/Minum" }, ...finalCategories];
      }

      setCategories(finalCategories);
    });

    return () => unsub();
  }, [user, loading]);

  const addCategory = async (name) => {
    if (!user) return;
    const normalizedName = name.trim();
    if (!normalizedName) return;

    if (categories.some(cat => cat.name.toLowerCase() === normalizedName.toLowerCase())) {
      alert("Kategori ini sudah ada!");
      return;
    }

    await addCategoryToDB(user.uid, normalizedName);
  };

  const updateCategory = async (id, data) => {
    if (!user) return;
    const newName = data.name.trim();
    if (!newName) return;

    if (categories.some(cat => cat.name.toLowerCase() === newName.toLowerCase() && cat.id !== id)) {
      alert("Kategori baru sudah ada!");
      return;
    }

    await updateCategoryInDB(user.uid, id, { name: newName });
  };

  const deleteCategory = async (id) => {
    if (!user) return;
    if (id.startsWith("default-")) {
      alert("Kategori default tidak bisa dihapus.");
      return;
    }
    if (window.confirm("Yakin hapus kategori ini?")) {
      await deleteCategoryFromDB(user.uid, id);
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategory = () => useContext(CategoryContext);
