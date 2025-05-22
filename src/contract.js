import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0x11aF77fAE4f6f695082372C6027c566342a8061f";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
