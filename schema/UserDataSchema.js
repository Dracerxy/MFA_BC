const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  wallet_address:{type:String,required:true},
  private_key:{type:String,require:true},
  dapp_address:{type:String}
}, {
  collection: "data"
});

module.exports = mongoose.model("data", userSchema);
