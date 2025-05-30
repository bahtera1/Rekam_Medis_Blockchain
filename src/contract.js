import web3 from "./web3";
// import ABI dari folder abis
import RekamMedisRS from "./abis/RekamMedisRS.json";

const address = "0xe36866fA74bd754FA885C001457BF9402bE7dDd7";
const contract = new web3.eth.Contract(RekamMedisRS.abi, address);

export default contract;
