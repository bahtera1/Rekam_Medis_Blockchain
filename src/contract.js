import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0x69308F0d262e7bDDBB02F602C7D2D4dc24F9F7Bd";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
