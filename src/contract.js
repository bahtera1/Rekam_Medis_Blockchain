import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0xe402a874ee3d4dE61Ed95E3ceBeFaffEBa8DA2F9";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
