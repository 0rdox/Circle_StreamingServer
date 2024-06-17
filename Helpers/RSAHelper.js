/**
 * Converts an array of numbers into a string based on a predefined mapping.
 * @param {number[]} values - The array of numbers to be converted.
 * @returns {string} A string representing the input array of numbers.
 */
function getStringFromNumbers(values) {
    let returnArr = [];

    //key - value
    let map = new Map();
    map.set(1, "0");
    map.set(2, "1");
    map.set(3, "2");
    map.set(4, "3");
    map.set(5, "4");
    map.set(6, "5");
    map.set(7, "6");
    map.set(8, "7");
    map.set(9, "8");
    map.set(10, "9");

    map.set(11, "q");
    map.set(12, "w");
    map.set(13, "e");
    map.set(14, "r");
    map.set(15, "t");
    map.set(16, "y");
    map.set(17, "u");
    map.set(18, "i");
    map.set(19, "o");
    map.set(20, "p");
    map.set(21, "a");
    map.set(22, "s");
    map.set(23, "d");
    map.set(24, "f");
    map.set(25, "g");
    map.set(26, "h");
    map.set(27, "j");
    map.set(28, "k");
    map.set(29, "l");
    map.set(30, "z");
    map.set(31, "x");
    map.set(32, "c");
    map.set(33, "v");
    map.set(34, "b");
    map.set(35, "n");
    map.set(36, "m");

    for (let i = 0; i < values.length; i++) {
        returnArr.push(map.get(values[i]));
    }

    return returnArr.join("");
}

/**
 * Decrypts an encrypted string using the provided decryption key.
 * @param {string} encrypted - The encrypted string to be decrypted.
 * @param {Object} encryptionKey - The decryption key.
 * @returns {string} The decrypted string.
 */
function decrypt(encrypted, encryptionKey) {
    //turn string into array
    let encryptedAsArray = encrypted.split(",").map(Number);
    let dycrptedMsg = [];

    //decrypt every number
    for (let i = 0; i < encryptedAsArray.length; i++) {
        //check if every number is actually a number
        if (Number.isInteger(encryptedAsArray[i]) === false) {
            return "-2";
        }

        dycrptedMsg.push(decryptOneNumber(encryptedAsArray[i], encryptionKey));
    }

    //turn numbers back into chars
    return getStringFromNumbers(dycrptedMsg);
}

/**
 * Decrypts a single number using the provided decryption key.
 * @param {number} ciphertext - The number to be decrypted.
 * @param {Object} decryptionKey - The decryption key.
 * @returns {number} The decrypted number.
 */
function decryptOneNumber(ciphertext, decryptionKey) {
    return Number(BigInt(ciphertext) ** BigInt(decryptionKey.d) % BigInt(decryptionKey.n));
}

module.exports = { decrypt };