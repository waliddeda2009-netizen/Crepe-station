//==================================
// FIREBASE
//==================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const firebaseConfig = {

    apiKey: "AIzaSyDQYV1RhFh2_DcZd4SZmRxi49fTA9jBBfQ",

    authDomain: "crepe-station.firebaseapp.com",

    projectId: "crepe-station",

    storageBucket: "crepe-station.firebasestorage.app",

    messagingSenderId: "238191964316",

    appId: "1:238191964316:web:1cc88bd70b4c9d3d0a7d59"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const storage = getStorage(app);

export { db, storage };