import axios from "axios";

const PINATA_JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhYWFjNmUyNi1mNjJiLTQ1NjUtOTE0Ny0zZjEzMGJjZTZkZjQiLCJlbWFpbCI6Im5hdWZhbGFqYTA4MEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYTU4OTZmMWIyYjBkYTVlZTU2YTAiLCJzY29wZWRLZXlTZWNyZXQiOiJjMDFiYjZmMjAxYzE4OWI1YzIwZjY0ZTQyZWRhZDU4ZjVhYmJkMTk5NDAyMjhhMTMzMWFhN2Y4Mjk4YmEyMTIyIiwiZXhwIjoxNzc5NjQyMjMyfQ.Tsg3OrfSfX9c-9D10aw6aVRoA9BZ4dWZm-SwzFvV8-s"; // prepend 'Bearer '

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
        throw err;
    }
}
