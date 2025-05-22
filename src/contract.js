import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0xBf67885dDAb28BE77961aE90125c3516669C91e3";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
