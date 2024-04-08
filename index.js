const express = require('express');
const Web3 = require('web3');
const app=express();
const cors = require("cors");
const bodyparser =require("body-parser");
const ContractRoutes=require("./controller/ContractRoutes");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

require('events').EventEmitter.prototype._maxListeners = 100;

app.use("/contract",ContractRoutes);

app.listen(3030,()=>{
    console.log("BlockChain Server connected to port:3030")
})
