import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0xc56C9b701a73e60d0cBCb9777Ce1D95D124fC5D5";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
