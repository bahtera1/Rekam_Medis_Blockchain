import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0x3BBf88f331e7D1B35769063706b714eF8be718e9";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
