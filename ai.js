require('dotenv').config();

const { HfInference } = require("@huggingface/inference");
const inference = new HfInference(process.env.HUGGING_FACE_API_TOKEN);


async function* getAIResponse(db, userid, query) {
    try {
        const userData = await db.collection("user_data").findOne({ userid }, { projection: { _id: 0, username: 1 } });

        const messages = [];
        messages.push({ role: "system", content: `Client Name : ${userData.username}` })
        messages.push({ role: 'user', content: query });


        // Stream the response from the inference API
        for await (const chunk of inference.chatCompletionStream({
            // model: "meta-llama/Meta-Llama-3-8B-Instruct",
            model: 'mistralai/Mistral-Nemo-Instruct-2407',
            messages: messages,
            max_tokens: 800,
        })) {
            // Extract and yield content from each chunk
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                yield { ok: true, content };
            }
        }

    } catch (error) {
        if (error.name == "AbortError") {
            console.error("Request timed out");
        }
        else {
            console.error("Error occurred while fetching AI response:", error);
            yield { ok: false, errMessage: error }; // Yield an empty string or a specific error message if needed

        }
    }

}




module.exports = { getAIResponse };
