import web3 from "./web3";
// import ABI dari folder abis
import RekamMedis from "./abis/RekamMedis.json";

const address = "0x4Fe13A99DffEc4FF9905E75450Ba3c3d4bdD2468";
const contract = new web3.eth.Contract(RekamMedis.abi, address);

export default contract;
