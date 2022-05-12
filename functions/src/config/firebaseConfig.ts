const { initializeApp } = require('firebase/app');

const firebaseConfig = {
    apiKey: "AIzaSyC5PM4bdu9FdmqIoh_tWAvjj4aZiVR8i8I",
    authDomain: "artique-34e8e.firebaseapp.com",
    databaseURL: "https://artique-34e8e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "artique-34e8e",
    storageBucket: "artique-34e8e.appspot.com",
    messagingSenderId: "669315096598",
    appId: "1:669315096598:web:3af5fa04cae192c3845537",
    measurementId: "G-N3ZTELY2VD"
};

const firebasApp = initializeApp(firebaseConfig);

module.exports = { firebasApp, firebaseConfig };