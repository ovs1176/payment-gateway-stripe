const mongoose  = require("mongoose");

const customerSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        trim : true
    },
    customerId : {
        type : String,
    },
    tokenId : {
        type : String,
    },
    cardId : [{
        type : String,
    }]
    ,
    isDeleted: {
        type:Boolean,
        default : false
    }
});


module.exports = mongoose.model("Customer", customerSchema);