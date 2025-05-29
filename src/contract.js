import web3 from "./web3";
// import ABI dari folder abis
import RekamMedisRS from "./abis/RekamMedisRS.json";

const address = "0xA3485e0405a7DE6Fe6a43A6390b1B133cFe182bE";
const contract = new web3.eth.Contract(RekamMedisRS.abi, address);

export default contract;
