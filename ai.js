require('dotenv').config();

const API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;

const { HfInference } = require("@huggingface/inference");
const inference = new HfInference(API_TOKEN);

async function* getAIResponse(query) {
    // Streaming the response
    for await (const chunk of inference.chatCompletionStream({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [{ role: "user", content: query }],
        max_tokens: 500,
    })) {
        const content = chunk.choices[0]?.delta?.content || "";
        yield content; // Yield each chunk as it arrives
    }
}


module.exports = { getAIResponse };