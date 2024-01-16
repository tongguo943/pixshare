let crypto = require("crypto"); 

/**
 * Return a salted and hashed password entry from a clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry where passwordEntry is an object with two
 * string properties:
 *    salt - The salt used for the password.
 *    hash - The sha1 hash of the password and salt.
 */
function makePasswordEntry(clearTextPassword) {
    let hash = crypto.createHash('sha1');
    let salt = crypto.randomBytes(8).toString('hex');
    hash.update(clearTextPassword + salt);
    return {
        salt: salt,
        hash: hash.digest('hex')
    };
}


/**
 * Return true if the specified clear text password and salt generates the
 * specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
    let hash2 = crypto.createHash('sha1');
    hash2.update(clearTextPassword + salt);
    let password = hash2.digest('hex');
    return password === hash;
}

module.exports = {
    makePasswordEntry: makePasswordEntry,
    doesPasswordMatch: doesPasswordMatch
};