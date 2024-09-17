const express = require('express');
const { createServer, get } = require('http');
const { join } = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const WebSocket = require("ws");
const { v4: uuidv4 } = require('uuid');
const { initializeDatabase, getDatabase } = require('./database'); // Ensure your database module is correctly set up
const app = express();
const hf = require("./helper_funcitons")
const fuse = require("./fuse")
const { upload, uploadToGridFS } = require("./upload");
const { ObjectId, Double } = require("mongodb");
const { send } = require('process');
const notifcations = require("./notifications")
const ai = require("./ai")
const port = process.env.PORT || 3000;


/**Initilizing the database and running the server */

var server;
initializeDatabase().then(() => {
    server = app.listen(port, '0.0.0.0', () => {
        console.log(`Server running at http://0.0.0.0:${port}`)
    })


    // Middleware to parse JSON and URL-encoded bodies
    app.use(express.static(join(__dirname, '/public')));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Middleware for cookies and sessions
    const sessionMiddleware = session({
        // store: new RedisStore({ client }),
        secret: 'ddfd58d8f5d53#@%hgg55$#',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true if using HTTPS
            maxAge: 3600000 // Session expiration time in milliseconds (1 hour in this example)
        }
    });
    app.use(sessionMiddleware);
    app.use(cookieParser());
    //request a test notification

    const { db, gfs } = getDatabase();



    //subscribing the push notifcations user
    app.post('/subscribe', async (req, res) => {
        const { db, gfs } = getDatabase();
        const sessionId = req.session.sessionId;
        const user = await db.collection('session_tokens').findOne({ session_id: sessionId });
        if (user) {
            try {
                await db.collection('devices').updateOne({ userid: user.userid }, { $push: { device: req.body } }, { upsert: true });
                res.send({ ok: true })

            } catch (error) {
                res.send({ ok: false, errMessage: "Internal Server Error" })

            }
        }
        else {
            res.send({ ok: false, errMessage: "No Account Found" })
        }

    })
    // Get file by ID
    app.post('/files/id/', async (req, res) => {
        const { db, gfs } = getDatabase();
        const sessionId = req.session.sessionId;
        const user = await db.collection('session_tokens').findOne({ session_id: sessionId });

        if (!user) {
            res.send({ ok: false })
        }
        try {
            const fileId = new ObjectId(req.body.id); // Use provided ID or fallback

            const files = await gfs.find({ _id: fileId }).toArray();

            if (!files || files.length === 0) {
                return res.status(404).json({ err: 'No file exists' });
            }

            const file = files[0];
            const fileSize = file.length
            res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
            res.setHeader('Content-Type', file.contentType);
            res.setHeader('Content-Length', fileSize);

            const readstream = gfs.openDownloadStream(file._id);
            let byteSent = 0;
            readstream.on('data', (chunk) => {
                byteSent += chunk.length
            })
            readstream.on('error', (err) => {
                console.error('Error in stream:', err);
                res.status(500).json({ err: 'Error fetching file from database' });
            });
            readstream.pipe(res);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ err: 'Internal Server Error' });
        }
    });




    const onlineUsers = {}
    const wss = new WebSocket.Server({ noServer: true })
    server.on('upgrade', (request, socket, head) => {
        sessionMiddleware(request, {}, () => {
            if (!request.session.sessionId) {
                socket.destroy();
                return;
            }

            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        });
    });

    wss.on('connection', async (ws, request) => {

        const sessionId = request.session.sessionId;
        const { db, gfs } = getDatabase();
        const user = await db.collection("session_tokens").findOne({ session_id: sessionId });
        if (user) {

            if (onlineUsers[user.userid]) {
                ws.userid = user.userid
                onlineUsers[user.userid].push(ws);
            }
            else {
                onlineUsers[user.userid] = [ws];
                ws.userid = user.userid
            }
            ws.on('message', async (message) => {
                const data = JSON.parse(message)
                data.status = 1
                if (data.type == "chat-opened") {
                    let query = { participants: { $all: [user.userid, data.recepient] } };
                    let update = {
                        $set: {
                            "messages.$[elem].status": 1  // Update status from 0 to 1
                        }
                    };

                    let options = {
                        arrayFilters: [{
                            "elem.status": 0,
                            "elem.receiver": user.userid
                        }]
                    };

                    await db.collection("chats").updateOne(query, update, options);
                    const friendWs = onlineUsers[data.recepient];
                    if (friendWs && friendWs.length) {
                        for (let friend of friendWs) {
                            friend.send(JSON.stringify({ type: "chat-opened", sender: user.userid, recepient: user.userid }))

                        }

                    }

                }

                else if (data.type == 'typing') {
                    const friendWs = onlineUsers[data.recepient];
                    if (friendWs && friendWs.length) {
                        for (let friend of friendWs) {
                            friend.send(JSON.stringify({ type: 'typing', typeStatus: data.typeStatus, recepient: user.userid }))
                        }
                    }
                }

                else if (data.type == 'delete-message') {
                    let query = { participants: { $all: [user.userid, data.friendId] } };
                    const messageIndex = data.messageIndex;
                    const messages = await db.collection('chats').findOne(query)

                }


            })


            //sending message
            app.post('/message', async (req, res) => {
                const data = req.body;

                hf.reorderFriends(db, data.sender, data.receiver)
                hf.reorderFriends(db, data.receiver, data.sender)

                data.status = 0;
                const senders = onlineUsers[data.sender]
                const recepients = onlineUsers[data.receiver];


                let query = { participants: { $all: [data.sender, data.receiver] } };
                let update = { $push: { messages: data } }
                let currentConvo = await db.collection('chats').findOne(query);
                if (currentConvo) {

                    await db.collection('chats').updateOne(query, update)
                }

                else {
                    let newConversation = { participants: [data.sender, data.receiver], messages: [data] }
                    await db.collection('chats').insertOne(newConversation)
                }

                // ws.send(JSON.stringify({ type: 'message-received', index: data.index }))

                if (recepients && recepients.length) {

                    for (let recepient of recepients) {

                        recepient.send(JSON.stringify({ data }))
                    }

                }
                if (recepients && recepients.length == 0) {
                    //offline recepients
                    const device = await db.collection('devices').findOne({ userid: data.receiver }, { projection: { _id: 0, device: 1 } })
                    if (device) {
                        const sender_data = await db.collection('user_data').findOne({ userid: data.sender }, { projection: { _id: 0, username: 1 } });
                        const devices = device.device
                        for (const device of devices) {

                            await notifcations.sendNotification(device, { sender: sender_data.username, content: data.message })
                        }
                    }
                }

                res.send({ ok: true })
            })

            app.post('/message-ai', async (req, res) => {
                const data = req.body;
                if (data.receiver == -1) {

                    hf.reorderFriends(db, data.sender, data.receiver)
                    hf.reorderFriends(db, data.receiver, data.sender)
                    data.status = 1;

                    let databaseQuery = { participants: { $all: [data.sender, data.receiver] } };
                    let update = { $push: { messages: data } }
                    let currentConvo = await db.collection('chats').findOne(databaseQuery);
                    if (currentConvo) {

                        await db.collection('chats').updateOne(databaseQuery, update)
                    }

                    else {
                        let newConversation = { participants: [data.sender, data.receiver], messages: [data] }
                        await db.collection('chats').insertOne(newConversation)
                    }
                    // AI
                    const query = data.message;
                    let responseMessage = "";
                    res.setHeader('Content-Type', 'text/plain');
                    res.setHeader('Transfer-Encoding', 'chunked');

                    try {
                        // Stream the response from the AI function
                        for await (const chunk of ai.getAIResponse(db, data.sender, query)) {
                            if (chunk) {
                                if (chunk.ok) {
                                    responseMessage += chunk.content;
                                    res.write(chunk.content);

                                }
                                else {
                                    res.send({ ok: false, errMessage: chunk.errMessage });
                                    res.end();
                                }

                            }
                        }

                        if (responseMessage.length == 0) {
                            res.status(500).send({ ok: false, errMessage: "API didn't respond" })
                            res.end();
                        }
                        else {

                            let responseData = { ...data };
                            responseData.sender = data.receiver;
                            responseData.receiver = data.sender
                            responseData.message = responseMessage;
                            await db.collection('chats').updateOne(databaseQuery, { $push: { messages: responseData } })
                        }

                        res.end(); // End the response when all chunks are sent
                    } catch (error) {
                        console.log(error);
                        res.status(500).send({ ok: false, errMessage: error });
                    }

                    return; // Ensure no further code executes if the condition is true
                }

                res.status(400).send({ ok: false, errMessage: 'Invalid request' });
            });

            // File upload route
            app.post('/upload', upload.single('file'), async (req, res) => {
                const { db, gfs } = getDatabase();
                const data = JSON.parse(req.body.data);
                try {
                    const fileId = await uploadToGridFS(req.file, gfs);
                    data.fileId = fileId
                    hf.reorderFriends(db, data.sender, data.receiver)
                    hf.reorderFriends(db, data.receiver, data.sender)
                    data.status = 0;
                    const senders = onlineUsers[data.sender]
                    const recepients = onlineUsers[data.receiver];

                    let query = { participants: { $all: [data.sender, data.receiver] } };
                    let update = { $push: { messages: data } }
                    let currentConvo = await db.collection('chats').findOne(query);
                    if (currentConvo) {

                        await db.collection('chats').updateOne(query, update)
                    }

                    else {
                        let newConversation = { participants: [data.sender, data.receiver], messages: [data] }
                        await db.collection('chats').insertOne(newConversation)
                    }


                    if (recepients && recepients.length) {

                        for (let recepient of recepients) {
                            recepient.send(JSON.stringify(data))
                        }
                    }
                    // onlineUsers[data.receiver].send(JSON.stringify(data))

                    res.status(200).json({
                        ok: true,
                        index: data.index,
                        message: 'File uploaded!',
                        fileId: fileId,
                        filename: req.file.originalname
                    });
                } catch (err) {
                    throw new Error(err)
                    res.status(500).json({ ok: false, message: 'File upload failed', error: err });
                }
            });

            ws.on('close', (code, reason) => {
                onlineUsers[ws.userid] = onlineUsers[ws.userid].filter(element => element != ws)

            })

        }
    });

    // Middleware to check authentication
    const isAuthenticated = async (req, res, next) => {
        try {
            const { db, gfs } = getDatabase();
            const sessionId = req.session.sessionId;

            const user = await db.collection("session_tokens").findOne({ session_id: sessionId });

            if (user) {
                next();
            } else {
                res.redirect('/login');
            }
        } catch (error) {
            console.error('Error in isAuthenticated middleware:', error);
            res.status(500).send('Internal Server Error');
        }
    };

    // Routes
    app.get("/", (req, res) => {
        res.redirect("/welcome");
    });

    app.get('/welcome', async (req, res) => {
        const { db, gfs } = getDatabase();
        const sessionId = req.session.sessionId;

        const user = await db.collection("session_tokens").findOne({ session_id: sessionId });
        if (user) {
            res.redirect('/home')
        }

        else {

            res.sendFile(join(__dirname, '/public/src/welcome.html'))
        }
    })

    app.get("/signup", (req, res) => {
        res.sendFile(join(__dirname, "/public/src/signup.html"));
    });
    app.get("/login", (req, res) => {
        res.sendFile(join(__dirname, "/public/src/login.html"));
    });

    app.get("/home", isAuthenticated, (req, res) => {
        res.sendFile(join(__dirname, "/public/src/index.html"));
    });

    app.get("*", (req, res, next) => {
        res.redirect('/home')
    })



    app.post('/logout', async (req, res) => {

        try {
            const { db, gfs } = getDatabase();
            const sessionId = req.session.sessionId;
            const user = await db.collection("session_tokens").findOne({ session_id: sessionId });
            if (user) {
                const userid = user.userid;
                await db.collection('session_tokens').deleteMany({ userid })
                res.send({ ok: true })
            }
            else {
                res.send({ ok: false, errMessage: "Couldn't find user" })
            }

        }

        catch (err) {
            res.send({ ok: false, errMessage: "An error occured on the server side!" })
        }



    })
    app.post('/register', async (req, res) => {
        try {
            const colors = ["midnightblue", "orangered", "dodgerblue", "purple", "brown", "teal", 'aqua', 'red', 'brown', 'purple', 'indigo', 'cadetblue']

            const color = colors[Math.floor(colors.length * Math.random())]

            const { db, gfs } = getDatabase();
            const { username, password, gender } = req.body;
            const existingUsername = await db.collection('users').findOne({ username });
            if (existingUsername) {
                res.send({ ok: false, errMessage: "Username already exists" })
            }
            else {

                const userid = await db.collection('users').countDocuments() + 1;
                await db.collection('users').insertOne({ userid, username, password })

                await db.collection('user_data').insertOne({ userid, gender, friends: [], username, color })

                res.send({ ok: true })
            }
        }
        catch (err) {
            res.send({ ok: false, errMessage: "Server side Error" })
        }
    })


    app.post("/auth", async (req, res) => {
        try {
            const { db, gfs } = getDatabase();
            const { username, password } = req.body;

            const userData = await db.collection('users').findOne({ username, password });

            if (userData) {
                const sessionId = uuidv4();
                req.session.sessionId = sessionId;
                await db.collection('session_tokens').insertOne({ userid: userData.userid, session_id: sessionId });

                res.send({ ok: true });
            } else {
                res.send({ ok: false });
            }
        } catch (error) {
            console.error('Error in /auth route:', error);
            res.status(500).send('Internal Server Error');
        }
    });
    app.post('/fetch-info', async (req, res) => {

        try {
            const { db, gfs } = getDatabase();
            const sessionId = req.session.sessionId;

            const user = await db.collection("session_tokens").findOne({ session_id: sessionId });

            if (user) {
                const userInfo = await db.collection('user_data').findOne({ userid: user.userid }, { projection: { _id: 0, userid: 1, gender: 1, friends: 1, username: 1, color: 1, notifications: 1 } })

                res.send({ ok: true, data: userInfo })
            }
        }
        catch (err) {

            res.send({ ok: false })

        }

    })
    app.post('/chats', async (req, res) => {
        try {
            const { db, gfs } = getDatabase();
            const sessionId = req.session.sessionId;

            const user = await db.collection("session_tokens").findOne({ session_id: sessionId });

            if (user) {
                const userData = await db.collection("user_data").findOne(
                    { userid: user.userid },
                    { projection: { friends: 1, _id: 0 } }
                );

                const friends = userData.friends;
                const friendsData = [];

                for (let friend of friends) {
                    const friendData = await db.collection('user_data').findOne(
                        { userid: friend },
                        { projection: { _id: 0 } }
                    );
                    const messages = await db.collection('chats').findOne(
                        { participants: { $all: [user.userid, friend] } }, { projection: { _id: 0, participants: 0 } });

                    const result = await db.collection('chats').aggregate([
                        { $match: { participants: { $all: [user.userid, friend] } } }, // Find the chat document
                        { $unwind: '$messages' }, // Deconstruct the messages array
                        { $match: { 'messages.status': 0, 'messages.sender': friend } }, // Match messages with status: 0
                        { $count: 'count' } // Count the matching messages
                    ]).toArray();

                    const count = result.length > 0 ? result[0].count : 0;
                    const result2 = await db.collection('chats').aggregate([
                        { $match: { participants: { $all: [user.userid, friend] } } }, // Match the chat document
                        { $project: { lastMessage: { $arrayElemAt: ['$messages', -1] } } } // Project the last element of the messages array
                    ]).toArray();

                    const lastMessage = result2.length > 0 ? result2[0].lastMessage : null;

                    friendData.lastMessage = lastMessage
                    friendData.unreadCount = count

                    friendsData.push(friendData);
                }
                res.send({ ok: true, data: friendsData });
            } else {
                res.send({ ok: false });
            }
        } catch (error) {
            console.error('Error in /chats route:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.post('/messages', async (req, res) => {
        try {
            const { db, gfs } = getDatabase();
            const sessionId = req.session.sessionId;
            const user = await db.collection("session_tokens").findOne({ session_id: sessionId });

            if (user) {
                const myUserid = user.userid;
                const friendUserid = req.body.userid;


                const myUsername = await db.collection('users').findOne({ userid: myUserid });
                const friendUsername = await db.collection('users').findOne({ userid: friendUserid });

                const messages = await db.collection('chats').findOne({ participants: { $all: [myUserid, friendUserid] } });

                if (messages) {
                    res.send({
                        ok: true,
                        data: {
                            myUserid,
                            friendUserid,
                            myUsername: myUsername.username,
                            friendUsername: friendUsername.username,
                            messages: messages.messages
                        }
                    });
                } else {
                    res.send({
                        ok: true,
                        data: {
                            myUserid,
                            friendUserid,
                            myUsername: myUsername.username,
                            friendUsername: friendUsername.username,
                            messages: []
                        }
                    });
                }
            } else {
                res.send({ ok: false });
            }
        } catch (error) {
            console.error('Error in /messages route:', error);
            res.status(500).send('Internal Server Error');
        }
    });


    app.post('/search-friend', async (req, res) => {
        const query = req.body.query;

        try {
            const { db, gfs } = getDatabase();
            const sessionId = req.session.sessionId;
            const user = await db.collection("session_tokens").findOne({ session_id: sessionId });

            if (user) {
                let userInfo = await db.collection('user_data').find({}, { projection: { _id: 0, usreid: 0 } }).toArray()
                const usernames = userInfo.map(obj => obj.username);
                const match = fuse.match(query, usernames, 0.4);


                let sortedUsers = [];
                for (let element of match) {

                    let index = element.refIndex;
                    if (userInfo[index].userid == user.userid) {
                        continue;
                    }
                    if (userInfo[index].friends.includes(user.userid)) {
                        userInfo[index].isFriend = true;
                    }
                    else {
                        userInfo[index].isFriend = false;

                    }

                    userInfo[index].friends = null;


                    sortedUsers.push(userInfo[index])
                }


                res.send({ ok: true, searchResult: sortedUsers })

            }

            else {
                res.send({ ok: false, errMessage: "Unauthorized" })
            }

        } catch (error) {
            console.log(error)

        }

    })



    app.post("/friend-request", async (req, res) => {
        const friendId = req.body.userid;

        try {

            const { db, gfs } = getDatabase();
            const sessionId = req.session.sessionId;
            const user = await db.collection("session_tokens").findOne({ session_id: sessionId });


            if (user) {

                const friendData = await db.collection('user_data').findOne({ userid: friendId }, { projection: { _id: 0, gender: 0, friends: 0, color: 0 } });
                const userData = await db.collection('user_data').findOne({ userid: user.userid }, { projection: { _id: 0, username: 1 } })
                if (friendData.notifications) {
                    let currentRequests = friendData.notifications
                    currentRequests.push({ userid: user.userid, username: userData.username, type: 1, seen: false, accepted: false })

                    await db.collection('user_data').updateOne({ userid: friendId }, { $set: { 'notifications': currentRequests } })

                }
                else {

                    await db.collection('user_data').updateOne({ userid: friendId }, { $set: { 'notifications': [{ userid: user.userid, username: userData.username, type: 1, seen: false, accepted: false }] } })
                }


                res.send({ ok: true })


            }

            else {
                res.send({ ok: false, errMessage: "Not authorized" })
            }


        } catch (error) {

            res.send({ ok: false, errMessage: "Internal server error: " + error })

        }
    })


    app.post('/notifications-seen', async (req, res) => {
        try {
            const { db, gfs } = getDatabase();
            const sessionId = req.session.sessionId;
            const user = await db.collection("session_tokens").findOne({ session_id: sessionId });

            if (user) {
                const userData = await db.collection('user_data').findOne({ userid: user.userid }, { projection: { notifications: 1 } });
                let currentNotfications = userData.notifications;
                if (currentNotfications) {
                    for (let notification of currentNotfications) {
                        notification.seen = true;
                    }

                    await db.collection('user_data').updateOne({ userid: user.userid }, { $set: { notifications: currentNotfications } })
                }


                res.send({ ok: true })

            }

        } catch (error) {

            res.send({ ok: false, errMessage: error })

        }
    })

    app.post('/fetch-notifications', async (req, res) => {
        try {


            const { db, gfs } = getDatabase();
            const sessionId = req.session.sessionId;
            const user = await db.collection("session_tokens").findOne({ session_id: sessionId });
            if (user) {

                const userData = await db.collection('user_data').findOne({ userid: user.userid }, { projection: { notifications: 1 } });
                let currentNotfications = userData.notifications;
                let newNotifications = [];
                if (currentNotfications) {
                    for (let notification of currentNotfications) {
                        let copy = { ...notification }
                        copy.seen = true;
                        newNotifications.push(copy)
                    }

                    await db.collection('user_data').updateOne({ userid: user.userid }, { $set: { notifications: newNotifications } })
                }


                res.send({ ok: true, friendRequests: currentNotfications })


            } else {

                res.send({ ok: false, errMessage: "Unauthorized" })

            }
        } catch (error) {

            throw new Error(error)

            res.send({ ok: false, errMessage: "Internal server error: " + error })

        }
    })



    app.post("/accept_friend_request", async (req, res) => {
        let friendId = req.body.userid;

        try {

            const { db, gfs } = getDatabase();
            const sessionId = req.session.sessionId;
            const user = await db.collection("session_tokens").findOne({ session_id: sessionId });

            if (user) {

                const userData = await db.collection("user_data").findOne({ userid: user.userid }, { projection: { _id: 0, notifications: 1, friends: 1, username: 1 } })

                let currentRequests = userData.notifications;

                let currentFriends = userData.friends
                currentFriends.push(friendId)

                for (let request of currentRequests) {
                    if (request.userid == friendId) {
                        request.accepted = true;
                        break;
                    }
                }

                await db.collection('user_data').updateOne({ userid: user.userid }, { $set: { notifications: currentRequests } })
                await db.collection('user_data').updateOne({ userid: user.userid }, { $set: { friends: currentFriends } })

                //friend friends

                const friendData = await db.collection("user_data").findOne({ userid: friendId }, { projection: { _id: 0, friends: 1, notifications: 1 } })
                let friendFriends = friendData.friends;

                let currentNotfications = friendData.notifications
                friendFriends.push(user.userid)
                if (currentNotfications) {
                    await db.collection('user_data').updateOne({ userid: friendId }, { $set: { notifications: currentNotfications.push({ userid: user.userid, username: userData.username, type: 2, seen: false }) } })
                }
                else {
                    await db.collection('user_data').updateOne({ userid: friendId }, { $set: { notifications: [{ userid: user.userid, username: userData.username, type: 2, seen: false }] } })

                }
                await db.collection('user_data').updateOne({ userid: friendId }, { $set: { friends: friendFriends } })


                res.send({ ok: true })


            } else {

                res.send({ ok: false, errMessage: "Unauthorized" })

            }



        } catch (error) {

            res.send({ ok: false, errMessage: error })

        }
    })

    app.post("/reject_friend_request", async (req, res) => {
        let friendId = req.body.userid;

        try {

            const { db, gfs } = getDatabase();
            const sessionId = req.session.sessionId;
            const user = await db.collection("session_tokens").findOne({ session_id: sessionId });

            if (user) {

                const userData = await db.collection("user_data").findOne({ userid: user.userid }, { projection: { _id: 0, notifications: 1 } })

                let currentRequests = userData.notifications;

                let newRequests = currentRequests.filter(obj => obj.userid != friendId)


                await db.collection('user_data').updateOne({ userid: user.userid }, { $set: { notifications: newRequests } })

                res.send({ ok: true })


            } else {

                res.send({ ok: false, errMessage: "Unauthorized" })

            }



        } catch (error) {

            res.send({ ok: false, errMessage: error })

        }
    })

}).catch(err => {
    console.error("Failed to initialize database", err);
    process.exit(1);
})


// Start the server
