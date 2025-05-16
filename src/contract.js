import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0x776dd2F28A98b676f1913e0f58c1e24f1665eEA2";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
