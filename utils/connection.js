const oracledb = require('oracledb');
const dbConfig = require('./dbConfig');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let libPath;
let pool;

if (process.platform == 'win32') {
    libPath = 'C:\\Program Files\\Oracle\\instantclient_21_3';
}

async function connect() {
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
            user: dbConfig.username,
            password: dbConfig.password,
            connectString: dbConfig.connection,
            poolAlias: 'default',
            poolMax: 4,
            poolMin: 4,
            poolIncrement: 0,
        });
        console.log('Connection pool started');

        return pool;
    } catch (err) {
        console.error('init() error: ' + err.message);
    }
    // finally {
    //     await closePoolAndExit();
    // }
}

async function openConnection(pool, Query, bindOpts) {
    let connection, sql, binds;

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
        const result = await connection.execute(sql, binds);
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
    openPool: connect,
    openConnection: openConnection,
    closePool: closePoolAndExit,
};
