require('dotenv').config();
const webPush = require('web-push');
const path = require("path")

const database = require('./database'); // Ensure your database module is correctly set up
const { rejects } = require('assert');


//loading vapid keys
const publicVapidKey = process.env.PUBLIC_VAPID_KEY
const privateVapidKey = process.env.PRIVATE_VAPID_KEY

webPush.setVapidDetails('mailto:shafaath508@gmail.com', publicVapidKey, privateVapidKey);

async function sendNotification(device, message) {

    if (device) {
        const payload = JSON.stringify({
            title: `New Message from ${message.sender}`,
            body: message.content,
            icon: path.join(__dirname, "/public/assets/images/good-logo.png")
        });
        return new Promise((resolve, reject) => {

            webPush.sendNotification(device, payload)
                .then(() => {
                    resolve({ ok: true })
                })

                .catch(err => {
                    resolve({ ok: false, errMessage: err });
                })
        })
    }
    else {
        return { ok: false, errMessage: "User not registered for push notifications" };
    }

}

module.exports = { sendNotification }