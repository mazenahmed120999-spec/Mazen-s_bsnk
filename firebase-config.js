// firebase-config.js - تم تصحيحه لضمان عمل الروابط (CDN) على GitHub Pages

// ⚠️ تم استبدال "firebase/..." بروابط CDN المباشرة ⚠️
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

// مفاتيح مشروعك الخاصة (تم نسخها ولصقها من إرسالك)
const firebaseConfig = {
  apiKey: "AIzaSyD-g_PM12TgelGQn7npmYybpGfSxTuwpi0",
  authDomain: "center-9ab44.firebaseapp.com",
  projectId: "center-9ab44",
  storageBucket: "center-9ab44.firebasestorage.app",
  messagingSenderId: "342679917753",
  appId: "1:342679917753:web:2aeb0ef2c90fc943a3b768",
  measurementId: "G-S85P9EWGXM"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
// تهيئة خدمات Firestore و Authentication
const db = getFirestore(app);
const auth = getAuth(app);

// 🔑 تصدير الكائنات والوظائف لملف main.js لاستخدامها
export { 
    db, 
    auth, 
    doc, 
    setDoc, 
    collection, 
    getDocs, 
    getDoc, 
    signInAnonymously, 
    onAuthStateChanged 
};
