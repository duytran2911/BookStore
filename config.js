const firebaseConfig = {
    apiKey: "AIzaSyB28QPD5PbANXGA2Fc16KZEyykJPH1Q8Bo",
    authDomain: "spck-3310f.firebaseapp.com",
    projectId: "spck-3310f",
    storageBucket: "spck-3310f.firebasestorage.app",
    messagingSenderId: "327079381194",
    appId: "1:327079381194:web:618bd5b14b66b995dfcc33",
    measurementId: "G-9YEX6Y5JPX"
};

firebase.initializeApp(firebaseConfig);

// Firestore
const db = firebase.firestore();