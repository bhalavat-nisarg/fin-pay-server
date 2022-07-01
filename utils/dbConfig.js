const env = require('./env');

module.exports = {
    oracle: {
        username: env.oracle.DB_USER,
        password: env.oracle.DB_PASS,
        dbHigh: env.oracle.DB_CONN_HIGH,
        dbMedium: env.oracle.DB_CONN_MED,
        dbTxn: env.oracle.DB_CONN_TP,
    },
    mysql: {
        host: env.mysql.HOST,
        port: env.mysql.PORT,
        username: env.mysql.USERNAME,
        password: env.mysql.PASSWORD,
        database: env.mysql.DATABASE,
    },
    postgres: {
        host: env.postgres.HOST,
        port: env.postgres.PORT,
        username: env.postgres.USERNAME,
        password: env.postgres.PASSWORD,
        database: env.postgres.DATABASE,
    },
};
