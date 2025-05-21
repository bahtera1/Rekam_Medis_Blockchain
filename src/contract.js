import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0xC91F21E5E3cd10222e97163Fc5ffc496bA5cF2fc";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
