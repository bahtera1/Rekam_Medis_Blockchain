import web3 from "./web3";
// import ABI dari folder abis
import RekamMedisRS from "./abis/RekamMedisRS.json";

const address = "0xE4601a696741C89F84153e1d97eAdc4e324d5ECF";
const contract = new web3.eth.Contract(RekamMedisRS.abi, address);

export default contract;
