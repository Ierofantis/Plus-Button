var mongoose = require("mongoose");

var swordSchema = mongoose.Schema({	
	password: {type: String},	
	emails: {type: String},	
	code: {type: Number},	
	createdAt: { type: Date, default: Date.now }	
});

var sword = mongoose.model("sword", swordSchema);

module.exports = sword;
