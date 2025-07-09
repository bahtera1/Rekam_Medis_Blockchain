// src/web3.js
import Web3 from 'web3';

// Mengambil RPC URL dari variabel lingkungan untuk fallback
const RPC_URL = process.env.REACT_APP_RPC_URL;

let web3; // Deklarasikan web3 di luar if/else

// Memastikan window.ethereum (MetaMask) tersedia sebelum mencoba menggunakannya
if (window.ethereum) {
    web3 = new Web3(window.ethereum); // <-- KUNCI: Gunakan provider yang diinjeksikan MetaMask
} else if (RPC_URL) { // Fallback jika window.ethereum tidak tersedia tapi RPC_URL ada
    web3 = new Web3(RPC_URL);
    console.warn("MetaMask tidak terdeteksi. Beberapa fungsi (transaksi) mungkin tidak berfungsi. Hanya mode read-only.");
} else { // Jika tidak ada provider sama sekali
    console.error("Error: Tidak ada provider Web3 yang ditemukan. Harap instal MetaMask atau atur REACT_APP_RPC_URL.");
    // Anda bisa memberikan provider dummy atau melempar error agar aplikasi berhenti
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545")); // Fallback ke localhost sebagai default terakhir
}

export default web3;