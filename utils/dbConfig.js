const os = require('os');
if (os.platform == 'win32') {
    const dotenv = require('dotenv').config();
}

module.exports = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    connection: process.env.DB_CONN_STRING,
};
