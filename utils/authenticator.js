const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

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

async function verify2FACode(authToken, secretToken) {
    return speakeasy.totp.verify({
        secret: secretToken,
        encoding: 'base32',
        token: authToken,
    });
}

async function createCookie(tokenData) {
    return `Authorization=${tokenData.token}; Http-Only; Max-Age=${tokenData.expiresIn}`;
}

module.exports = {
    get2FACode,
    verify2FACode,
    createCookie,
};
