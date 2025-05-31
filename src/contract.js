import web3 from "./web3";
// import ABI dari folder abis
import RekamMedisRS from "./abis/RekamMedisRS.json";

const address = "0x3D3aBD3725444e5e5f9B2dEFFB5ed3B592958f37";
const contract = new web3.eth.Contract(RekamMedisRS.abi, address);

export default contract;
