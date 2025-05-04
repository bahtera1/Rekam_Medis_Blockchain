// src/web3.js
import Web3 from "web3";

// Menyambungkan ke Ethereum menggunakan MetaMask
let web3;
if (window.ethereum) {
    web3 = new Web3(window.ethereum);
} else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
} else {
    console.log("Please install MetaMask to use this app");
}

export default web3;
