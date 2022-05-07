const oracledb = require('oracledb');
const os = require('os');

if (os.platform == 'win32') {
    const dotenv = require('dotenv').config();
}

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const dbStr = process.env.DB_CONN_STRING;

let libPath;
let pool;

if (os.platform == 'win32') {
    libPath = 'C:\\Program Files\\Oracle\\instantclient_21_3';
}

async function run() {
    //console.log(libPath);
    try {
        oracledb.initOracleClient({
            libDir: libPath,
        });
        oracledb.version;

        //console.log('File opened!');
    } catch (err) {
        console.error('Whoops!');
        console.error(err);
        process.exit(1);
    }

    try {
        pool = await oracledb.createPool({
            user: user,
            password: pass,
            connectString: dbStr,
            poolAlias: 'default',
            poolMax: 4,
            poolMin: 4,
            poolIncrement: 0,
        });
        console.log('Connection pool started');

        await openConnection();
    } catch (err) {
        console.error('init() error: ' + err.message);
    } finally {
        await closePoolAndExit();
    }
}

async function openConnection() {
    let connection;
    //console.log('Connection started');
    try {
        connection = await pool.getConnection();
        const sql = `SELECT sysdate FROM dual`;
        const binds = [1];
        const result = await connection.execute(sql);
        console.log(result);
    } catch (err) {
        throw err;
    } finally {
        if (connection) {
            try {
                //console.log('releasing connection');
                await connection.close();
            } catch (err) {
                throw err;
            }
        }
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating...');
    try {
        await oracledb.getPool().close(10);
        console.log('Pool Closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = {
    dbConnect: run(),
};
