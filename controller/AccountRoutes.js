const express=require("express");
const AccountRoutes=new express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../schema/UserDataSchema');
const generateWallet=require('../wallet/wallet_utils')

AccountRoutes.get("/home",(req,res)=>{
   res.send("hello server"); 
});

AccountRoutes.post('/login', async (req, res) => {
   const { email, password } = req.body;
   const user = await User.findOne({ email });
 
   if (!user) {
     return res.status(404).json({ error: 'User not found' });
   }
 
   const isPasswordValid = await bcrypt.compare(password, user.password);
   
   if (!isPasswordValid) {
     return res.status(401).json({ error: 'Invalid password' });
   }
 
   const token = jwt.sign({ id: user._id, email: user.email }, '6211eb3e330b634779d6cdc24db7b0e90a17d9');
   res.status(200).json({ token });
 });
 
 AccountRoutes.post('/signup', async (req, res) => {
   try {
     const { name, email, password } = req.body;
     const existingUser = await User.findOne({ email });
 
     if (existingUser) {
       return res.status(400).json({ error: 'User already exists' });
     }
   const newWallet = await generateWallet();
   const newAddress = newWallet.address;
   const newPrivateKey = newWallet.privateKey;
   console.log('New Wallet Address:', newAddress);
   console.log('New Wallet Private Key:', newPrivateKey);
   const hashedPassword = await bcrypt.hash(password, 10);
     const user = new User({ name, email, password: hashedPassword,wallet_address:newAddress,private_key:newPrivateKey });
     await user.save();
 
     const token = jwt.sign({ id: user._id, email: user.email }, '6211eb3e330b634779d6cdc24db7b0e90a17d9');
     res.status(201).json({ token });
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 });
 AccountRoutes.put('/updateDappAddress', async (req, res) => {
   try {
     const { email, dapp_address } = req.body;
 
     if (!email || !dapp_address) {
       return res.status(400).json({ error: 'Email and dapp_address are required in the request body' });
     }
 
     const user = await User.findOne({ email });
 
     if (!user) {
       return res.status(404).json({ error: 'User not found' });
     }
 
     // Update the dapp_address for the user
     user.dapp_address = dapp_address;
     await user.save();
 
     res.status(200).json({ message: 'Dapp address updated successfully' });
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 });



module.exports = AccountRoutes;