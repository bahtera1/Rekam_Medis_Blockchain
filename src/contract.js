import web3 from "./web3";
// import ABI dari folder abis
import RekamMedisRS from "./abis/RekamMedisRS.json";

const address = "0x5420AE8CE7E9debf9CB7835159311DeEe2242e90";
const contract = new web3.eth.Contract(RekamMedisRS.abi, address);

export default contract;
