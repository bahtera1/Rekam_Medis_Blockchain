import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0x397cd3F208DC79e93FF18Af1E7591511BB6396b4";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
