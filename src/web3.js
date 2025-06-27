import Web3 from 'web3';

let web3;

// Jika di browser dan MetaMask tersedia
if (typeof window !== 'undefined' && window.ethereum) {
    // Inisialisasi Web3 dengan provider MetaMask
    web3 = new Web3(window.ethereum);
} else {
    // Fallback: Ganache pada localhost (atau provider lain jika tidak di browser/MetaMask)
    const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
    web3 = new Web3(provider);
    console.warn('MetaMask tidak ditemukan atau tidak diizinkan, menggunakan Ganache RPC (http://127.0.0.1:7545)');
}

export default web3;