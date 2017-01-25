var mongoose = require("mongoose");

var swordSchema = mongoose.Schema({	
	password: {type: String,required: true},
	emails: {type: String,required: true},	
	createdAt: { type: Date, default: Date.now }
});


var sword = mongoose.model("sword", swordSchema);

module.exports = sword;
