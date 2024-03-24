const { ethers } = require('ethers');
const { EventEmitter } = require('events');
EventEmitter.defaultMaxListeners = 15;

const infuraApiKey = 'd9b9137d0f3a498bbd9561ed4c65237b';
const provider = new ethers.providers.InfuraProvider('sepolia', infuraApiKey); // Adjust network if necessary

const contractAddress = '0xf5531B5106b693158953f36AF85f5B9051Ad0F5f';
const contractABI = [
	{
		"inputs": [],
		"name": "ECDSAInvalidSignature",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "length",
				"type": "uint256"
			}
		],
		"name": "ECDSAInvalidSignatureLength",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "ECDSAInvalidSignatureS",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "dappAddress",
				"type": "address"
			}
		],
		"name": "initiateMFA",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "dappAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "transactionId",
				"type": "bytes32"
			}
		],
		"name": "MFANotification",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isVerified",
				"type": "bool"
			}
		],
		"name": "MFAVerified",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "registerUserWithWallet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "walletAddress",
				"type": "address"
			}
		],
		"name": "UserRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "transactionId",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			}
		],
		"name": "verifyMFA",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isRegistered",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "mfaRequests",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "walletAddresses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // Your contract ABI

const userAddress = '0x5145a8426EB329D6E9bC7bAd56FC13DA22d49C97';
const privateKey = '0xc4c11295504caa07a3abf05e2b089ef668bae8db3cb4cbbd097f052ff404be65';

async function signMFARequest(transactionId, privateKey) {
    try {
        const wallet = new ethers.Wallet(privateKey);
        const signature = await wallet.signMessage(ethers.utils.arrayify(transactionId));
        console.log("Signature:", signature);
        return signature;
    } catch (error) {
        console.error('Error signing MFA request:', error);
        throw error;
    }
}

async function verifyMFA(transactionId, userSignature, dappAddress) {
    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(contractAddress, contractABI, wallet); // Connect contract with wallet
        const gasLimit = await contract.estimateGas.verifyMFA(transactionId, userSignature, { from: userAddress });
        const gasPrice = await provider.getGasPrice();
        console.log("Gas Limit:", gasLimit.toString());
        console.log("Gas Price:", gasPrice.toString());

        const transactionResponse = await contract.verifyMFA(transactionId, userSignature, { gasLimit, gasPrice });
        console.log("MFA verification transaction sent:", transactionResponse.hash);

        await transactionResponse.wait();
        console.log("MFA verification transaction confirmed in block:", transactionResponse.blockNumber);
    } catch (error) {
        console.error('Error verifying MFA:', error);
        throw error;
    }
}

async function listenForMFANotification() {
    try {
        console.log('Listening for MFANotification events...');

        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);

        contract.on('MFANotification', async (user, dappAddress, transactionId, event) => {
            console.log('MFA request received:', { user, dappAddress, transactionId });

            const userSignature = await signMFARequest(transactionId, privateKey);
            await verifyMFA(transactionId, userSignature, dappAddress);
        });
    } catch (error) {
        console.error('Error listening for MFANotification event:', error);
    }
}

(async () => {
    await listenForMFANotification();
})();
