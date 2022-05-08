const oracledb = require('oracledb');
const dbConfig = require('./dbConfig');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let libPath;
let poolName = 'default';

if (process.platform == 'win32') {
    libPath = 'C:\\Program Files\\Oracle\\instantclient_21_3';
}

async function initDB() {
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
}

async function openPool() {
    try {
        const pool = await oracledb.createPool({
            user: dbConfig.username,
            password: dbConfig.password,
            connectString: dbConfig.connection,
            poolAlias: poolName,
            poolMax: 10,
            poolMin: 10,
            poolIncrement: 0,
        });
        console.log('Connection pool started for ' + poolName);

        return pool;
    } catch (err) {
        console.error('init() error: ' + err.message);
    }
}

async function openConnection(pool, Query, bindOpts) {
    let connection, sql, binds, result;

    console.log('Connection started');
    try {
        connection = await pool.getConnection();
        if (Query == null) {
            sql = `SELECT sysdate FROM dual`;
            binds = [];
        } else {
            sql = Query;
            binds = bindOpts;
        }
        result = await connection.execute(sql, binds);
        //console.log(result);
        return result;
    } catch (err) {
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.commit();
                console.log('Releasing connection');
                await connection.close();
            } catch (err) {
                throw err;
            }
        }
    }
}

async function closePool(pool) {
    //console.log('\nTerminating...');
    try {
        console.log('Closing Pool ' + poolName);
        //await oracledb.getPool(poolName).close(10);
        await pool.close(10);
        //process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

async function checkPoolStatus() {
    return oracledb.getPool(poolName).status;
}

function getPool() {
    return oracledb.getPool(poolName);
}

module.exports = {
    initializeDB: initDB,
    checkPoolStatus: checkPoolStatus,
    openPool: openPool,
    getPool: getPool,
    closePool: closePool,
    openConnection: openConnection,
};
