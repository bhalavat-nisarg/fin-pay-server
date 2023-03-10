const mongoose = require('mongoose');
const schema = mongoose.Schema;

let userSchema = new schema({
    userId: { type: Number },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    password: { type: String },
    email: { type: String },
    mobile: { type: String },
    verified: { type: String },
    mobileVerified: { type: String },
    emailVerified: { type: String },
    creationDate: { type: Date },
    lastUpdateDate: { type: Date },
});

module.exports = mongoose.model('user', userSchema);