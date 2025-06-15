import web3 from "./web3";
// import ABI dari folder abis
import RekamMedisRS from "./abis/RekamMedisRS.json";

const address = "0x13BBEe715e110D0129f7259089449e585907b2d6";
const contract = new web3.eth.Contract(RekamMedisRS.abi, address);

export default contract;
