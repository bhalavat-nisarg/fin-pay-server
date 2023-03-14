const mongo = require('./mongo');

const collectionTxn = mongo.collectionTxn;
const collectionUser = mongo.collectionUser;

const loadMoney = async (txnObj) => {
    let query = { _id: txnObj.sourceId };
    let response;

    if (txnObj.mode.toUpperCase() === 'DEPOSIT') {
        if (txnObj.amount < 25.00) {

            collectionTxn.insertOne({
                gateway: 'FinPay',
                method: 'default',
                description: null,
                metadata: {},
                status: 'E',
                error_msg: `The minimum deposit is ${txnObj.currency} 25!`,
                amount: txnObj.amount,
                currency: txnObj.currency,
                auth_id: null,
                source_id: txnObj.sourceId,
                target_id: txnObj.targetId,
                txn_event: 'DEPOSIT',
                creation_date: new Date(),
                created_by: txnObj.sourceId
            });

            return response = {
                status: 400,
                message: `The minimum deposit is ${txnObj.currency} 25!`,
            };
        }

        try {
            let result = await collectionUser.findOneAndUpdate(
                query,
                { $inc: { 'balance': txnObj.amount } },
                { returnNewDocument: true }
            );

            collectionTxn.insertOne({
                gateway: 'FinPay',
                method: 'default',
                description: null,
                metadata: {},
                status: 'S',
                error_msg: null,
                amount: txnObj.amount,
                currency: txnObj.currency,
                auth_id: null,
                source_id: txnObj.sourceId,
                target_id: txnObj.targetId,
                txn_event: 'DEPOSIT',
                creation_date: new Date(),
                created_by: txnObj.sourceId
            });

            return result;

        } catch (err) {
            console.error(err, err.message);
            collectionTxn.insertOne({
                gateway: 'FinPay',
                method: 'default',
                description: null,
                metadata: {},
                status: 'E',
                error_msg: err.message,
                amount: txnObj.amount,
                currency: txnObj.currency,
                auth_id: null,
                source_id: txnObj.sourceId,
                target_id: txnObj.targetId,
                txn_event: 'DEPOSIT',
                creation_date: new Date(),
                created_by: txnObj.sourceId
            });

            return err;
        }
    } else if (txnObj.mode.toUpperCase() === 'WITHDRAW') {
        let user;

        try {
            user = await collectionUser.findOne({ _id: txnObj.sourceId });
        } catch (err) {
            console.error(err, err.message);
            return err;
        }

        if (txnObj.amount < user.balance) {

            collectionTxn.insertOne({
                gateway: 'FinPay',
                method: 'default',
                description: null,
                metadata: {},
                status: 'E',
                error_msg: `Insufficient Balance!`,
                amount: txnObj.amount,
                currency: txnObj.currency,
                auth_id: null,
                source_id: txnObj.sourceId,
                target_id: txnObj.targetId,
                txn_event: 'WITHDRAW',
                creation_date: new Date(),
                created_by: txnObj.sourceId
            });

            return response = {
                status: 400,
                message: `Insufficient Balance!`,
            };
        }

        try {
            let result = await collectionUser.findOneAndUpdate(
                query,
                { $inc: { 'balance': -txnObj.amount } },
                { returnNewDocument: true }
            );

            collectionTxn.insertOne({
                gateway: 'FinPay',
                method: 'default',
                description: null,
                metadata: {},
                status: 'S',
                error_msg: null,
                amount: txnObj.amount,
                currency: txnObj.currency,
                auth_id: null,
                source_id: txnObj.sourceId,
                target_id: txnObj.targetId,
                txn_event: 'WITHDRAW',
                creation_date: new Date(),
                created_by: txnObj.sourceId
            });

            return result;

        } catch (err) {
            console.error(err, err.message);
            collectionTxn.insertOne({
                gateway: 'FinPay',
                method: 'default',
                description: null,
                metadata: {},
                status: 'E',
                error_msg: err.message,
                amount: txnObj.amount,
                currency: txnObj.currency,
                auth_id: null,
                source_id: txnObj.sourceId,
                target_id: txnObj.targetId,
                txn_event: 'WITHDRAW',
                creation_date: new Date(),
                created_by: txnObj.sourceId
            });

            return err;
        }
    } else if (txnObj.mode.toUpperCase() === 'P2P') {
        let user;

        try {
            user = await collectionUser.findOne({ _id: txnObj.sourceId });
        } catch (err) {
            console.error(err, err.message);
            return err;
        }

        if (txnObj.amount < user.balance) {

            collectionTxn.insertOne({
                gateway: 'FinPay',
                method: 'default',
                description: null,
                metadata: {},
                status: 'E',
                error_msg: `Insufficient Balance!`,
                amount: txnObj.amount,
                currency: txnObj.currency,
                auth_id: null,
                source_id: txnObj.sourceId,
                target_id: txnObj.targetId,
                txn_event: 'P2P',
                creation_date: new Date(),
                created_by: txnObj.sourceId
            });

            return response = {
                status: 400,
                message: `Insufficient Balance!`,
            };
        }

        try {
            let source = await collectionUser.findOneAndUpdate(
                query,
                { $inc: { 'balance': -txnObj.amount } },
                { returnNewDocument: true }
            );

            let target = await collectionUser.findOneAndUpdate(
                query,
                { $inc: { 'balance': txnObj.amount } },
                { returnNewDocument: true }
            );

            collectionTxn.insertOne({
                gateway: 'FinPay',
                method: 'default',
                description: null,
                metadata: {},
                status: 'S',
                error_msg: null,
                amount: txnObj.amount,
                currency: txnObj.currency,
                auth_id: null,
                source_id: txnObj.sourceId,
                target_id: txnObj.targetId,
                txn_event: 'P2P',
                creation_date: new Date(),
                created_by: txnObj.sourceId
            });

            return { source_txn: source, target_txn: target };

        } catch (err) {
            console.error(err, err.message);
            collectionTxn.insertOne({
                gateway: 'FinPay',
                method: 'default',
                description: null,
                metadata: {},
                status: 'E',
                error_msg: err.message,
                amount: txnObj.amount,
                currency: txnObj.currency,
                auth_id: null,
                source_id: txnObj.sourceId,
                target_id: txnObj.targetId,
                txn_event: 'P2P',
                creation_date: new Date(),
                created_by: txnObj.sourceId
            });

            return err;
        }
    }


};

module.exports = {
    loadMoney
};