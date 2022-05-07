const oracledb = require('oracledb');
const dbConfig = require('./dbConfig');
const users = require('../schema/user');
const db = require('./connection');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let libPath;
let pool;

if (process.platform == 'win32') {
    libPath = 'C:\\Program Files\\Oracle\\instantclient_21_3';
}

// async function createUser(newUser) {
//     pool = await db.openPool();

// }
