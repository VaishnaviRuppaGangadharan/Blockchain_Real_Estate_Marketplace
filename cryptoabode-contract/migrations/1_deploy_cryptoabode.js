const crypto = artifacts.require("./CryptoAbode.sol");
const realT = artifacts.require("./RealT.sol");

module.exports = async function (deployer) {
  // deployer.deploy(crypto);

  await deployer.deploy(realT);
  const realTObj = await realT.deployed();
  
  await deployer.deploy(crypto, realTObj.address);
  const cryptoObj = await crypto.deployed();

  await realTObj.updateApprovedMarket(cryptoObj.address);
};
