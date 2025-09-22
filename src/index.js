// import React from 'react';
// import ReactDOM from 'react-dom/client';
// //import './index.css'; // ✅ Importa index.css
// import App from './App';
// import { initializeApp } from "firebase/app";

// const firebaseConfig = {
//     apiKey: "AIzaSyDzq1YMmk1KGBAVB6JU7Yl9T2OJUE1XDd4",
//     authDomain: "fragancesnet.firebaseapp.com",
//     projectId: "fragancesnet",
//     storageBucket: "fragancesnet.appspot.com",
//     messagingSenderId: "10863367691",
//     appId: "1:10863367691:web:16d834616cdc2b996a190e"
// };

// initializeApp(firebaseConfig);

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<App />);

import React from 'react';
import ReactDOM from 'react-dom/client';
//import './index.css';
import App from './App';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//     apiKey: "AIzaSyDzq1YMmk1KGBAVB6JU7Yl9T2OJUE1XDd4",
//     authDomain: "fragancesnet.firebaseapp.com",
//     projectId: "fragancesnet",
//     storageBucket: "fragancesnet.appspot.com",
//     messagingSenderId: "10863367691",
//     appId: "1:10863367691:web:16d834616cdc2b996a190e"
// };

const firebaseConfig = {
    apiKey: "AIzaSyDzq1YMmk1KGBAVB6JU7Yl9T2OJUE1XDd4",
    authDomain: "fragancesnet.firebaseapp.com",
    projectId: "fragancesnet",
    storageBucket: "fragancesnet.firebasestorage.app",
    messagingSenderId: "10863367691",
    appId: "1:10863367691:web:16d834616cdc2b996a190e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Exportamos los servicios para que puedan ser usados en otros archivos
export { auth, db };
