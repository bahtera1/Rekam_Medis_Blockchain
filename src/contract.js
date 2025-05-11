import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0x5e457f9Dc4024Fa256156ddF8c036Aa9c9646bfB";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
