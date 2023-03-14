const mongo = require('./mongo');

const collectionTxn = mongo.collectionTxn;
const collectionUser = mongo.collectionUser;

const loadMoney = async (txnObj) => {
    let query = { _id: new mongo.ObjectId(txnObj.sourceId) };
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
                message: `The minimum deposit amount is ${txnObj.currency} 25!`,
            };
        }

        try {
            let user = await collectionUser.findOne(query);

            console.log('Printing user', user);

            let result = await collectionUser.updateOne(
                query,
                { $set: { 'balance': user.balance + txnObj.amount } }
            );
            console.log('Inside Deposit update..');

            console.log(result);
            if (result.modifiedCount === 1) {

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

                return null;
            } else {
                throw new Error('Error: User not found!');
            }


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
            user = await collectionUser.findOne(query);
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
            let result = await collectionUser.updateOne(
                query,
                { $set: { 'balance': user.balance - txnObj.amount } }
            );

            if (result.modifiedCount > 0) {
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

                return null;

            } else {
                throw new Error('Error: Withdrawal transaction failed!');
            }


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
        let sourceUser;
        let targetUser;

        try {
            sourceUser = await collectionUser.findOne(query);
            targetUser = await collectionUser.findOne(
                { _id: new mongo.ObjectId(txnObj.targetId) }
            );
        } catch (err) {
            console.error(err, err.message);
            return err;
        }

        if (txnObj.amount < sourceUser.balance) {

            collectionTxn.insertOne({
                gateway: 'FinPay',
                method: 'default',
                description: null,
                metadata: {},
                status: 'E',
                error_msg: `Insufficient Balance in Source Account!`,
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
            let source = await collectionUser.updateOne(
                query,
                { $set: { 'balance': sourceUser.balance - txnObj.amount } }
            );

            let target = await collectionUser.updateOne(
                { _id: new mongo.ObjectId(txnObj.targetId) },
                { $set: { 'balance': targetUser.balance + txnObj.amount } }
            );

            if (source.modifiedCount > 0 && target.modifiedCount > 0) {
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

                return null;
            } else if (source.matchedCount === 0 || target.modifiedCount == 0) {
                throw new Error('Error: P2P Transaction failed!');
            }

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