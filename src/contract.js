import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0xBCB75e870480639e1C39eB50D8d1c3096Fd0b3BB";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
