// src/contract.js
import web3 from './web3';

// ABI dan alamat kontrak yang telah dideploy dari Ganache atau Rinkeby
const abi = [
    // ABI yang didapatkan setelah kompilasi dan deploy kontrak
];

const address = process.env.REACT_APP_CONTRACT_ADDRESS;  // Alamat kontrak dari .env

// Membuat instance kontrak
const contract = new web3.eth.Contract(abi, address);

export default contract;
