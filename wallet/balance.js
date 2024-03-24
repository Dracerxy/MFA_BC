const {Web3}=require('web3');
const infuraApiKey = 'd9b9137d0f3a498bbd9561ed4c65237b';
const selkadiaEndpoint = `https://sepolia.infura.io/v3/${infuraApiKey}`;
const web3 = new Web3(new Web3.providers.HttpProvider(selkadiaEndpoint));
web3.eth.getBalance('0xc1fFfAf449e31b144bE6F908d524e7F08A05f911')
  .then((balance) => {
    console.log('Wallet Balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');
  })
  .catch((error) => {
    console.error('Error checking wallet balance:', error.message);
  });