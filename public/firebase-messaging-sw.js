// Service worker de Firebase Cloud Messaging: recibe los avisos push del bot de Instagram
// aunque la app "Al Fallo Admin" esté cerrada. Firebase muestra la notificación sola.
/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDzq1YMmk1KGBAVB6JU7Yl9T2OJUE1XDd4",
  authDomain: "fragancesnet.firebaseapp.com",
  projectId: "fragancesnet",
  storageBucket: "fragancesnet.firebasestorage.app",
  messagingSenderId: "10863367691",
  appId: "1:10863367691:web:16d834616cdc2b996a190e",
});

firebase.messaging();
