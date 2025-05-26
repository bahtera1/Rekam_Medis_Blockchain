import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0x1f27d6Fc1a41310EAf68623d26854E3672c837b0";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
