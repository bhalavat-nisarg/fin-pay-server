const express = require('express');
const fn = require('./fn');
const os = require('os');
const oci = require('../utils/oci');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
});

if (os.platform == 'win32') {
    const dotenv = require('dotenv').config();
}

const app = express();
const port = process.env.PORT || 3000;

// apply rate limiter to all requests
app.use(limiter);

// TODO: Log events of login, signup, and delete user

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('title', 'FinPay Server');

app.post('/api/users/register', fn.registerUser);
app.post('/api/users/login', fn.loginUser);
app.post('/api/users/mfa', fn.enable2FAfn);
app.post('/api/users/verify', fn.verify2FAfn);

app.patch('/api/users/:id', fn.updateUserDetails);

app.delete('/api/users/mfa', fn.delete2FAfn);
app.delete('/api/users/:id', fn.deleteUserAccount);

app.get('/api/users/:id', fn.getUsers);
app.get('/api/users', fn.getUsers);

app.post('/api/txn/exchange', fn.userTransaction);

app.all('*', (req, res) => {
    res.status(405).send({ status: 405, message: 'Method not allowed' });
});

app.listen(port, async () => {
    console.log('Server running on port: ' + port);
    await oci.loadConfigFile();
    fn.getAppStatus();
});
