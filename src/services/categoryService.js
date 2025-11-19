import { db } from "@/components/firebase/index";
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, query } from "firebase/firestore";

export const addCategoryToDB = async (uid, name, color) => {
  const id = Date.now().toString();
  await setDoc(doc(db, "users", uid, "categories", id), {
    id,
    name,
    color
  });
};

export const updateCategoryInDB = async (uid, id, data) => {
  await updateDoc(doc(db, "users", uid, "categories", id), data);
};

export const deleteCategoryFromDB = async (uid, id) => {
  await deleteDoc(doc(db, "users", uid, "categories", id));
};

export const listenCategories = (uid, callback) => {
  const q = query(collection(db, "users", uid, "categories"));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(doc => ({
      id: doc.id,  
      ...doc.data()
    }));
    callback(list);
  });
};

