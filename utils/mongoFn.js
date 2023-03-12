const mongo = require('./mongo');

const collection = mongo.collection;

const createUser = async (newUser) => {

    const new_user = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        mobile: newUser.mobile,
        username: newUser.username,
        password: newUser.password,
        verified: 'N',
        mobileVerified: 'N',
        emailVerified: 'N',
        currency: newUser.currency,
        creationDate: new Date(),
        lastUpdateDate: new Date()
    };
    console.log(new_user);

    try {

        let result = (await collection.insertOne(new_user)).acknowledged;
        console.log('Ack: ' + result);

        if (result === true) {
            return {
                status: 201,
                message: 'User Created!!',
            };
        }

    } catch (err) {
        let response, userMsg, emailMsg, mobileMsg;
        // console.error('print err', err, err.message);
        dupKeyMsg = err.message.includes('E11000');
        userMsg = err.message.includes('username');
        emailMsg = err.message.includes('email');
        mobileMsg = err.message.includes('mobile');
        uniqueKeyMsg = err.message.includes('unique_key');
        if (dupKeyMsg && userMsg) {
            response = {
                status: 202,
                message:
                    'An account already exists with these details! ' +
                    'Kindly use a different username,',
            };
        } else if (dupKeyMsg && emailMsg) {
            response = {
                status: 202,
                message:
                    'An account already exists with these details! ' +
                    'Kindly use a different email id,',
            };
        } else if (dupKeyMsg && mobileMsg) {
            response = {
                status: 202,
                message:
                    'An account already exists with these details! ' +
                    'Kindly use a different mobile no,',
            };
        } else if (dupKeyMsg && uniqueKeyMsg) {
            response = {
                status: 202,
                message:
                    'An account already exists with these details! ' +
                    'Kindly use a different set of email id, ' +
                    'mobile no, and/or username',
            };
        } else {
            response = {
                status: 400,
                message: err.message,
            };
        }
        return response;
    }

};

const getAllUsers = async () => {
    try {
        let result = await collection.find().sort({ lastName: 1, firstName: 1 });
        const output = await result.toArray();
        // console.log(output);
        return output;
    } catch (err) {
        console.error(err, err.message);
        return err;
    }
};

const getUser = async (user) => {
    let query = { $or: [{ _id: user.id }, { username: user.username }, { email: user.email }, { mobile: user.mobile }] };
    try {
        let result = await collection.findOne(query);
        // const output = await result.toArray();
        return result;
    } catch (err) {
        console.error(err, err.message);
        return err;
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUser
};