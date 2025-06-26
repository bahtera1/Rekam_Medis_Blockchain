import web3 from "./web3";
// import ABI dari folder abis
import RekamMedisRS from "./abis/RekamMedisRS.json";

const address = "0x6dEf3740b6CB81c31d251cA3d31881BbBd90BE1a";
const contract = new web3.eth.Contract(RekamMedisRS.abi, address);

export default contract;
