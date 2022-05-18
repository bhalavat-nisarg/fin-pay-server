const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');

async function get2FACode() {
    console.log('2FA App: ', process.env.TWO_FACTOR_SECRET);

    const secretCode = speakeasy.generateSecret({
        name: process.env.TWO_FACTOR_SECRET,
    });

    return {
        otpAuthUrl: secretCode.otpauth_url,
        base32: secretCode.base32,
    };
}

async function verify2FACode(authToken, user) {
    return speakeasy.totp.verify({
        secret: user.authCode,
        encoding: 'base32',
        token: authToken,
    });
}

async function respondQRCode(data, response) {
    QRCode.toFileStream(response, data);
}

async function createCookie(tokenData) {
    return `Authorization=${tokenData.token}; Http-Only; Max-Age=${tokenData.expiresIn}`;
}

async function createToken(user, isSecondFactor) {
    const expiresIn = 60 * 60;
    const secret = process.env.JWT_SECRET;
    const dataToken = {
        isSecondFactor,
        userId: user.user_id,
    };

    return {
        expiresIn,
        token: jwt.sign(dataToken, secret, { expiresIn }),
    };
}

module.exports = {
    get2FACode,
    verify2FACode,
    respondQRCode,
    createCookie,
    createToken,
};
