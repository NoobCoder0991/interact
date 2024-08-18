const multer = require('multer');
const crypto = require('crypto');
const { GridFSBucket, ObjectId } = require('mongodb');
const path = require('path');
const { db } = require('./database');

const storage = multer.memoryStorage(); // Use memory storage for Multer

const upload = multer({ storage });

// Function to upload file to GridFS
const uploadToGridFS = (file, bucket) => {
    return new Promise((resolve, reject) => {
        const buffer = file.buffer;
        const filename = file.originalname;
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.mimetype,
            metadata: {
                originalname: file.originalname,
                encoding: file.encoding,
            },
        });

        uploadStream.end(buffer, err => {
            if (err) {
                return reject(err);
            }
            console.log("Loaded:", uploadStream.id)
            resolve(uploadStream.id);
        });
    });
};

module.exports = { upload, uploadToGridFS };
