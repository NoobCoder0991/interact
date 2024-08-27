require('dotenv').config();

const database = require("./database");

const API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;

const { HfInference } = require("@huggingface/inference");
const inference = new HfInference(API_TOKEN);

async function* getAIResponse(userid, query) {
    // Streaming the response


    const { db, gfs } = await database.handleDatabase("ChatApp");
    const databaseQuery = { participants: { $all: [userid, -1] } };

    const chats = await db.collection('chats').findOne(databaseQuery, { projection: { _id: 0, messages: 1 } });
    const messages = chats.messages.map((msg) => ({
        role: (msg.sender == -1) ? 'assistant' : 'user',
        content: msg.message

    }))
    messages.push({ role: 'user', content: query });

    for await (const chunk of inference.chatCompletionStream({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        // messages: [{ role: "user", content: query }],
        messages: messages,
        max_tokens: 500,
    })) {
        const content = chunk.choices[0]?.delta?.content || "";
        yield content; // Yield each chunk as it arrives
    }
}


module.exports = { getAIResponse };