// 2_deploy_rekammedis.js
const RekamMedis = artifacts.require("RekamMedis");

module.exports = function (deployer) {
    // Deploy kontrak RekamMedis
    deployer.deploy(RekamMedis);
};
