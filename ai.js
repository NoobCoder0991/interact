require('dotenv').config();

const { HfInference } = require("@huggingface/inference");
const inference = new HfInference(process.env.HUGGING_FACE_API_TOKEN);


const { GoogleGenerativeAI } = require("@google/generative-ai");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function* getAIResponse(db, userid, prompt) {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // Helper function for delays
    const chunkSize = 15; // Desired size for each smaller chunk
    const streamDelay = 100; // Delay in milliseconds between chunks

    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash-8b" });
        const userData = await db.collection("user_data").findOne({ userid }, { projection: { _id: 0, username: 1 } });

        const message = `role:system, content: User: ${userData.username}, role:user, content:${prompt}`;

        // Request object for the streaming call
        const resultStream = await model.generateContentStream((message));

        // The iterable stream provides chunks of data as they arrive
        for await (const chunk of resultStream.stream) {
            const content = chunk.text();
            if (content) {
                let start = 0;

                // Split the large chunk into smaller pieces and stream them
                while (start < content.length) {
                    const smallChunk = content.slice(start, start + chunkSize);
                    yield { ok: true, content: smallChunk };
                    start += chunkSize;

                    // Introduce a delay to simulate streaming
                    await delay(streamDelay);
                }
            }
        }
    } catch (error) {
        console.error(error);
        yield { ok: false, errMessage: error.message || "Unknown error occurred" };
    }
}


module.exports = { getAIResponse };
