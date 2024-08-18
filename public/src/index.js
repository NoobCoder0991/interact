
console.log("hello world")

sendPostRequest('/chats', {})
    .then(data => {
        console.log("data", data)
    })




// for testing purpost
var messageInput = document.getElementsByClassName("message-input-element")[0];
messageInput.addEventListener('keydown', e => {
    if (e.key == 'Enter') {
        sendMessage(messageInput.value)
        messageInput.value = ""
    }
})

function sendMessage(message) {
    let messageContainer = document.createElement('div')
    messageContainer.classList.add('message')
    messageContainer.classList.add('my-message')

    let date = new Date();
    let hrs = date.getHours()
    let mins = date.getMinutes()

    let htm = `  <div class="message-content">
                        ${message}
                    </div>
                    <div class="message-time">

                        <div class="hrs">${hrs}</div>:
                        <div class="mins">${mins}</div>
                    </div>`

    messageContainer.innerHTML = htm

    let chatContainer = document.getElementsByClassName('chat-container')[0]

    chatContainer.appendChild(messageContainer)

    chatContainer.scrollTop = chatContainer.scrollHeight

}


async function sendPostRequest(url, data) {
    try {


        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
}