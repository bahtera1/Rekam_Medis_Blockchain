import web3 from "./web3";
// import ABI dari folder abis
import RekamMedisRS from "./abis/RekamMedisRS.json";

const address = "0x5EF37AD852a5290c06C3685f901F4F737851285D";
const contract = new web3.eth.Contract(RekamMedisRS.abi, address);

export default contract;
