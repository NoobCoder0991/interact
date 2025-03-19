const { MongoClient, ServerApiVersion, MongoGridFSChunkError, GridFSBucket } = require("mongodb");
// Replace the placeholder with your Atlas connection string
const uri = "mongodb://127.0.0.1:27017";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
require('dotenv').config();

const username = encodeURIComponent(process.env.MONGODB_USER);
const password = encodeURIComponent(process.env.MONGODB_PASS);

// const uri = `mongodb+srv://${username}:${password}@cluster0.ic3ix.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}
);

let db, gfs;
async function initializeDatabase() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        db = client.db("ChatApp");
        gfs = new GridFSBucket(db, { bucketName: 'uploads' })


    }
    catch (err) {
        console.log("Error", err)
    }

}

function getDatabase() {
    if (!db) {
        throw new Error("Database not initialized. Try running initializeDatabase().")
    }
    return { db, gfs };
}


module.exports = { initializeDatabase, getDatabase }


