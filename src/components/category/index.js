"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  addCategoryToDB,
  listenCategories,
  deleteCategoryFromDB,
  updateCategoryInDB,
} from "@/services/expenseService";
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
          finalCategories = [{ id: "default-makan", name: "Makan" }, ...finalCategories];
      }

      setCategories(finalCategories);
    });

    return () => unsub();
  }, [user, loading]);

  const addCategory = async (name) => {
    const normalizedName = name.trim();
    if (!normalizedName) return;

    if (categories.some(cat => cat.name.toLowerCase() === normalizedName.toLowerCase())) {
        alert("Kategori ini sudah ada!");
        return;
    }

    await addCategoryToDB(normalizedName);
  };
  
  const updateCategory = async (id, data) => {
    const newName = data.name.trim();
    if (!newName) return;
    
    if (categories.some(cat => cat.name.toLowerCase() === newName.toLowerCase() && cat.id !== id)) {
        alert("Kategori baru sudah ada!");
        return;
    }
    
    await updateCategoryInDB(id, newName);
  }

  const deleteCategory = (id) => {
    if (id.startsWith("default-")) {
        alert("Kategori default tidak bisa dihapus.");
        return;
    }
    if (window.confirm("Yakin hapus kategori ini?")) {
        deleteCategoryFromDB(id);
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        deleteCategory,
        updateCategory
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategory = () => useContext(CategoryContext);