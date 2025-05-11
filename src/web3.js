import Web3 from 'web3';

let web3;

// Jika di browser dan MetaMask tersedia
if (typeof window !== 'undefined' && window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
        window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (err) {
        console.error('User denied account access', err);
    }
} else {
    // Fallback: Ganache pada localhost
    const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
    web3 = new Web3(provider);
    console.warn('MetaMask tidak ditemukan, menggunakan Ganache RPC');
}

export default web3;
