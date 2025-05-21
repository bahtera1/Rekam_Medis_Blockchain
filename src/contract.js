import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0x50d7A9e65436317684cB1E321ff4FC8002855Ad7";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
