

function splitIntoGroupsOfFive(message) {
    const groups = [];
    for (let i = 0; i < message.length; i += 5) {
        groups.push(message.slice(i, i + 5));
    }
    return groups;
}
function encryptMessage(message) {

    let encryptedMessage = "";
    for (let char of message) {
        encryptedMessage += encryptionMap[char];
    }

    return encryptedMessage;
}

function decryptMessage(message) {
    const chars = splitIntoGroupsOfFive(message);
    let decryptedMessage = "";
    for (let char of chars) {

        decryptedMessage += decryptionMap[char];

    }

    return message;
}

const message = "Hello world";
console.log('Original Message', message);

const encryptedMessage = encryptMessage(message);

console.log("Encrypted Message", encryptedMessage);

const decryptedMessage = decryptMessage(encryptMessage);
console.log("Decryped Message", decryptedMessage);