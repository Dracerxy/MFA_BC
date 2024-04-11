const express = require("express");
const ContractRoutes = express.Router();
const { Web3 } = require('web3');
const { ethers, errors } = require('ethers');
const generateWallet=require('../wallet/wallet_utils')
const infuraApiKey = 'd9b9137d0f3a498bbd9561ed4c65237b';
const provider = new ethers.providers.InfuraProvider('sepolia', infuraApiKey);
const selkadiaEndpoint = `https://sepolia.infura.io/v3/${infuraApiKey}`;
const web3 = new Web3(new Web3.providers.HttpProvider(selkadiaEndpoint));
const relayerprivateKey = '0xc52796f8cc4819dc9a0ea264985c8acf6d73f1ee1a2fb2db2656dba4034af983'; 
const relayerAddress = '0x3A83b78581c682813fd206af7fFD8c90d7ae81bE';

const contractAddress = '0xBdF3eA27fC353f85C88BE5c6878843Ac186a5149';
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
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
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
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
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
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
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
		"inputs": [],
		"name": "relayer",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
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
];
const contract = new ethers.Contract(contractAddress, contractABI, provider);
const contractweb3 = new web3.eth.Contract(contractABI, contractAddress);

ContractRoutes.get("/home", (req, res) => {
    res.send("hello server");
});
ContractRoutes.post("/initiateMFA", async (req, res) => {
    try {
        // Retrieve user data from the database
		const { address, dapp_address } = req.body;
        // Check if the user is already registered on the blockchain
		const isRegistered = await contractweb3.methods.isRegistered(address).call({ from: address });

        if (!isRegistered) {
            // Build the transaction
			const txNonce = await web3.eth.getTransactionCount(relayerAddress);
			const transactionObject = contractweb3.methods.registerUserWithWallet(address);
            const transactionData = transactionObject.encodeABI();
			const gas =await contractweb3.methods.registerUserWithWallet(address).estimateGas({ from: relayerAddress });
            const gasPrice = await web3.eth.getGasPrice();
            const rawTransaction = {
                from: relayerAddress,
                to: contractAddress,
                gas,
                gasPrice,
                data: transactionData,
                nonce:txNonce,
            };
            // Sign the transaction
            const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction,relayerprivateKey);
            // Send the signed transaction
            const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
			console.log("User registered on the blockchain");

        }else{
			console.log("already registered!!!!");
		}

        // // Initiate MFA for the user
		const gas = await contractweb3.methods.initiateMFA(address,dapp_address).estimateGas({ from: relayerAddress });
		const gasPrice = await web3.eth.getGasPrice();
		
		// Build the transaction
		const transactionObject = contractweb3.methods.initiateMFA(address,dapp_address);
		const transactionData = transactionObject.encodeABI();
		const nonce = await web3.eth.getTransactionCount(relayerAddress);
		
		const rawTransaction = {
			from:relayerAddress,
			to: contractAddress,
			gas,
			gasPrice,
			data: transactionData,
			nonce,
		};
		
		// Sign the transaction
		const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, relayerprivateKey);
		
		// Send the signed transaction
		const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

		console.log("MFA initiation transaction sent");

        // Listen for MFAVerified event
        contract.once('MFAVerified', (user, isVerified) => {
            if (isVerified) {
                console.log("MFA verified successfully");
                return res.status(200).json({ message: "MFA verified successfully" });
            } else {
                console.log("MFA verification failed");
                return res.status(400).json({ message: "MFA verification failed" });
            }
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal server error"+error });
    }
});

ContractRoutes.get("/get-wallet", async(req, res) => {
	try{
	const newWallet = await generateWallet();
	const newAddress = newWallet.address;
	const newPrivateKey = newWallet.privateKey;
    return res.status(200).json({address:newAddress,key:newPrivateKey});
}catch(error){
	console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
}});


module.exports = ContractRoutes;
