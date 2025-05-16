import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0xbD3f24D614d48B2ae54f8c370cC90fcbEDC2303D";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
