const express = require('express');
const Web3 = require('web3');
const app=express();
const cors = require("cors");
const bodyparser =require("body-parser");
const mongoose =require("mongoose");
const AccountRoutes=require("./controller/AccountRoutes");
const ContractRoutes=require("./controller/ContractRoutes");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

require('events').EventEmitter.prototype._maxListeners = 100;


mongoose.set("strictQuery",true);
mongoose.connect("mongodb+srv://Sriganesan:sriganesan@mfa.lfsk2s6.mongodb.net/MFA_User_Data",{ useNewUrlParser: true, useUnifiedTopology: true });
var db=mongoose.connection;
db.on("open",()=>console.log("Connected established to the database!!!!"));
db.on("error",()=>console.log("Error in connection establishment to the database!!"));


app.use("/account",AccountRoutes);
app.use("/contract",ContractRoutes);

app.listen(3030,()=>{
    console.log("Server connected to port:3030")
})
