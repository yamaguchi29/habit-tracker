importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBnpE-sL52xJmprKFarbhoXGSnfS38jS0w",
  authDomain: "habittracker-85b62.firebaseapp.com",
  projectId: "habittracker-85b62",
  storageBucket: "habittracker-85b62.firebasestorage.app",
  messagingSenderId: "613344198802",
  appId: "1:613344198802:web:fc25292d1033df3121e64b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Note: If the payload contains a 'notification' property, Firebase SDK 
  // automatically shows the notification. No need to call showNotification manually.
});
