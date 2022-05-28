const HDWalletProvider = require('truffle-hdwallet-provider');
mnemonic = 'drastic rail this alone joy earn chat present accuse you fame subject';
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
	  ropsten: {
      provider: () => new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/v3/cd80bb5a46b54392b1a27e21f351d32f'),
      network_id: 3,       
      gas: 4000000       
      // skipDryRun: false
    }
  },
  compilers: {
    solc: {
      version: "^0.8.0"
       }
    }
};
