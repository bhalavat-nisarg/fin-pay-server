const express = require('express');
const fn = require('./fn');
const oci = require('../utils/oci');
const rateLimit = require('express-rate-limit');
const env = require('../utils/env');
const mongo = require('../utils/mongo')

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
});

const app = express();
const port = env.PORT || 3000;

// apply rate limiter to all requests
app.use(limiter);

// TODO: Log events of login, signup, and delete user

const mode = env.APP_MODE;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('title', 'FinPay Server');

// Mode = 1 // NoSQL Database (MongoDB)


// // Mode = 0 //   SQL Database (Oracle ADB)
// app.post('/api/users/register', fn.registerUser);
// app.post('/api/users/login', fn.loginUser);
// app.post('/api/users/mfa', fn.enable2FAfn);
// app.post('/api/users/verify', fn.verify2FAfn);

// app.patch('/api/users/:id', fn.updateUserDetails);

// app.delete('/api/users/mfa', fn.delete2FAfn);
// app.delete('/api/users/:id', fn.deleteUserAccount);

// app.get('/api/users/:id', fn.getUsers);
// app.get('/api/users', fn.getUsers);

// app.post('/api/txn/exchange', fn.userTransaction);


app.all('*', (req, res) => {
    res.status(405).send({ status: 405, message: 'Method not allowed' });
});

app.listen(port, async () => {
    console.log('Server running on port: ' + port);
    console.log('App Mode: ' + mode);
    await mongo.searchVal()
    // if (mode === 0) {
    //     await oci.loadConfigFile();
    //     fn.getAppStatus();
    // } else {
    //     mongo;
    // }
});
