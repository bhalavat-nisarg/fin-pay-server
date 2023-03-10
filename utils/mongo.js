const { MongoClient } = require('mongodb');
const env = require('../utils/env');

const client = new MongoClient(env.DB_URL);

// const dbName = 'cloud';
// const collectionName = 'users';

const dbName = 'mongodbVSCodePlaygroundDB'
const collectionName = 'sales';

const database = client.db(dbName);
const collection = database.collection(collectionName);

const connectToDatabase = async () => {
    try {
        await client.connect();
        console.log(`Connected to the ${dbName} database.`);
    } catch (err) {
        console.error(`Error Connecting to the database: ${err}`);
    }
}


async function searchVal() {
    console.log('Inside Search')
    const findQuery = { item: 'abc' }
    try {
        const findResult = await collection.find(findQuery).sort();
        if (findResult === null) {
            console.log("Couldn't find any recipes that contain 'potato' as an ingredient.\n");
        } else {
            await findResult.forEach(items => {
                console.log(`Found items:\n${JSON.stringify(items)}\n`);
            })
        }
    } catch (err) {
        console.error(`Something went wrong trying to find one document: ${err}\n`);
    }

}

const createUser = async (newUser) => {
    const new_user = {
        firstName: newUser.firstName,

    }
}

module.exports = {
    connectToDatabase,
    searchVal
};