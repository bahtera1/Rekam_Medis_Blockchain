import web3 from "./web3";
// import ABI dari folder abis
import RekamMedisRS from "./abis/RekamMedisRS.json";

const address = process.env.REACT_APP_CONTRACT_ADDRESS;
// Pastikan alamat kontrak telah dimuat
if (!address) {
    console.error("Alamat kontrak tidak ditemukan. Pastikan Anda telah mengatur REACT_APP_CONTRACT_ADDRESS di file .env");
}

const contract = new web3.eth.Contract(RekamMedisRS.abi, address);

export default contract;