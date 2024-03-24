const {Web3} = require('web3');
const infuraApiKey = 'd9b9137d0f3a498bbd9561ed4c65237b';
const selkadiaEndpoint = `https://sepolia.infura.io/v3/${infuraApiKey}`;
const web3 = new Web3(new Web3.providers.HttpProvider(selkadiaEndpoint));


const contractABI =[
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
		"inputs": [],
		"name": "registerUserWithWallet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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
			},
			{
				"internalType": "address",
				"name": "dappAddress",
				"type": "address"
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
];

const contractAddress = '0xdcbDd89869c68026B1870ACAB4d2fe0Cf69C73D5';
const userAddress = '0x5145a8426EB329D6E9bC7bAd56FC13DA22d49C97';
const privateKey = '0xc4c11295504caa07a3abf05e2b089ef668bae8db3cb4cbbd097f052ff404be65';

async function signMFARequest(transactionId, privateKey) {
    try {
        const signature = await web3.eth.accounts.sign(transactionId, privateKey);
        return signature.signature;
    } catch (error) {
        console.error('Error signing MFA request:', error);
        throw error;
    }
}

async function verifyMFA(transactionId, userSignature, dappAddress) {
    try {
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const gas = await contract.methods.verifyMFA(transactionId, userSignature, dappAddress).estimateGas({ from: userAddress });
        const gasPrice = await web3.eth.getGasPrice();

        const transactionObject = contract.methods.verifyMFA(transactionId, userSignature, dappAddress);
        const encodedABI = transactionObject.encodeABI();
        const nonce = await web3.eth.getTransactionCount(userAddress);

        const rawTransaction = {
            from: userAddress,
            to: contractAddress,
            gas,
            gasPrice,
            data: encodedABI,
            nonce,
        };

        const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

        console.log('MFA verification transaction sent. Transaction receipt:', receipt);
    } catch (error) {
        console.error('Error verifying MFA:', error);
        throw error;
    }
}

// Function to check and register user
async function checkAndRegisterUser() {
    try {
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const isUserRegistered = await contract.methods.isRegistered(userAddress).call();

        if (!isUserRegistered) {
            const gas = await contract.methods.registerUserWithWallet().estimateGas({ from: userAddress });
            const gasPrice = await web3.eth.getGasPrice();

            const transactionObject = contract.methods.registerUserWithWallet();
            const encodedABI = transactionObject.encodeABI();
            const nonce = await web3.eth.getTransactionCount(userAddress);

            const rawTransaction = {
                from: userAddress,
                to: contractAddress,
                gas,
                gasPrice,
                data: encodedABI,
                nonce,
            };

            const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

            console.log('User registered. Transaction receipt:', receipt);
        } else {
            console.log('User is already registered');
        }
    } catch (error) {
        console.error('Error checking and registering user:', error);
        throw error;
    }
}

async function listenForMFANotification() {
    try {
        console.log('Listening for MFANotification events...');

        return new Promise((resolve, reject) => {
            const contract = new web3.eth.Contract(contractABI, contractAddress);

            const eventListener = contract.events.MFANotification({ filter: { user: userAddress } })
                .on('data', async (event) => {
                    console.log('MFA request received:', event.returnValues);
                    
                    await checkAndRegisterUser();
                    const userSignature = await signMFARequest(event.returnValues.transactionId, privateKey);
                    await verifyMFA(event.returnValues.transactionId, userSignature, event.returnValues.dappAddress);
                    
                    // Resolve the promise after processing the event
                    resolve();
                })
                .on('error', (error) => {
                    console.error('Error listening for MFANotification event:', error);
                    reject(error);
                });
        });
    } catch (error) {
        console.error('Error listening for MFANotification event:', error);
        throw error;
    }
}

// Call the function to listen for MFANotification events
(async () => {
    try {
        await listenForMFANotification();
    } catch (error) {
        console.error('Error:', error);
    }
})();