/* Isi dengan konfigurasi dari Firebase Console:
   Project settings → Your apps → Web app → SDK setup and configuration */
const FIREBASE_CONFIG = {
  apiKey: "ISI_API_KEY",
  authDomain: "ISI_PROJECT.firebaseapp.com",
  projectId: "ISI_PROJECT",
  storageBucket: "ISI_PROJECT.appspot.com",
  messagingSenderId: "ISI_SENDER_ID",
  appId: "ISI_APP_ID"
};

/* UID akun admin (Authentication → Users → salin UID). Harus sama dengan firestore.rules dan storage.rules */
const ADMIN_UID = "ISI_UID_ADMIN";

window.firebaseDb = function () {
  if (!window.firebase || FIREBASE_CONFIG.apiKey.startsWith("ISI_")) return null;
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  return firebase.firestore();
};
