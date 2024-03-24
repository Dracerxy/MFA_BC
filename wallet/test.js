const { ethers } = require('ethers');

const infuraApiKey = 'd9b9137d0f3a498bbd9561ed4c65237b';
const provider = new ethers.providers.InfuraProvider('sepolia', infuraApiKey);

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

const contract = new ethers.Contract(contractAddress, contractABI, provider);

const privateKey = '0xc4c11295504caa07a3abf05e2b089ef668bae8db3cb4cbbd097f052ff404be65';

async function signMFARequest(transactionId, privateKey) {
    try {
        const wallet = new ethers.Wallet(privateKey);
        const signature = await wallet.signMessage(transactionId);
        return signature;
    } catch (error) {
        console.error('Error signing MFA request:', error);
        throw error;
    }
}

async function listenForMFANotification() {
    try {
        console.log('Initializing contract...');
        // console.log('Contract ABI:', contractABI);
        // console.log('Contract address:', contractAddress);
        // console.log('Contract instance:', contract);

        contract.on('MFANotification', async (user, dappAddress, transactionId, event) => {
            console.log('MFA request received:', { user, dappAddress, transactionId });

            // // Prompt the user to sign the MFA request
            const userSignature = await signMFARequest(transactionId, privateKey);

            // // Verify the user's signature on the smart contract
            // try {
            //     const tx = await contract.verifyMFA(transactionId, userSignature,dappAddress); // Replace "xxxx" with the appropriate argument
            //     console.log('MFA request verified and confirmed:', tx.hash);
            // } catch (error) {
            //     console.error('Error verifying MFA request:', error);
            // }
			const transaction = await contract.verifyMFA(transactionId,userSignature, dappAddress);

			// Sign the transaction with your wallet's private key
			const wallet = new ethers.Wallet(privateKey, provider);
			const signedTransaction = await wallet.signTransaction(transaction);
	
			// Send the signed transaction
			const transactionResponse = await provider.sendTransaction(signedTransaction);
			console.log('Transaction sent:', transactionResponse.hash);
	
			// Wait for the transaction to be mined
			await transactionResponse.wait();
	
			console.log('Transaction confirmed in block:', transactionResponse.blockNumber);
        });

        console.log('Listening for MFANotification events...');
    } catch (error) {
        console.error('Error listening for MFANotification event:', error);
    }
}

// Call the function to listen for MFANotification events
listenForMFANotification();
