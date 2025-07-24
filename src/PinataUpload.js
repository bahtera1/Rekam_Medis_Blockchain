import axios from "axios";

// Mengambil token dari environment variable
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

export async function uploadToPinata(file) {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await axios.post(url, formData, {
            maxContentLength: "Infinity",
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: PINATA_JWT,
            },
        });
        const ipfsHash = res.data.IpfsHash;
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    } catch (err) {
        console.error("Upload to Pinata failed:", err);
        throw err;
    }
}
