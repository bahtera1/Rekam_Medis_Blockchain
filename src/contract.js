import web3 from "./web3";
// import ABI dari folder abis
import RekamMedisRS from "./abis/RekamMedisRS.json";

const address = "0x43d4a0C81924D30CB888d198bDd22482179BA90B";
const contract = new web3.eth.Contract(RekamMedisRS.abi, address);

export default contract;
