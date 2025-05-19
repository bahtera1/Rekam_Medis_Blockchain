import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0xe4a242FD255b0405c124b7b434E6EE9d1CD3bB26";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
