const os = require('os');

if (os.platform == 'win32') {
    const dotenv = require('dotenv').config();
}

module.exports = {
    app: {
        PORT: process.env.PORT,
        TWO_FACTOR_SECRET: process.env.TWO_FACTOR_SECRET,
    },
    oracle: {
        CONFIG_FILE_PATH: process.env.CONFIG_FILE_PATH,
        ADB_OCID: process.env.ADB_OCID,
        DB_USER: process.env.DB_USER,
        DB_PASS: process.env.DB_PASS,
        DB_CONN_HIGH: process.env.DB_CONN_HIGH,
        DB_CONN_MED: process.env.DB_CONN_MED,
        DB_CONN_TP: process.env.DB_CONN_TP,
    },
    mysql: {
        PORT: process.env.M_PORT,
        HOST: process.env.M_HOST,
        USERNAME: process.env.M_USERNAME,
        PASSWORD: process.env.M_PASSWORD,
        DATABASE: process.env.M_DATABASE,
    },
    postgres: {
        PORT: process.env.P_PORT,
        HOST: process.env.P_HOST,
        USERNAME: process.env.P_USERNAME,
        PASSWORD: process.env.P_PASSWORD,
        DATABASE: process.env.P_DATABASE,
    },
};
