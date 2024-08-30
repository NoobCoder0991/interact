require('dotenv').config();

const { HfInference } = require("@huggingface/inference");
const inference = new HfInference(process.env.HUGGING_FACE_API_TOKEN);


async function* getAIResponse(userid, query) {
    try {
        // Initialize messages array
        // const { db, gfs } = await database.handleDatabase("ChatApp");
        // const databaseQuery = { participants: { $all: [userid, -1] } };

        // const chats = await db.collection('chats').findOne(databaseQuery, { projection: { _id: 0, messages: 1 } });
        // const messages = chats.messages.map((msg) => ({
        //     role: (msg.sender == -1) ? 'assistant' : 'user',
        //     content: msg.message

        // }))
        const messages = [];
        messages.push({ role: 'user', content: query });


        // Stream the response from the inference API
        for await (const chunk of inference.chatCompletionStream({
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
            messages: messages,
            max_tokens: 500,
        })) {
            // Extract and yield content from each chunk
            const content = chunk.choices[0]?.delta?.content || "";
            process.stdout.write(content)
            if (content) {
                yield content;
            }
        }
    } catch (error) {
        if (error.name == "AbortError") {
            console.error("Request timed out");
        }
        else {
            console.error("Error occurred while fetching AI response:", error);
            yield "Error occured "; // Yield an empty string or a specific error message if needed

        }
    }

}
module.exports = { getAIResponse };
