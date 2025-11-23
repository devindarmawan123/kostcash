import { db } from "@/components/firebase/index";
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, query } from "firebase/firestore";

export const addMethodToDB = async (uid, name, color = "", id = null) => {
  const docId = id || Date.now().toString();
  await setDoc(doc(db, "users", uid, "method", docId), {
    id: docId,
    name,
    color
  });
};

export const updateMethodInDB = async (uid, id, data) => {
  await updateDoc(doc(db, "users", uid, "method", id), data);
};

export const deleteMethodFromDB = async (uid, id) => {
  await deleteDoc(doc(db, "users", uid, "method", id));
};

export const listenMethod = (uid, callback) => {
  const q = query(collection(db, "users", uid, "method"));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(list);
  });
};
