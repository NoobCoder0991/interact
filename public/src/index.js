//setting theme according to user prefernce or sysstem theme

var theme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (theme && theme != "system") {
    if (theme == 'light') {

        document.getElementsByClassName("theme-option")[1].classList.add("chosen-theme")

    }
    else {

        document.getElementsByClassName("theme-option")[0].classList.add("chosen-theme")
    }
    document.getElementById('css-file').setAttribute('href', `../src/index-${theme}.css`)
}
else {
    document.getElementsByClassName("theme-option")[2].classList.add("chosen-theme")
    const defaultTheme = systemPrefersDark ? 'dark' : 'light';
    document.getElementById('css-file').setAttribute('href', `../src/index-${defaultTheme}.css`)

}

//


let writingCode = document.querySelector('.writing-code');
let codePreview = document.querySelector('.code-preview code');

// Add event listener for input changes
writingCode.addEventListener('input', (e) => {
    let text = writingCode.innerText;
    let highlightedText = highlightCode(text).value
    codePreview.innerHTML = highlightedText;
});



//

var selectedFile;
var selectedFormData;
var fileType
var db;

const fileForm = document.getElementById('uploadFile');
fileForm.addEventListener('change', e => {
    const map = { 'pdf': 'pdf', 'png': 'image', 'jpeg': 'image', 'jpg': 'image', 'doc': 'word', 'docx': 'word', wav: 'sound', mp3: 'sound', aac: 'sound', flac: 'sound', ogg: 'sound', wma: 'sound', m4a: 'sound', aiff: 'sound', aif: 'sound', aifc: 'sound', amr: 'sound', pcm: 'sound', dts: 'sound', ac3: 'sound', mid: 'sound', midi: 'sound', 'txt': 'text', 'pgn': 'text' }
    const map2 = { 'pdf': 'PDF Document', 'png': 'PNG Image', 'jpeg': 'JPEG Image', 'jpg': 'JPG Image', 'doc': 'Word Document', 'docx': 'Word Document', 'txt': 'Text File', 'pgn': 'Text File' }
    let fileInput = document.getElementById('fileInput');
    const formData = new FormData();
    const fileDetails = fileInput.files[0];
    formData.append('file', fileDetails)
    selectedFile = fileDetails
    selectedFormData = formData
    fileType = 'file';
    let extension = fileDetails.name.split('.').pop();
    const fileSendContainer = document.getElementsByClassName('file-send-wrapper')[0];
    fileSendContainer.getElementsByClassName('file-name')[0].textContent = fileDetails.name;
    fileSendContainer.getElementsByClassName('file-size')[0].textContent = getStandardSize(fileDetails.size) + ', ' + map2[extension];
    fileSendContainer.getElementsByClassName('file-icon')[0].src = `../assets/images/${map[extension] || 'unknown'}-icon.png`
    fileSendContainer.style.display = 'flex'
    document.getElementById('preview').innerHTML = '';
    previewFile(document.getElementById('preview'), fileDetails)
    document.getElementsByClassName('caption-input-element')[0].focus()
})

const photoForm = document.getElementById('uploadPhoto');
photoForm.addEventListener('change', e => {
    const map = { 'pdf': 'pdf', 'png': 'image', 'jpeg': 'image', 'jpg': 'image', 'doc': 'word', 'docx': 'word', wav: 'sound', mp3: 'sound', aac: 'sound', flac: 'sound', ogg: 'sound', wma: 'sound', m4a: 'sound', aiff: 'sound', aif: 'sound', aifc: 'sound', amr: 'sound', pcm: 'sound', dts: 'sound', ac3: 'sound', mid: 'sound', midi: 'sound', 'txt': 'text', 'pgn': 'text' }
    const map2 = { 'pdf': 'PDF Document', 'png': 'PNG Image', 'jpeg': 'JPEG Image', 'jpg': 'JPG Image', 'doc': 'Word Document', 'docx': 'Word Document', 'txt': 'Text File', 'pgn': 'Text File' }
    let fileInput = document.getElementById('photoInput');
    const formData = new FormData();
    const fileDetails = fileInput.files[0];
    formData.append('file', fileDetails)
    selectedFile = fileDetails
    selectedFormData = formData
    fileType = 'photo'
    let extension = fileDetails.name.split('.').pop();
    const fileSendContainer = document.getElementsByClassName('file-send-wrapper')[0];
    fileSendContainer.getElementsByClassName('file-name')[0].textContent = fileDetails.name;
    fileSendContainer.getElementsByClassName('file-size')[0].textContent = getStandardSize(fileDetails.size) + ', ' + map2[extension];
    fileSendContainer.getElementsByClassName('file-icon')[0].src = `../assets/images/${map[extension] || 'unknown'}-icon.png`
    fileSendContainer.style.display = 'flex'
    document.getElementById('preview').innerHTML = '';
    previewFile(document.getElementById('preview'), fileDetails)
    document.getElementsByClassName('caption-input-element')[0].focus()
})

async function preSendFile() {
    if (selectedFile && selectedFormData) {

        const caption = document.getElementsByClassName('caption-input-element')[0].value
        let date = new Date();
        if (fileType == 'file') {
            await sendFile(myid, currentFriendId, selectedFile, caption, selectedFormData, date, selectedMessageIndex);

        }
        else if (fileType == 'photo') {
            await sendPhoto(myid, currentFriendId, selectedFile, caption, selectedFormData, date, selectedMessageIndex);
        }
        let container = document.getElementsByClassName(
            "recent-messages-container"
        )[0];

        const activeElement = container.getElementsByClassName(
            "recent-active-message"
        )[0];
        activeElement.getElementsByClassName(
            "last-message-status"
        )[0].style.display = "none";
        activeElement.getElementsByClassName(
            "last-message-status"
        )[0].classList.remove('blue-tick');
        activeElement.getElementsByClassName("last-message-content")[0].innerHTML = `<i class="fas ${fileType == 'file' ? 'fa-file-alt' : 'fa-image'}"></i>` + `${caption.length ? (caption) : selectedFile.name}`;

        activeElement.getElementsByClassName("last-message-time")[0].innerHTML =
            formatTime(date.getHours(), date.getMinutes());
        const index = Array.from(
            container.getElementsByClassName("recent-message-chat")
        ).indexOf(activeElement);
        container.insertBefore(activeElement, container.firstChild);
        scrollToChild(container, activeElement);
        moveToFront(userInfo.friends, index);
        moveToFront(userInfo.friendUsernames, index);
        moveToFront(userInfo.colors, index);
        removeUnreadMessagesTag();
        document.getElementsByClassName("chat-search-container")[0].innerHTML =
            "";
        document.getElementsByClassName(
            "chat-search-container"
        )[0].style.display = "none";
        document.getElementsByClassName(
            "recent-messages-container"
        )[0].style.display = "flex";
        document.getElementsByClassName("chat-search-input")[0].value = "";
        selectedMessageIndex = null;
        document.getElementsByClassName('reply-message-wrapper')[0].style.display = 'none'
        messageInput.focus();
    }

    return;
}

document.getElementById('open-picker').addEventListener('click', function () {
    const picker = document.getElementById('emoji-picker');
    if (picker.style.display === 'none') {
        picker.style.display = 'flex';
        document.getElementById('file-picker').style.display = 'none'
    }
    else {

        picker.classList.add('hide-picker')
        picker.style.display = 'none';

    }

});


document.getElementsByClassName('open-file-picker')[0].addEventListener('click', e => {
    const picker = document.getElementById('file-picker');
    if (picker.style.display === 'none') {
        picker.style.display = 'flex';
        document.getElementById('emoji-picker').style.display = 'none'
    }
    else {
        picker.style.display = 'none'
    }
})


var receivedMessageNotify = new Audio(
    "../assets/sounds/received-message-notify.mp3"
);
var sentMessageNotify = new Audio(
    "../assets/sounds/sent-message-notify.mp3"
);

var deleteMessageSound = new Audio("../assets/sounds/delete-sound.wav")

const host = window.location.hostname;
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const port = window.location.port ? `:${window.location.port}` : "";

const ws = new WebSocket(`${protocol}//${host}${port}/home`);

ws.onopen = () => {
    console.log("Connected to websocket");
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data && (data.type == 'file' || data.type == 'photo')) {
        let index = userInfo.friends.indexOf(data.sender);
        let index1 = userInfo.friends.indexOf(data.receiver);
        let activeElement;
        if (index != -1) {
            activeElement = document.getElementsByClassName(
                "recent-message-chat"
            )[index];
        } else if (index1 != -1) {
            activeElement = document.getElementsByClassName(
                "recent-message-chat"
            )[index1];
        } else {
            throw new Error("Something is wrong");
        }
        if (data.type == 'file') {

            activeElement.getElementsByClassName("last-message-content")[0].innerHTML = '<i class="fas fa-file-alt"></i> ' + `${data.message.length ? (data.message) : data.file_details.name} `;
        }
        else {
            activeElement.getElementsByClassName("last-message-content")[0].innerHTML = '<i class="fas fa-image"></i> ' + `${data.message.length ? (data.message) : data.file_details.name} `;
        }

        activeElement.getElementsByClassName("last-message-time")[0].innerHTML =
            formatTime(data.time.hours, data.time.mins);

        if (data.sender == myid) {
            writeFileMessage(data.file_details, data.message, data.time, true, true, false, false, data.replyIndex, true);
            downloadFileMessage(data.fileId, data.file_details.name, data.file_details.type)
            sentMessageNotify.play();
            let container = document.getElementsByClassName(
                "recent-messages-container"
            )[0];
            activeElement.getElementsByClassName('last-message-status')[0].style.display = 'flex';
            if (data.status) {
                activeElement.getElementsByClassName('message-tick')[0].classList.add('blue-tick');

            }
            else {
                activeElement.getElementsByClassName('message-tick')[0].classList.remove('blue-tick');
            }
            container.insertBefore(activeElement, container.firstChild);

        }
        else if (data.sender == currentFriendId) {
            const parentContainer = document.getElementsByClassName(`chat-container-${data.sender}`)[0];
            updateDateInfoContainers(parentContainer, data.time);
            if (data.type == 'file') {
                writeFileMessage(parentContainer, data.file_details, data.message, data.time, false, false, false, false, data.replyIndex, true)

            }
            else {
                writePhotoMessage(parentContainer, data.file_details, data.message, data.time, false, false, false, false, data.replyIndex, true)

            }
            downloadFileMessage(parentContainer, data.fileId, data.file_details.name, data.file_details.type, data.type == 'photo')
            receivedMessageNotify.play();
            ws.send(
                JSON.stringify({ type: "chat-opened", recepient: data.sender })
            );
            let container = document.getElementsByClassName(
                "recent-messages-container"
            )[0];
            container.insertBefore(activeElement, container.firstChild);
            scrollToChild(container, activeElement);
            moveToFront(userInfo.friends, index ? index : index1);
            moveToFront(userInfo.friendUsernames, index ? index : index1);
            moveToFront(userInfo.colors, index ? index : index1);
            activeElement.getElementsByClassName(
                "last-message-status"
            )[0].style.display = "none";
        } else {
            const parentContainer = document.getElementsByClassName(`chat-container-${data.sender}`)[0];
            if (parentContainer) {
                updateDateInfoContainers(parentContainer, data.time);

                const unreadContainer = parentContainer.getElementsByClassName('unread');
                if (unreadContainer.length) {
                    console.log("here")
                    const unreadCount = parseInt(unreadContainer[0].textContent);
                    unreadContainer[0].textContent = unreadCount + 1 + " unread messages";
                }
                else {
                    const unreadContainer = document.createElement('div');
                    unreadContainer.className = 'unread';
                    unreadContainer.textContent = `1 unread messages`
                    parentContainer.appendChild(unreadContainer);
                }

                if (data.type == 'file') {

                    writeFileMessage(parentContainer, data.file_details, data.message, data.time, false, false, false, false, data.replyIndex, triggerDownload = false)
                }
                else {

                    writePhotoMessage(parentContainer, data.file_details, data.message, data.time, false, false, false, false, data.replyIndex, triggerDownload = false)
                }

                downloadFileMessage(parentContainer, data.fileId, data.file_details.name, data.file_details.type, data.type == 'photo')
            }
            let element = document.getElementsByClassName("new-messages")[index];
            let currentUnreadMessages =
                element.innerHTML == "" ? 0 : parseInt(element.innerHTML);
            element.innerHTML = currentUnreadMessages + 1;
            element.style.display = "flex";

            let container = document.getElementsByClassName(
                "recent-messages-container"
            )[0];
            activeElement.classList.add("blinky-chat");
            container.insertBefore(activeElement, container.firstChild);
            scrollToChild(container, activeElement);
            moveToFront(userInfo.friends, index ? index : index1);
            moveToFront(userInfo.friendUsernames, index ? index : index1);
            moveToFront(userInfo.colors, index ? index : index1);
            activeElement.getElementsByClassName(
                "last-message-status"
            )[0].style.display = "none";
        }
    }
    else if (data.data && data.data.type == "send") {
        const message = data.data;
        let index = userInfo.friends.indexOf(message.sender);
        let index1 = userInfo.friends.indexOf(message.receiver);
        let activeElement;

        if (index != -1) {
            activeElement = document.getElementsByClassName(
                "recent-message-chat"
            )[index];
        } else if (index1 != -1) {
            activeElement = document.getElementsByClassName(
                "recent-message-chat"
            )[index1];
        } else {
            throw new Error("Something is wrong");
        }
        activeElement.getElementsByClassName(
            "last-message-content"
        )[0].innerHTML = (message.message);
        activeElement.getElementsByClassName("last-message-time")[0].innerHTML =
            formatTime(message.time.hours, message.time.mins);

        if (message.sender == myid) {
            writeTextMessage(message.message, message.time, message.sender == myid, true, false, false, message.replyIndex

            );
            sentMessageNotify.play();
            let container = document.getElementsByClassName(
                "recent-messages-container"
            )[0];
            activeElement.getElementsByClassName('last-message-status')[0].style.display = 'flex';
            if (data.status) {
                activeElement.getElementsByClassName('message-tick')[0].classList.add('blue-tick');
            }
            else {

                activeElement.getElementsByClassName('message-tick')[0].classList.remove('blue-tick');
            }
            container.insertBefore(activeElement, container.firstChild);
        } else if (message.sender == currentFriendId) {
            const parentContainer = document.getElementsByClassName(`chat-container-${message.sender}`)[0];
            updateDateInfoContainers(parentContainer, message.time);
            writeTextMessage(parentContainer, message.message, message.time, message.sender == myid, false, false, false, message.replyIndex, message.forwarded);
            receivedMessageNotify.play();
            ws.send(
                JSON.stringify({ type: "chat-opened", recepient: message.sender })
            );
            let container = document.getElementsByClassName(
                "recent-messages-container"
            )[0];
            container.insertBefore(activeElement, container.firstChild);
            scrollToChild(container, activeElement);
            moveToFront(userInfo.friends, index ? index : index1);
            moveToFront(userInfo.friendUsernames, index ? index : index1);
            moveToFront(userInfo.colors, index ? index : index1);
            activeElement.getElementsByClassName(
                "last-message-status"
            )[0].style.display = "none";
        } else {
            const parentContainer = document.getElementsByClassName(`chat-container-${message.sender}`)[0];

            if (parentContainer) {
                updateDateInfoContainers(parentContainer, message.time);
                const unreadContainer = parentContainer.getElementsByClassName('unread');
                if (unreadContainer.length) {
                    console.log("heler")
                    const unreadCount = parseInt(unreadContainer[0].textContent);
                    unreadContainer[0].textContent = unreadCount + 1 + " unread messages";
                }
                else {
                    const unreadContainer = document.createElement('div');
                    unreadContainer.className = 'unread';
                    unreadContainer.textContent = `1 unread messages`
                    parentContainer.appendChild(unreadContainer);
                }
                writeTextMessage(parentContainer, message.message, message.time, message.sender == myid, false, false, false, message.replyIndex, message.forwarded);
            }

            let element = document.getElementsByClassName("new-messages")[index];
            let currentUnreadMessages =
                element.innerHTML == "" ? 0 : parseInt(element.innerHTML);
            element.innerHTML = currentUnreadMessages + 1;
            element.style.display = "flex";

            let container = document.getElementsByClassName(
                "recent-messages-container"
            )[0];
            activeElement.classList.add("blinky-chat");
            container.insertBefore(activeElement, container.firstChild);
            scrollToChild(container, activeElement);
            moveToFront(userInfo.friends, index ? index : index1);
            moveToFront(userInfo.friendUsernames, index ? index : index1);
            moveToFront(userInfo.colors, index ? index : index1);
            activeElement.getElementsByClassName(
                "last-message-status"
            )[0].style.display = "none";
        }
    } else if (data.type == "message-received") {
        sentMessageNotify.play();

        const index = data.index;

        let messageElement =
            document.getElementsByClassName("my-message")[index];
        let messageStatus =
            messageElement.getElementsByClassName("message-status")[0];
        messageStatus.getElementsByClassName("not-sent")[0].style.display =
            "none";
        messageStatus.getElementsByClassName("message-tick")[0].style.display =
            "flex";

        const activeElement = document.getElementsByClassName(
            "recent-active-message"
        )[0];

        activeElement.getElementsByClassName(
            "last-message-status"
        )[0].style.display = "flex";
        activeElement
            .getElementsByClassName("message-tick")[0]
            .classList.remove("blue-tick");
    } else if (data.type == "chat-opened") {
        const recepient = data.recepient;
        const index = userInfo.friends.indexOf(data.sender);
        let element = document.getElementsByClassName('recent-message-chat')[index];
        if (element) {
            element.getElementsByClassName('last-message-status')[0].getElementsByClassName('message-tick')[0].classList.add('blue-tick')
        }

        if (recepient == currentFriendId) {
            const activeElement = document.getElementsByClassName(
                "recent-active-message"
            )[0];
            activeElement.getElementsByClassName(
                "last-message-status"
            )[0].style.display = "flex";
            activeElement
                .getElementsByClassName("message-tick")[0]
                .classList.add("blue-tick");
            let messageTicks = document
                .getElementsByClassName("chat-container")[0]
                .getElementsByClassName("message-tick");
            for (let i = 0; i < messageTicks.length; i++) {
                messageTicks[i].classList.add("blue-tick");
            }
        }
    }

    if (data.type == "typing") {
        const recepient = data.recepient;
        if (recepient == currentFriendId) {
            if (data.typeStatus == true) {
                document.getElementsByClassName('friend-connection-status')[0].style.display = 'none'
                document.getElementsByClassName('typing-indicator')[0].style.display = 'flex'
            } else {
                document.getElementsByClassName('friend-connection-status')[0].style.display = 'flex'
                document.getElementsByClassName('typing-indicator')[0].style.display = 'none'
            }
        }

        const index = userInfo.friends.indexOf(recepient)
        let targetContainer = document.getElementsByClassName('recent-message-chat')[index];
        if (targetContainer) {
            if (data.typeStatus == true) {
                targetContainer.getElementsByClassName('last-message-details')[0].style.display = 'none'
                targetContainer.getElementsByClassName('typing-indicator-2')[0].style.display = 'flex'

            }
            else {
                targetContainer.getElementsByClassName('last-message-details')[0].style.display = 'flex'
                targetContainer.getElementsByClassName('typing-indicator-2')[0].style.display = 'none'

            }
        }
    }
};

var currentFriendId;
var myid;
var userInfo;
var sideBarVisible = false;
var typing = false;
var selectedMessageIndex;
var messageSelection = false;
var selectedMessages = [];
var forwardFriends = [];
var streamingResponse = false;
var streamingIndex = -1;
var autoScroll = false;

sendPostRequest("/fetch-info", {})
    .then((data) => {
        if (data.ok) {
            userInfo = data.data;

            myid = userInfo.userid;
            document.getElementsByClassName("username-title")[0].innerHTML =
                userInfo.username;

            document.getElementsByClassName("profile-image")[0].innerHTML =
                userInfo.username[0].toUpperCase();
            document.getElementsByClassName(
                "profile-image"
            )[0].style.backgroundColor = userInfo.color;
            const friendRequests = userInfo.notifications;
            if (friendRequests) {
                for (let i = friendRequests.length - 1; i >= 0; i--) {
                    if (friendRequests[i].seen == false) {
                        document.getElementsByClassName(
                            "notification-ring"
                        )[0].style.opacity = "1";

                    }
                    let card = createNotificationCard(friendRequests[i]);
                    document
                        .getElementsByClassName("notifications-container")[0]
                        .appendChild(card);
                }
            } else {
                document.getElementsByClassName(
                    "notifications-container"
                )[0].innerHTML =
                    '<div class="center" style="height:100%"><i class="fas fa-search-minus"></i>Nothing found </div>';
            }

            sendPostRequest("/chats", {}).then((data) => {
                document.getElementsByClassName("loading-chats")[0].style.display =
                    "none";
                let chats = data.data;
                if (chats.length == 0) {
                    document.getElementsByClassName("no-chats")[0].style.display =
                        "flex";
                }
                else {

                    document.getElementsByClassName("recent-messages-container")[0].style.display =
                        "flex";
                    for (let i = 0; i < chats.length; i++) {
                        if (userInfo.friendUsernames) {

                            userInfo.friendUsernames.push(chats[i].username);
                            userInfo.colors.push(chats[i].color);
                        }
                        else {

                            userInfo.friendUsernames = [chats[i].username]
                            userInfo.colors = [chats[i].color]
                        }
                        createRecentMessage(chats[i]);

                    }
                }

            })
                .catch(error => {


                    document.getElementsByClassName("loading-chats")[0].style.display =
                        "none";
                    document.getElementsByClassName('loading-chats-failed')[0].classList.remove('hide')
                    console.log(error)

                });

        }
    })
    .catch((err) => {
        console.log("Error:", err);

    });

function createRecentMessage(data) {
    const recentMessageChat = createUserCard(data);
    document
        .getElementsByClassName("recent-messages-container")[0]
        .appendChild(recentMessageChat);
    if (data.unreadCount) {
        recentMessageChat.getElementsByClassName("new-messages")[0].innerHTML =
            data.unreadCount;
        recentMessageChat.getElementsByClassName(
            "new-messages"
        )[0].style.display = "flex";

        recentMessageChat.classList.add("blinky-chat");
    }
    recentMessageChat.addEventListener("click", (e) => {
        if (data.userid != currentFriendId) {
            DisplayChats(data.userid, recentMessageChat);
        }
    });

    return recentMessageChat;
}
// for testing purpost
var messageInput = document.getElementsByClassName(
    "message-input-element"
)[0];
messageInput.addEventListener('input', () => {
    const text = messageInput.value;
    const lines = text.split('\n').length;
    // Set the maximum size in characters and lines
    const maxHeight = 5;
    // Calculate the new size based on the content
    const newRows = Math.min(lines, maxHeight);
    // Set the new size attributes
    messageInput.rows = newRows;
});
messageInput.addEventListener('focus', e => {
    e.preventDefault();
})
var searchChatsInput =
    document.getElementsByClassName("chat-search-input")[0];

searchChatsInput.addEventListener("input", (e) => {
    if (searchChatsInput.value == "") {
        document.getElementsByClassName("chat-search-container")[0].innerHTML =
            "";
        document.getElementsByClassName(
            "chat-search-container"
        )[0].style.display = "none";
        document.getElementsByClassName(
            "recent-messages-container"
        )[0].style.display = "flex";
    } else {
        searchChats(searchChatsInput.value.toLowerCase());
    }
});

let typingSignalSend = false;
let typingTimer;
messageInput.addEventListener("input", (e) => {
    if (!typingSignalSend) {
        ws.send(
            JSON.stringify({
                type: "typing",
                typeStatus: true,
                recepient: currentFriendId,
            })
        );
        typingSignalSend = true;
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        ws.send(
            JSON.stringify({
                type: "typing",
                typeStatus: false,
                recepient: currentFriendId,
            })
        );
        typingSignalSend = false;
    }, 1000);
});

messageInput.addEventListener("keydown", async (e) => {
    if (e.shiftKey && e.key == 'Enter') {
        messageInput.focus;
    }
    else if (e.key == "Enter") {
        DisplaySentMessage(currentFriendId, messageInput.value, false);
    }
});

document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key == "/") {
        messageInput.focus()
    }
})

var messageSendButton =
    document.getElementsByClassName("send-message-icon")[0];
messageSendButton.addEventListener("click", async (e) => {
    if (messageInput.value.trim() != "") {
        DisplaySentMessage(currentFriendId, messageInput.value, false);
    }
});
document
    .getElementsByClassName("say-hi")[0]
    .addEventListener("click", async (e) => {
        document.getElementsByClassName("empty-chat")[0].style.display = "none";
        document.getElementsByClassName("chat-container")[0].style.display =
            "flex";
        DisplaySentMessage(currentFriendId, "Hello", false);
    });

function displayErrorMessage(message) {
    document.getElementsByClassName("error-message")[0].innerHTML = message;
    document.getElementsByClassName(
        "error-message-wrapper"
    )[0].style.display = "flex";
}

window.addEventListener("popstate", function (event) {
    const viewer = document.getElementsByClassName('photo-viewer-wrapper')[0]
    // if (!viewer.classList.contains('hide')) {
    //     viewer.classList.add('hide')
    //     return;

    // }
    viewer.classList.add('hide')
    if (event.state && event.state.contentId) {
        if (event.state.contentId == "notifications") {
            //notificatons
            document
                .getElementsByClassName("nav-active-option")[0]
                .classList.remove("nav-active-option");
            document
                .getElementsByClassName("home-option")[0]
                .classList.add("nav-active-option");
            document.getElementsByClassName(
                "recent-messages-wrapper"
            )[0].classList.remove('hide')
            document.getElementsByClassName(
                "recent-messages-wrapper"
            )[0].classList.remove('hide-actually')
            document.getElementsByClassName(
                "notifications-wrapper"
            )[0].classList.add('hide')
        } else {
            document.getElementsByClassName(
                "notifications-wrapper"
            )[0].classList.add('hide')
            document.getElementsByClassName(
                "recent-messages-wrapper"
            )[0].classList.remove('hide')
            document.getElementsByClassName(
                "navbar"
            )[0].classList.remove('hide')
            loadChats(event.state.contentId);
        }
    } else {
        document
            .getElementsByClassName("nav-active-option")[0]
            .classList.remove("nav-active-option");
        document
            .getElementsByClassName("home-option")[0]
            .classList.add("nav-active-option");
        document.getElementsByClassName(
            "recent-messages-wrapper"
        )[0].classList.remove('hide');
        document.getElementsByClassName(
            "recent-messages-wrapper"
        )[0].classList.remove('hide-actually');
        document.getElementsByClassName(
            "notifications-wrapper"
        )[0].classList.add('hide');
        document.getElementsByClassName("chat-wrapper")[0].classList.add('hide')
        document.getElementsByClassName("welcome-page")[0].classList.remove('hide')
        document.getElementsByClassName(
            "navbar"
        )[0].classList.remove('hide')
        let activeMessages = document.getElementsByClassName(
            "recent-active-message"
        );
        let len = activeMessages.length;
        for (let i = 0; i < len; i++) {
            activeMessages[0].classList.remove("recent-active-message");
        }

        currentFriendId = null;
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
        window.location.href = "/home";
    }
});


document.querySelector('emoji-picker').addEventListener('emoji-click', (e) => {
    const input = document.getElementsByClassName("message-input-element")[0];
    const insertChar = e.detail.unicode;

    // Get the caret position
    const start = input.selectionStart;
    const end = input.selectionEnd;

    // Get the current value of the input
    const value = input.value;

    // Create the new value with the inserted emoji
    const newValue = value.slice(0, start) + insertChar + value.slice(end);

    // Set the new value
    input.value = newValue;

    // Move the caret to the right of the newly inserted character
    input.setSelectionRange(start + insertChar.length, start + insertChar.length);

    // Focus back to the input
    input.focus();
});

window.addEventListener("click", (e) => {

    if (!document.getElementsByClassName("theme-choose-wrapper")[0].contains(e.target)) {
        document.getElementsByClassName("theme-choose-container")[0].classList.add("hide");
    }
    if (!document.getElementsByClassName("search-people")[0].contains(e.target)) {
        document.getElementsByClassName("friend-search-wrapper")[0].style.display = 'none';
    }
    if (!document.getElementsByClassName("message-menu-wrapper")[0].contains(e.target) && document.getElementsByClassName("message-menu-wrapper")[0].classList.contains('show')) {
        document.getElementsByClassName("message-menu-wrapper")[0].classList.remove('show');

        document.getElementsByClassName(`chat-container-wrapper`)[0].style.overflow =
            "auto";
        selectedMessageIndex = null;
    }
    if (!document.getElementById('emoji-picker').contains(e.target) && !document.getElementById('open-picker').contains(e.target)) {
        document.getElementById('emoji-picker').style.display = 'none'
    }
    if (!document.getElementById('file-picker').contains(e.target) && !document.getElementsByClassName('open-file-picker')[0].contains(e.target)) {
        document.getElementById('file-picker').style.display = 'none'
    }

});

document.getElementsByClassName('chat-container-wrapper')[0].addEventListener('scroll', e => {
    const element = document.getElementsByClassName('chat-container-wrapper')[0]
    // const isScrolledToBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
    const isScrolledToBottom = isScrolledToMax(element)
    if (!isScrolledToBottom) {
        document.getElementsByClassName('chat-end')[0].style.display = 'flex'
    }
    else {

        document.getElementsByClassName('chat-end')[0].style.display = 'none'
    }

    const topChild = getTopVisibleChild();

    if (topChild) {
        const messageTimeElement = topChild.getElementsByClassName("message-time")[0];
        const year = parseInt(messageTimeElement.getElementsByClassName("year")[0].textContent);
        const month = parseInt(messageTimeElement.getElementsByClassName("month")[0].textContent);
        const day = parseInt(messageTimeElement.getElementsByClassName("day")[0].textContent);

        const relativeDate = getRelativeDate({ year, month, day });
        document.getElementsByClassName("top-message-time")[0].textContent = relativeDate;
        document.getElementsByClassName("top-message-time")[0].classList.remove("hide");
        setTimeout(() => {
            document.getElementsByClassName("top-message-time")[0].classList.add("hide");
        }, 1000);
    }
})

document.getElementsByClassName("file-send-wrapper")[0].addEventListener("click", (e) => {
    const fileSendContainer = document.getElementsByClassName("file-send-container")[0];

    // Use contains() to check if e.target is inside fileSendContainer
    if (!fileSendContainer.contains(e.target)) {
        customAlert("Discard Message", "Your message won't be sent if you leave.", "Return to media", "Discard", removeFileSendContainer, false
        );
    }
});

document.getElementsByClassName("forward-message-wrapper")[0].addEventListener("click", e => {
    if (!document.getElementsByClassName('forward-message-container')[0].contains(e.target)) {
        customAlert("Discard Forwarding?", "This action will dicard forwarding of selected message(s)", "Cancel", "Discard", discardForwarding, false);
    }
})

function discardForwarding() {
    document.getElementsByClassName("forward-message-wrapper")[0].classList.add("hide");
    document.getElementsByClassName("forward-friends")[0].innerHTML = "";
    document.getElementsByClassName("chat-container-wrapper")[0].style.overflow = 'auto';
    selectedMessageIndex = null;
    forwardFriends = [];
}


async function sendPostRequest(url, data) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.log(`Request failed: ${error.message}`);
    }
}

async function sendFile(sender, receiver, fileDetails, message, formData, date, replyIndex) {
    document.getElementsByClassName('file-send-wrapper')[0].style.display = 'none'

    let time = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hours: date.getHours(),
        mins: date.getMinutes(),
    };
    const parentContainer = document.getElementsByClassName(`chat-container-${receiver}`)[0];
    updateDateInfoContainers(parentContainer, time);
    let index = writeFileMessage(parentContainer, fileDetails, message, time, true, false, false, false, replyIndex)
    const details = { name: fileDetails.name, size: fileDetails.size, type: fileDetails.type }
    let data = { type: 'file', sender, receiver, time, message, file_details: details, index }
    formData.append('data', JSON.stringify(data));

    // fetch('/upload', {
    //     method: 'POST',
    //     body: formData
    // })
    //     .then(response => response.json())
    //     .then(async (data) => {
    //         if (data.ok) {
    //             const chunks = await chunkFile(fileDetails, 255 * 1024);
    //             for (const chunk of chunks) {
    //                 storeFileChunk(db, data.fileId, chunk)
    //             }

    //             document.getElementsByClassName('my-message')[data.index].getElementsByClassName('file-actions')[0].classList.add('show')
    //             document.getElementsByClassName('my-message')[data.index].getElementsByClassName('file-loader')[0].classList.add('hide')

    //             const thisMessage = document.getElementsByClassName('my-message')[index];
    //             thisMessage.getElementsByClassName('not-sent')[0].style.display = 'none'
    //             thisMessage.getElementsByClassName('message-tick')[0].style.display = 'flex'

    //             const activeElement = document.getElementsByClassName(
    //                 "recent-active-message"
    //             )[0];

    //             activeElement.getElementsByClassName(
    //                 "last-message-status"
    //             )[0].style.display = "flex";
    //             activeElement
    //                 .getElementsByClassName("message-tick")[0]
    //                 .classList.remove("blue-tick");


    //         }
    //         else {
    //             alert('Error uploading the file')
    //         }
    //     })
    //     .catch(err => {
    //         // alert('Error sending the post Request:', err)
    //         throw new Error(err)
    //     })



    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    // Track upload progress
    const messageContainer = document.getElementsByClassName("my-message")[index];
    messageContainer.getElementsByClassName('file-downloader')[0].classList.add("show");
    messageContainer.getElementsByClassName('file-downloader')[0].classList.remove("hide");
    messageContainer.getElementsByClassName("total-size")[0].textContent = "/" + getStandardSize(fileDetails.size)
    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
            messageContainer.getElementsByClassName("size-downloaded")[0].textContent = getStandardSize(event.loaded)

            messageContainer.getElementsByClassName('bar')[0].style.width = percentComplete.toFixed(2) + '%';
            // Update a progress bar here if needed
        }
    };

    // Track completion
    xhr.onload = async () => {
        // parentContainer.getElementsByClassName('download-bar')[0].style.display = 'none';

        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                if (data.ok) {
                    const chunks = await chunkFile(fileDetails, 255 * 1024); // Adjust chunk size if necessary
                    for (const chunk of chunks) {
                        await storeFileChunk(db, data.fileId, chunk); // Assuming storeFileChunk is async
                    }

                    // Display success UI updates
                    const messageElement = parentContainer.getElementsByClassName('my-message')[index];
                    messageElement.getElementsByClassName('file-actions')[0].classList.add('show');
                    messageElement.getElementsByClassName('file-loader')[0].classList.add('hide');

                    messageElement.getElementsByClassName('file-downloader')[0].classList.remove("show");
                    messageElement.getElementsByClassName('file-downloader')[0].classList.add("hide");

                    // Update message tick status
                    messageElement.getElementsByClassName('not-sent')[0].style.display = 'none';
                    messageElement.getElementsByClassName('message-tick')[0].style.display = 'flex';

                    const activeElement = document.getElementsByClassName("recent-active-message")[0];
                    activeElement.getElementsByClassName("last-message-status")[0].style.display = "flex";
                    activeElement.getElementsByClassName("message-tick")[0].classList.remove("blue-tick");

                    console.log("Upload and chunking complete!");
                } else {
                    alert('Error uploading the file');
                }
            } catch (error) {
                console.error("Error handling upload response:", error);
            }
        } else {
            console.error("Upload failed with status:", xhr.status);
        }
    };

    // Send the formData
    xhr.send(formData);



}

async function sendPhoto(sender, receiver, fileDetails, message, formData, date, replyIndex) {
    document.getElementsByClassName('file-send-wrapper')[0].style.display = 'none'

    let time = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hours: date.getHours(),
        mins: date.getMinutes(),
    };
    const parentContainer = document.getElementsByClassName(`chat-container-${receiver}`)[0];
    const photoDimensions = await getPhotoDimensions(fileDetails);

    fileDetails.photoDimensions = photoDimensions;
    updateDateInfoContainers(parentContainer, time);
    let index = writePhotoMessage(parentContainer, fileDetails, message, time, true, false, false, false, replyIndex)

    const details = { name: fileDetails.name, size: fileDetails.size, type: fileDetails.type, photoDimensions }
    let data = { type: 'photo', sender, receiver, time, message, file_details: details, index }
    formData.append('data', JSON.stringify(data));

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(async data => {
            if (data.ok) {

                const chunks = await chunkFile(fileDetails, 255 * 1024);
                for (const chunk of chunks) {
                    storeFileChunk(db, data.fileId, chunk)
                }

                const thisMessage = document.getElementsByClassName('my-message')[index];
                thisMessage.getElementsByClassName('not-sent')[0].style.display = 'none'
                thisMessage.getElementsByClassName('message-tick')[0].style.display = 'flex'

                const activeElement = document.getElementsByClassName(
                    "recent-active-message"
                )[0];

                activeElement.getElementsByClassName(
                    "last-message-status"
                )[0].style.display = "flex";
                activeElement
                    .getElementsByClassName("message-tick")[0]
                    .classList.remove("blue-tick");
            }
            else {
                alert('Error uploading the file')
            }
        })
        .catch(err => {
            // alert('Error sending the post Request:', err)
            throw new Error(err)
        })

}


async function sendMessage(sender, receiver, message, date, replyIndex, forwarded) {
    let time = {
        year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), hours: date.getHours(), mins: date.getMinutes(),
    };

    await loadChats(receiver);

    const parentContainer = document.getElementsByClassName(`chat-container-${receiver}`)[0];
    console.log("Parent container : ", parentContainer)
    console.log("Parent container class", `chat-container-${receiver}`)
    updateDateInfoContainers(parentContainer, time);
    let index = writeTextMessage(parentContainer, message, time, true, false, false, false, replyIndex, forwarded);
    const messageData = {
        type: "send", sender: myid, receiver: currentFriendId, message, time, index, status: 0, replyIndex, forwarded
    }

    if (receiver == -1) {
        //ai message

        try {
            streamingResponse = true;
            // sentMessageNotify.play()
            let response = await fetch('/message-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });

            if (!response.ok) {
                console.log(response);
                createChatErrorMessage("There was an error fetching the response")
                return;
                // throw new Error(`Error: ${response.statusText}`);
            }
            const activeElement = document.getElementsByClassName(
                "recent-active-message"
            )[0];
            const thisMessage = document.getElementsByClassName('my-message')[index];
            thisMessage.getElementsByClassName('not-sent')[0].style.display = 'none'
            thisMessage.getElementsByClassName('message-tick')[0].style.display = 'flex'
            thisMessage.getElementsByClassName('message-tick')[0].classList.add('blue-tick')

            activeElement.getElementsByClassName(
                "last-message-status"
            )[0].style.display = "flex";
            activeElement.getElementsByClassName('last-message-status')[0].style.display = 'flex';
            activeElement
                .getElementsByClassName("message-tick")[0]
                .classList.add("blue-tick");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result;
            let totalMessageResult = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        const messageContainer = document.getElementsByClassName('friend-message')[streamingIndex];
                        messageContainer.getElementsByClassName("generating-cursor")[0].style.display = 'none'
                        break;

                    }
                    result = decoder.decode(value, { stream: true });

                    totalMessageResult += result;

                    if (currentFriendId == -1) {
                        if (streamingIndex == -1) {
                            let date = new Date();
                            let time = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), hours: date.getHours(), mins: date.getMinutes() };
                            updateDateInfoContainers(parentContainer, time);

                            writeTextMessage(parentContainer, totalMessageResult, time, false);
                            let friendMessages = document.getElementsByClassName('friend-message');
                            streamingIndex = friendMessages.length - 1;
                            if (autoScroll) {

                                scrollToBottom()
                            }
                        }
                        else {
                            const messageContainer = document.getElementsByClassName('friend-message')[streamingIndex];
                            messageContainer.getElementsByClassName('message-content-inner')[0].innerHTML = (processMessageContent(totalMessageResult) + "<span class='generating-cursor'></span>");
                            enableCodeCopy(messageContainer)
                            if (autoScroll) {

                                scrollToBottom()
                            }
                        }
                    }
                }

            } catch (error) {
                console.error(error)

                createChatErrorMessage(error)

            }



            streamingResponse = false;
            streamingIndex = -1;

        } catch (error) {

            createChatErrorMessage(error)

        }
        return;
    }
    sendPostRequest("/message", messageData)
        .then(data => {
            const activeElement = document.getElementsByClassName(
                "recent-active-message"
            )[0];
            const thisMessage = document.getElementsByClassName('my-message')[index];
            if (data && data.ok) {
                thisMessage.getElementsByClassName('not-sent')[0].style.display = 'none'
                thisMessage.getElementsByClassName('message-tick')[0].style.display = 'flex'

                activeElement.getElementsByClassName(
                    "last-message-status"
                )[0].style.display = "flex";
                activeElement
                    .getElementsByClassName("message-tick")[0]
                    .classList.remove("blue-tick");

                sentMessageNotify.play()

            }
            else {

                createChatErrorMessage("Could not send message. Check your internet connection.")
                thisMessage.getElementsByClassName('not-sent')[0].style.display = 'none'
                thisMessage.getElementsByClassName('failed')[0].style.display = 'flex'



            }
        })
        .catch(err => {
            console.error(err)
            createChatErrorMessage(err);
        })
}

function writeFileMessage(parentContainer, fileDetails, message, date, myMessage, sent, delivered, seen, replyIndex, triggerDownload) {

    let targetMessage;
    let targetMessageContent;
    if (replyIndex != undefined) {
        targetMessage = parentContainer.getElementsByClassName('message')[replyIndex];
        targetMessageContent = targetMessage.getElementsByClassName("message-content-inner")[0].innerText;
        if (targetMessage.classList.contains("file-message")) {
            if (targetMessageContent.length == 0) {
                targetMessageContent = "<i class='fas fa-file-alt'></i> " + targetMessage.getElementsByClassName("file-name")[0].textContent;
            }
            else {
                targetMessageContent = "<i class='fas fa-file-alt'></i> " + targetMessageContent;

            }
        }
        else if (targetMessage.classList.contains("photo-message")) {
            if (targetMessageContent.length == 0) {
                targetMessageContent = "<i class='fas fa-image'></i> " + "Image";
            }
            else {
                targetMessageContent = "<i class='fas fa-image'></i> " + targetMessageContent;

            }
        }
    }
    let messageOuterContainer = document.createElement('div');
    messageOuterContainer.classList.add('message-outer-container')
    let messageContainer = document.createElement("div");
    messageContainer.classList.add("message");
    messageContainer.classList.add("file-message");
    if (myMessage) {
        const messages = parentContainer.getElementsByClassName('message');
        if (messages.length == 0 || messages[messages.length - 1].classList.contains('friend-message')) {
            messageOuterContainer.classList.add('first-message');
        }
        messageContainer.classList.add("my-message");
    } else {
        const messages = parentContainer.getElementsByClassName('message');
        if (messages.length == 0 || messages[messages.length - 1].classList.contains('my-message')) {
            messageOuterContainer.classList.add('first-message');
        }
        messageContainer.classList.add("friend-message");
    }

    let fileSize = fileDetails.size
    let fileName = fileDetails.name;
    let extensions = fileName.split('.')
    let extension = extensions[extensions.length - 1]
    let type = { 'png': 'PNG File', 'jpeg': 'JPEG File', 'jpg': 'JPG File', 'doc': 'Word Document', 'docx': 'Word Document', 'pdf': "PDF Document", 'txt': "Text File", 'pgn': 'Text File' }
    let map = {
        'png': 'image', 'jpg': 'image', 'jpeg': 'image', 'doc': 'word', 'docx': 'word', 'pdf': 'pdf', wav: 'sound', mp3: 'sound', aac: 'sound', flac: 'sound', ogg: 'sound', wma: 'sound', m4a: 'sound', aiff: 'sound', aif: 'sound', aifc: 'sound', amr: 'sound', pcm: 'sound', dts: 'sound', ac3: 'sound', mid: 'sound', midi: 'sound', 'txt': 'text', 'pgn': 'text'
    }
    let htm = ` 
        <div  class="message-wrapper">
            <div class="replying-to-wrapper"  style="display: ${targetMessage ? 'flex' : 'none'};">
                <div class="replying-to" border-left: ${targetMessage && targetMessage.classList.contains('my-message') ? "5px solid var(--accent-bright)" : "5px solid #e707a0"}">
                    <div class="replying-to-username" style="color:${targetMessage && targetMessage.classList.contains('my-message') ? "var(--accent-color)" : "#e707a0"}">${targetMessage && targetMessage.classList.contains('my-message') ? userInfo.username : document.getElementsByClassName('friend-username')[0].textContent}</div>
                    <div class="replying-to-content">${targetMessage ? targetMessageContent : ""}</div>
                </div>
            </div>
            <div class="file-container">
                 <div class="file-content">
                    <div class='file-preview'></div>
                    <div class="file-content-inner-2">
                        <div class="file-icon">
                        <img src="../assets/images/${map[extension] || 'unknown'}-icon.png" class='file-icon-image'>

                        </div>
                        <div class='file-details'>
                            <div class='file-name'>${fileDetails.name}</div>
                            <div class='file-size'>${getStandardSize(fileSize)}, ${type[extension] || extension.toUpperCase() + " Document"}</div>
                        </div>

                    </div>

                    <div class="file-loader">
                        <div class="left-loader"></div>
                    </div>
                    <div class="file-downloader">
                        <div class="pause-play">
                            <i class='fas fa-times'></i>
                        </div>
                        <div class="download-bar">
                            <div class='bar'></div>
                        </div>
                        <div class="progress-details">
                            <div class="size-downloaded">0 B</div>
                            
                            <div class="total-size">/0 B</div>
                        </div>
                    </div>

                    <div class="file-actions">
                        <div class="file-action open" >Open</div>
                        <div class="file-action save-as">Save as</div>
                    </div>
                   

                </div>
            </div>
            <div class="message-container">
                <div class="message-content">
                    <span class="message-content-inner">
                        ${(processMessageContent(message))}

                    </span>
                    <div class="message-info">
                        <div class="message-time">
                            <div class="year">${date.year >= 10 ? date.year : "0" + date.year}</div>
                            <div class="month">${date.month >= 10 ? date.month : "0" + date.month}</div>
                            <div class="day">${date.day >= 10 ? date.day : "0" + date.day}</div>
                            <div class="hrs">${date.hours >= 10 ? date.hours : "0" + date.hours}</div>:
                            <div class="mins">${date.mins >= 10 ? date.mins : "0" + date.mins}</div>
                        </div>
                        <div class="message-status">
                            <img src="../assets/images/icons8-clock.gif" class="not-sent" style= display:${sent == true ? "none" : "flex"}>
                            <i class="fa-solid fa-circle-xmark circle-icon failed" style="display:none"></i>

                            <i class="fas fa-check-circle message-tick ${seen == true ? "blue-tick" : ""}" style=display:${sent == false ? "none" : "flex"}></i>
                        </div>

                    </div>
               </div>
          
                
            </div>

                
            </div>`;

    messageContainer.innerHTML = htm;
    if (!triggerDownload) {

        let previewContainer = messageContainer.getElementsByClassName('file-preview')[0];
        previewFile(previewContainer, fileDetails, true)
        previewContainer.style.display = 'flex'
    }

    if (!triggerDownload) {

        let fileOpenButton = messageContainer.getElementsByClassName('open')[0];
        fileOpenButton.addEventListener('click', e => {
            openFile(fileDetails)
        })
        let saveAsButton = messageContainer.getElementsByClassName('save-as')[0];
        saveAsButton.addEventListener('click', e => {
            saveAsFile(fileDetails)
        })
    }

    let replyingTo = messageContainer.getElementsByClassName('replying-to')[0];
    replyingTo.addEventListener('click', e => {
        pointToMessage(replyIndex);
    })

    messageOuterContainer.appendChild(messageContainer)
    parentContainer.appendChild(messageOuterContainer);


    let index = Array.from(
        document.getElementsByClassName("my-message")
    ).indexOf(messageContainer);


    addListenersToMessage(messageOuterContainer, messageContainer);

    if (triggerDownload) {
        messageContainer.getElementsByClassName('file-downloader')[0].classList.add('show')
        messageContainer.getElementsByClassName('file-downloader')[0].classList.remove('hide')
        messageContainer.getElementsByClassName('file-loader')[0].classList.add('hide')
        messageContainer.getElementsByClassName('file-loader')[0].classList.remove('show')

    }

    scrollToBottom();
    return index;

}


function writePhotoMessage(parentContainer, fileDetails, message, date, myMessage, sent, delivered, seen, replyIndex, triggerDownload) {

    let targetMessage;
    let targetMessageContent;
    if (replyIndex != undefined) {
        targetMessage = parentContainer.getElementsByClassName('message')[replyIndex];
        targetMessageContent = targetMessage.getElementsByClassName("message-content-inner")[0].innerText;
        if (targetMessage.classList.contains("file-message")) {
            if (targetMessageContent.length == 0) {
                targetMessageContent = "<i class='fas fa-file-alt'></i> " + targetMessage.getElementsByClassName("file-name")[0].textContent;
            }
            else {
                targetMessageContent = "<i class='fas fa-file-alt'></i> " + targetMessageContent;

            }
        }
        else if (targetMessage.classList.contains("photo-message")) {
            if (targetMessageContent.length == 0) {
                targetMessageContent = "<i class='fas fa-image'></i> " + "Image";
            }
            else {
                targetMessageContent = "<i class='fas fa-image'></i> " + targetMessageContent;

            }
        }
    }
    let messageOuterContainer = document.createElement('div');
    messageOuterContainer.classList.add('message-outer-container')
    let messageContainer = document.createElement("div");
    messageContainer.classList.add("message");
    messageContainer.classList.add("photo-message");
    if (myMessage) {
        const messages = parentContainer.getElementsByClassName('message');
        if (messages.length == 0 || messages[messages.length - 1].classList.contains('friend-message')) {
            messageOuterContainer.classList.add('first-message');
        }
        messageContainer.classList.add("my-message");
    } else {
        const messages = parentContainer.getElementsByClassName('message');
        if (messages.length == 0 || messages[messages.length - 1].classList.contains('my-message')) {
            messageOuterContainer.classList.add('first-message');
        }
        messageContainer.classList.add("friend-message");
    }

    let fileSize = fileDetails.size
    let fileName = fileDetails.name;
    let extensions = fileName.split('.')
    let extension = extensions[extensions.length - 1]
    let type = { 'png': 'PNG File', 'jpeg': 'JPEG File', 'jpg': 'JPG File' }
    let map = { 'png': 'image', 'jpg': 'image', 'jpeg': 'image' }
    let htm = ` 
        <div  class="message-wrapper">
            <div class="replying-to-wrapper"  style="display: ${targetMessage ? 'flex' : 'none'};">
                <div class="replying-to" border-left: ${targetMessage && targetMessage.classList.contains('my-message') ? "5px solid var(--accent-bright)" : "5px solid #e707a0"}">
                    <div class="replying-to-username" style="color:${targetMessage && targetMessage.classList.contains('my-message') ? "var(--accent-color)" : "#e707a0"}">${targetMessage && targetMessage.classList.contains('my-message') ? userInfo.username : document.getElementsByClassName('friend-username')[0].textContent}</div>
                    <div class="replying-to-content">${targetMessage ? targetMessageContent : ""}</div>
                </div>
            </div>
            <div class="file-container">
                 <div class="file-content">
                    <div class='progress-wrapper'>
                        <div class="progress-container">
                            <svg class="progress-svg" viewBox="0 0 120 120">
                                <circle class="progress-circle-bg" cx="60" cy="60" r="50" />
                                <circle class="progress-circle" cx="60" cy="60" r="50" />
                                </svg>
                                <span class="progress-percent"></span>
                            </div>
                            <span class="progressText">Please wait</span>

                    </div>
                    <div class='photo-container' style="height:${Math.min((36 / 100) * window.innerHeight, fileDetails.photoDimensions.height)}px">

                    </div>
                </div>
            </div>
            <div class="message-container">
                <div class="message-content">
                    <span class="message-content-inner">
                        ${(processMessageContent(message))}

                    </span>
                    <div class="message-info">
                        <div class="message-time">
                            <div class="year">${date.year >= 10 ? date.year : "0" + date.year}</div>
                            <div class="month">${date.month >= 10 ? date.month : "0" + date.month}</div>
                            <div class="day">${date.day >= 10 ? date.day : "0" + date.day}</div>
                            <div class="hrs">${date.hours >= 10 ? date.hours : "0" + date.hours}</div>:
                            <div class="mins">${date.mins >= 10 ? date.mins : "0" + date.mins}</div>
                        </div>
                        <div class="message-status">
                            <img src="../assets/images/icons8-clock.gif" class="not-sent" style= display:${sent == true ? "none" : "flex"}>
                            <i class="fa-solid fa-circle-xmark circle-icon failed" style="display:none"></i>

                            <i class="fas fa-check-circle message-tick ${seen == true ? "blue-tick" : ""}" style=display:${sent == false ? "none" : "flex"}></i>
                        </div>

                    </div>
               </div>
             
                
            </div>

                
            </div>
                    `;

    messageContainer.innerHTML = htm;
    setProgress(messageContainer, 0);
    if (!triggerDownload) {

        let photoContainer = messageContainer.getElementsByClassName('photo-container')[0];
        previewFile(photoContainer, fileDetails, false, true)
        photoContainer.style.display = 'flex'
    }

    let replyingTo = messageContainer.getElementsByClassName('replying-to')[0];
    replyingTo.addEventListener('click', e => {
        pointToMessage(replyIndex);
    })

    messageOuterContainer.appendChild(messageContainer)
    parentContainer.appendChild(messageOuterContainer);


    let index = Array.from(
        document.getElementsByClassName("my-message")
    ).indexOf(messageContainer);


    addListenersToMessage(messageOuterContainer, messageContainer);

    const photoContainer = messageContainer.getElementsByClassName('photo-container')[0];
    photoContainer.addEventListener('click', e => {
        history.pushState(
            { contentId: currentFriendId, index: index },
            "",
            `/view-image`
        );
        const imageSrc = photoContainer.getElementsByClassName('photo-image-element')[0].src;
        document.getElementsByClassName("photo-viewer-image-element")[0].src = imageSrc;
        document.getElementsByClassName("photo-viewer-sender")[0].textContent = myMessage ? userInfo.username + "   (You)" : userInfo.friendUsernames[userInfo.friends.indexOf(currentFriendId)];
        document.getElementsByClassName("photo-viewer-time")[0].textContent = getSmartDate(date);
        document.getElementsByClassName('photo-viewer-wrapper')[0].classList.remove('hide')
    })

    scrollToBottom();
    return index;


}

function getPhotoDimensions(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Invalid image file'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.src = e.target.result;
        };
        reader.onerror = (e) => {
            reject(new Error('Error reading file'));
        };
        reader.readAsDataURL(file);
    });
}
function addListenersToMessage(messageOuterContainer, messageContainer) {


    messageOuterContainer.addEventListener('mouseover', e => {
        if (messageSelection == true) {
            messageOuterContainer.classList.add('message-outer-container-hover')
        }
    })
    messageOuterContainer.addEventListener('mouseout', e => {
        messageOuterContainer.classList.remove('message-outer-container-hover')

    })

    messageOuterContainer.addEventListener('click', e => {
        if (messageSelection == true) {
            const parentContainer = document.getElementsByClassName("active-chat-container")[0];
            let overallIndex = Array.from(parentContainer.getElementsByClassName("message")).indexOf(messageContainer);

            if (messageOuterContainer.classList.contains("selected-message")) {
                selectedMessages = selectedMessages.filter(element => element != overallIndex);
                messageOuterContainer.classList.remove("selected-message")
                let len = selectedMessages.length;
                document.getElementsByClassName('delete-count')[0].textContent = `(${len})`
                document.getElementsByClassName('forward-count')[0].textContent = `(${len})`
                document.getElementsByClassName('copy-count')[0].textContent = `(${len})`
                if (len == 0) {
                    cancelSelection()
                }

            }
            else {
                selectedMessages.push(overallIndex)
                messageOuterContainer.classList.add("selected-message")
                let len = selectedMessages.length;
                document.getElementsByClassName('delete-count')[0].textContent = `(${len})`
                document.getElementsByClassName('forward-count')[0].textContent = `(${len})`
                document.getElementsByClassName('copy-count')[0].textContent = `(${len})`
            }
        }

    })

    messageContainer.addEventListener("contextmenu", (e) => {
        const parentContainer = document.getElementsByClassName("active-chat-container")[0];
        let overallIndex = Array.from(parentContainer.getElementsByClassName("message")).indexOf(messageContainer); e.preventDefault();
        selectedMessageIndex = overallIndex
        const messageMenu = document.getElementsByClassName(
            "message-menu-wrapper"
        )[0];
        messageMenu.classList.add('show');
        // messageMenu.style.display = "flex";
        const wrapper = document.getElementsByClassName('chat-wrapper')[0];
        const wrapperRect = wrapper.getBoundingClientRect();
        const messageMenuRect = messageMenu.getBoundingClientRect();
        const containerRect = document.getElementsByClassName("chat-container-wrapper")[0].getBoundingClientRect();
        const refrenceRect = document
            .getElementsByClassName("main")[0]
            .getBoundingClientRect();

        if (containerRect.bottom - e.clientY >= messageMenuRect.height) {
            messageMenu.style.top = e.clientY - refrenceRect.top + "px";
        } else {
            messageMenu.style.top =
                e.clientY - refrenceRect.top - messageMenuRect.height + "px";
        }

        if (containerRect.right - e.clientX >= messageMenuRect.width) {
            messageMenu.style.left = e.clientX - refrenceRect.left - wrapperRect.left + "px";
        } else {
            messageMenu.style.left =
                e.clientX - refrenceRect.left - messageMenuRect.width - wrapperRect.left + "px";
        }

        document.getElementsByClassName("chat-container-wrapper")[0].style.overflow = "hidden";


    });
}

function openFile(file) {
    if (file) {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
    } else {
        console.log("No such file exists")
    }
}

async function saveAsFile(file) {


    if (file) {
        try {
            const opts = {
                suggestedName: file.name,
                types: [{
                    description: 'All Files',
                    accept: { '*/*': [] },
                }],
            };

            // Show the Save File Picker dialog
            const fileHandle = await window.showSaveFilePicker(opts);
            const writableStream = await fileHandle.createWritable();

            // Use a FileReader to read the file as a Blob and then write it
            const fileReader = new FileReader();
            fileReader.onload = async function () {
                const arrayBuffer = fileReader.result;
                await writableStream.write(new Uint8Array(arrayBuffer));
                await writableStream.close();
            };

            fileReader.readAsArrayBuffer(file);
        } catch (err) {
            console.error('Error saving file:', err);
        }
    } else {
        alert('No file selected.');
    }
}

function writeTextMessage(parentContainer, message, date, myMessage, sent, delivered, seen, replyIndex, forwarded) {

    let targetMessage;
    let targetMessageContent;
    if (replyIndex != undefined) {
        targetMessage = parentContainer.getElementsByClassName('message')[replyIndex];
        targetMessageContent = targetMessage.getElementsByClassName("message-content-inner")[0].innerText;
        if (targetMessage.classList.contains("file-message")) {
            if (targetMessageContent.length == 0) {
                targetMessageContent = "<i class='fas fa-file-alt'></i> " + targetMessage.getElementsByClassName("file-name")[0].textContent;
            }
            else {
                targetMessageContent = "<i class='fas fa-file-alt'></i> " + targetMessageContent;

            }
        }
        else if (targetMessage.classList.contains("photo-message")) {
            if (targetMessageContent.length == 0) {
                targetMessageContent = "<i class='fas fa-image'></i> " + "Image";
            }
            else {
                targetMessageContent = "<i class='fas fa-image'></i> " + targetMessageContent;

            }
        }
    }

    let messageOuterContainer = document.createElement('div');
    messageOuterContainer.classList.add('message-outer-container')
    let messageContainer = document.createElement("div");
    messageContainer.classList.add("message");
    if (myMessage) {
        const messages = parentContainer.getElementsByClassName('message');
        if (messages.length == 0 || messages[messages.length - 1].classList.contains('friend-message')) {
            messageOuterContainer.classList.add('first-message');
        }
        messageContainer.classList.add("my-message");
    } else {
        const messages = parentContainer.getElementsByClassName('message');
        if (messages.length == 0 || messages[messages.length - 1].classList.contains('my-message')) {
            messageOuterContainer.classList.add('first-message');
        }
        messageContainer.classList.add("friend-message");
    }


    let htm = ` 
        <div  class="message-wrapper">  
            <div class='forwarded-tag' style="display: ${forwarded == true ? 'flex' : 'none'};">
                <i class="fas fa-share"></i> <i>&nbsp; Forwarded</i>
            </div>
            <div class="replying-to-wrapper"  style="display: ${targetMessage ? 'flex' : 'none'};">
                <div class="replying-to" border-left: ${targetMessage && targetMessage.classList.contains('my-message') ? "5px solid var(--accent-bright)" : "5px solid #e707a0"}">
                    <div class="replying-to-username" style="color:${targetMessage && targetMessage.classList.contains('my-message') ? "var(--accent-color)" : "#e707a0"}">${targetMessage && targetMessage.classList.contains('my-message') ? userInfo.username + " (You)" : document.getElementsByClassName('friend-username')[0].textContent}</div>
                    <div class="replying-to-content">${targetMessage ? targetMessageContent : ""}</div>
                </div>
            </div>

            <div class="message-container">
                <div class="message-content">
                 
                    <span class="message-content-inner">
                        ${(processMessageContent(message))}

                    </span>
                    <div class="message-info">

                        <div class="message-time">
                            <div class="year">${date.year >= 10 ? date.year : "0" + date.year}</div>
                            <div class="month">${date.month >= 10 ? date.month : "0" + date.month}</div>
                            <div class="day">${date.day >= 10 ? date.day : "0" + date.day}</div>
                            <div class="hrs">${date.hours >= 10 ? date.hours : "0" + date.hours}</div>:
                            <div class="mins">${date.mins >= 10 ? date.mins : "0" + date.mins}</div>
                        </div>
                        <div class="message-status">
                            <img src="../assets/images/icons8-clock.gif" class="not-sent" style= display:${sent == true ? "none" : "flex"}>
                            <i class="fa-solid fa-circle-xmark circle-icon failed" style="display:none"></i>
                            <i class="fas fa-check-circle message-tick ${seen == true ? "blue-tick" : ""}" style=display:${sent == false ? "none" : "flex"}></i>
                        </div>

                    </div>
                           
               </div>
    
                
            </div>

            
            </div>
            
            
            `;

    messageContainer.innerHTML = htm;

    let replyingTo = messageContainer.getElementsByClassName('replying-to')[0];
    replyingTo.addEventListener('click', e => {
        pointToMessage(replyIndex);
    })

    messageOuterContainer.appendChild(messageContainer)
    parentContainer.appendChild(messageOuterContainer);

    let index = Array.from(
        document.getElementsByClassName("my-message")
    ).indexOf(messageContainer);
    swipeReplyBehaviour(messageContainer)
    addListenersToMessage(messageOuterContainer, messageContainer);
    enableCodeCopy(messageContainer);
    scrollToBottom();
    return index;
}


function enableCodeCopy(parent) {
    let copyCodeElements = parent.getElementsByClassName('copy-code');
    for (let i = 0; i < copyCodeElements.length; i++) {
        copyCodeElements[i].addEventListener('click', e => {
            const code = parent.getElementsByTagName('code')[i];
            navigator.clipboard.writeText(code.innerText)
                .then(data => {
                    copyCodeElements[i].innerHTML = '<i class="fas fa-check"></i> Copied';
                    setTimeout(() => {

                        copyCodeElements[i].innerHTML = '<i class="fas fa-copy"></i> Copy code';
                    }, 1000);
                })
        })
    }

}

function createUserCard(data) {
    const color = data.color;
    const container = document.createElement("div");
    container.className = "recent-message-chat";
    let messages = data.messages;
    let lastMessage = data.lastMessage;
    let lastMessageContent = "";
    if (lastMessage) {
        if (lastMessage.type == 'send') {
            lastMessageContent = escapeHtml(lastMessage.message)
        }
        else if (lastMessage.type == 'file') {
            lastMessageContent = '<i class="fas fa-file-alt"></i> ' + `${lastMessage.message.length ? lastMessage.message : lastMessage.file_details.name}`
        }
        else if (lastMessage.type == 'photo') {

            lastMessageContent = '<i class="fas fa-image"></i> ' + `${lastMessage.message.length ? lastMessage.message : lastMessage.file_details.name}`
        }
    }

    container.innerHTML = `
        <div class="user-profile-picture">
            <div class="profile-image-element" style="background-color:${color}">
                        ${data.userid == -1 ? '<i class = "fas fa-robot"></i>' : data.username[0].toUpperCase()}
                    </div>
                    <div class="connection-status online"></div>
                </div>
                <div class="user-info">
                    <div class="user-name">
                        <div class="username">${data.username}</div>
                        <div class='last-message-time'></div>
                        </div>
                        <div class="last-message">
                            <div class="last-message-details">
                                <div class="last-message-status">
                                    <i class="message-tick fas fa-check-circle"></i>
                                </div>
                                <div class="last-message-content">${(lastMessageContent)}</div>

                            </div>
                            <div class="typing-indicator-2">typing...</div>
                            <div class="new-messages"></div>
                        </div>

                    </div>
                 
            `;

    if (lastMessage) {
        if (lastMessage.sender == myid) {
            const element = container.getElementsByClassName(
                "last-message-status"
            )[0];
            element.style.display = "flex";
            if (lastMessage.status == 1) {
                element.classList.add("blue-tick");
            }
        }

        let lastMessageTime = getRelativeDate(lastMessage.time);
        if (lastMessageTime == "Today") {
            container.getElementsByClassName("last-message-time")[0].innerHTML =
                formatTime(lastMessage.time.hours, lastMessage.time.mins);
        } else {
            container.getElementsByClassName("last-message-time")[0].innerHTML =
                lastMessageTime;
        }
    }

    return container;
}

async function loadChats(friendId) {
    document.getElementsByClassName("chat-container-wrapper")[0].style.scrollBehavior = 'auto'
    const container = document.getElementsByClassName("recent-messages-container")[0];
    const index = userInfo.friends.indexOf(friendId);
    document.getElementsByClassName("message-input-element")[0].focus();
    let activeMessage = container.getElementsByClassName(
        "recent-active-message"
    );
    if (activeMessage.length) {
        activeMessage[0].classList.remove("recent-active-message");
    }
    container.getElementsByClassName("recent-message-chat")[index].classList.add("recent-active-message");

    const currentContainer = document.getElementsByClassName(`chat-container-${friendId}`);
    if (currentContainer.length) {

        document.getElementsByClassName('active-chat-container')[0].classList.remove("active-chat-container");
        currentContainer[0].classList.add("active-chat-container")
        document.getElementsByClassName('recent-messages-wrapper')[0].classList.add('hide')
        document.getElementsByClassName(
            "nav-options-mobile"
        )[0].style.display = "none";
        document.getElementsByClassName("welcome-page")[0].classList.add('hide')
        document.getElementsByClassName("navbar")[0].classList.add('hide')
        document.getElementsByClassName("chat-wrapper")[0].classList.remove('hide')
        document.getElementsByClassName('chat-end')[0].style.display = 'none'
        const friendUsername = userInfo.friendUsernames[userInfo.friends.indexOf(friendId)];
        document.getElementsByClassName("friend-username")[0].innerHTML = friendUsername;
        document.getElementsByClassName(
            "friend-connection-status"
        )[0].innerHTML = "last seen recently";

        let messageInput = document.getElementsByClassName(
            "message-input-element"
        )[0];


        messageInput.placeholder = "Message " + friendUsername;
        // messageInput.focus();
        scrollToBottom();
        currentFriendId = friendId;
        document.getElementsByClassName("chat-container-wrapper")[0].style.scrollBehavior = 'smooth'

        return;


    }

    let data = await fetchChats(friendId);
    if (data.ok) {
        let myUserid = data.data.myUserid;
        let friendUserid = data.data.friendUserid;
        let myUsername = data.data.myUsername;
        let friendUsername = data.data.friendUsername;
        let messages = data.data.messages;
        currentFriendId = friendUserid;
        if (messages.length || true) {
            document.getElementsByClassName('recent-messages-wrapper')[0].classList.add('hide')
            document.getElementsByClassName(
                "nav-options-mobile"
            )[0].style.display = "none";
            document.getElementsByClassName("welcome-page")[0].classList.add('hide')
            document.getElementsByClassName("navbar")[0].classList.add('hide')
            document.getElementsByClassName("chat-wrapper")[0].classList.remove('hide')
            document.getElementsByClassName('chat-end')[0].style.display = 'none'
            if (document.getElementsByClassName("active-chat-container").length) {

                document.getElementsByClassName("active-chat-container")[0].classList.remove("active-chat-container")
            }
            document.getElementsByClassName("friend-username")[0].innerHTML =
                friendUsername;
            document.getElementsByClassName(
                "friend-connection-status"
            )[0].innerHTML = "last seen recently";

            const newContainer = createChatContainer(messages, friendId);
            newContainer.classList.add('active-chat-container');


        }

        let messageInput = document.getElementsByClassName(
            "message-input-element"
        )[0];


        messageInput.placeholder = "Message " + friendUsername;
        scrollToBottom();
        document.getElementsByClassName("chat-container-wrapper")[0].style.scrollBehavior = 'smooth'

        // messageInput.focus();
    }
}

function DisplayChats(userid, element) {
    let parentContainer = document.getElementsByClassName(
        "recent-messages-container"
    )[0];
    let index = Array.from(
        parentContainer.getElementsByClassName("recent-message-chat")
    ).indexOf(element);
    parentContainer.getElementsByClassName("new-messages")[index].innerHTML = "";
    parentContainer.getElementsByClassName("new-messages")[
        index
    ].style.display = "none";
    element.classList.remove("blinky-chat");
    loadChats(userid).then((data) => {
        ws.send(
            JSON.stringify({
                type: "chat-opened",
                recepient: currentFriendId,
            })
        );
        history.pushState(
            { contentId: currentFriendId, index: index },
            "",
            `/chat/${currentFriendId}`
        );
    })
        .catch(err => {

            console.error("Error loading chats", err);


        });
}

async function fetchChats(userid) {
    let chats = await sendPostRequest("/messages", { userid });
    return chats;
}

function formatDate(date) {
    const day = date.day < 10 ? "0" + date.day : date.day;
    const month = date.month < 10 ? "0" + date.month : date.month;
    return `${day}-${month}-${date.year}`;
}

function trimToMaxLength(str, maxLength) {
    if (str.length <= maxLength) {
        return str;
    }
    return str.substring(0, maxLength) + "...";
}

function moveToFront(array, index) {
    // Check if the index is valid
    if (index < 0 || index >= array.length) {
        console.error("Invalid index");
        return array;
    }

    // Remove the element from the specified index
    const element = array.splice(index, 1)[0];

    // Add the element to the front of the array
    array.unshift(element);

    return array;
}

function compareTimes(time1, time2) {
    return time1.year > time2.year ? 1 : 0;
    return time1.month > time2.month ? 1 : 0;
    return time1.day > time2.day ? 1 : 0;
    return time1.hours > time2.hours ? 1 : 0;
    return time1.mins > time2.mins ? 1 : 0;

    return 1;
}

function toggleProfileSideBar() {
    document.getElementsByClassName('profile-info-wrapper-wrapper')[0].style.display = 'flex'
}

async function logout() {
    await sendPostRequest("/logout", {});
    window.location.reload();
}

function removeUnreadMessagesTag() {
    let unreadMessagesTag = document
        .getElementsByClassName(`chat-container-${currentFriendId}`)[0]
        .getElementsByClassName("unread");
    if (unreadMessagesTag.length) {
        unreadMessagesTag[0].remove();
    }
}

function removeTypingSymbol() {
    const typingElement = document.getElementsByClassName("typing")[0];
    typingElement.style.display = "none";
}

function getDayName(day) {
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    return days.at(day);
}

function getRelativeDate(date) {
    const currentDate = new Date();
    if (
        date.year != currentDate.getFullYear() ||
        date.month != currentDate.getMonth() + 1
    ) {
        return formatDate(date);
    }

    let difference = currentDate.getDate() - date.day;
    const currentDayIndex = currentDate.getDay();
    if (difference < 0) {
        throw new Error("Invalid date");
    } else if (difference >= 7) {
        return formatDate(date);
    }

    switch (difference) {
        case 0:
            return "Today";
        case 1:
            return "Yesterday";
        default:
            return getDayName(currentDayIndex - difference);
    }
}

function formatTime(hours, mins) {
    let str = "";
    hours < 10 ? (str += "0" + hours) : (str += hours);
    str += ":";
    mins < 10 ? (str += "0" + mins) : (str += mins);

    return str;
}

function scrollToChild(parent, child) {
    if (child) {
        child.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function searchChats(query) {
    let str = query.trim();
    if (!str.length) {
        return;
    }

    document.getElementsByClassName("chat-search-container")[0].innerHTML =
        "";
    let usernames = [];
    const parentElement = document.getElementsByClassName(
        "recent-messages-container"
    )[0];
    let usernameElements = parentElement.getElementsByClassName("username");

    for (let i = 0; i < usernameElements.length; i++) {
        usernames.push(usernameElements[i].textContent.toLowerCase());
    }

    const matchedUsernameIndices = findClosestUsernames(usernames, str);

    if (matchedUsernameIndices.length) {
        for (let usernameIndex of matchedUsernameIndices) {
            let originalElement = parentElement.getElementsByClassName(
                "recent-message-chat"
            )[usernameIndex];
            const elementIndex = Array.from(
                parentElement.getElementsByClassName("recent-message-chat")
            ).indexOf(originalElement);
            const userid = userInfo.friends[elementIndex];

            let clonedElement = originalElement.cloneNode(true);

            document
                .getElementsByClassName("chat-search-container")[0]
                .appendChild(clonedElement);
            clonedElement.addEventListener("click", (e) => {
                DisplayChats(userid, originalElement);
            });
        }
    } else {
        document.getElementsByClassName("chat-search-container")[0].innerHTML =
            "<div class='no-results'><i class='fas fa-search-minus'></i> &nbsp;No results</div>";
    }
    document.getElementsByClassName(
        "recent-messages-container"
    )[0].style.display = "none";
    document.getElementsByClassName(
        "chat-search-container"
    )[0].style.display = "flex";
}

async function DisplaySentMessage(receiver, message, forwarded) {
    if (message != "" && streamingResponse == false) {
        const messageInput = document.getElementsByClassName(
            "message-input-element"
        )[0];

        // Optionally, you can use a slight delay
        setTimeout(() => {
            messageInput.value = ""
            messageInput.rows = 1;
        }, 0);

        const date = new Date();
        //Need to insert date info and update others if the previous message was not send today
        await sendMessage(myid, receiver, message, date, forwarded == true ? null : selectedMessageIndex, forwarded);
        let container = document.getElementsByClassName(
            "recent-messages-container"
        )[0];

        const activeElement = container.getElementsByClassName(
            "recent-active-message"
        )[0];
        activeElement.getElementsByClassName(
            "last-message-status"
        )[0].style.display = "none";
        activeElement.getElementsByClassName(
            "last-message-status"
        )[0].classList.remove('blue-tick');

        activeElement.getElementsByClassName(
            "last-message-content"
        )[0].innerHTML = (message);


        activeElement.getElementsByClassName("last-message-time")[0].innerHTML =
            formatTime(date.getHours(), date.getMinutes());
        const index = Array.from(
            container.getElementsByClassName("recent-message-chat")
        ).indexOf(activeElement);
        container.insertBefore(activeElement, container.firstChild);
        moveToFront(userInfo.friends, index);
        moveToFront(userInfo.friendUsernames, index);
        moveToFront(userInfo.colors, index);
        scrollToChild(container, activeElement);
        messageInput.value = "";
        removeUnreadMessagesTag();
        document.getElementsByClassName("chat-search-container")[0].innerHTML =
            "";
        document.getElementsByClassName(
            "chat-search-container"
        )[0].style.display = "none";
        document.getElementsByClassName(
            "recent-messages-container"
        )[0].style.display = "flex";
        document.getElementsByClassName("chat-search-input")[0].value = "";
        selectedMessageIndex = null;
        document.getElementsByClassName('reply-message-wrapper')[0].style.display = 'none'
        messageInput.focus();
    }
}


function updateDateInfoContainers(container, time) {

    if (container.getElementsByClassName("message").length == 0) {
        container.appendChild(createDateInfo(time));
    }
    else {
        const messages = container.getElementsByClassName('message')
        const lastMessage = messages[messages.length - 1];
        const messageTimeElement = lastMessage.getElementsByClassName("message-time")[0];
        const year = parseInt(messageTimeElement.getElementsByClassName("year")[0].textContent);
        const month = parseInt(messageTimeElement.getElementsByClassName("month")[0].textContent);
        const day = parseInt(messageTimeElement.getElementsByClassName("day")[0].textContent);
        if (time.year != year || time.month != month || time.day != day) {

            const dateInfoContainers = container.getElementsByClassName('date-info');
            for (let i = 0; i < dateInfoContainers.length; i++) {
                const time = JSON.parse(dateInfoContainers[i].getElementsByClassName("actual-date-info")[0].textContent);
                dateInfoContainers[i].getElementsByClassName('relative-date-info')[0].textContent = getRelativeDate(time);
            }
            container.appendChild(createDateInfo(time));
        }

    }
}




function findClosestUsernames(usernames, testUsername) {
    let matches = [];
    for (let i = 0; i < usernames.length; i++) {
        if (usernames[i].includes(testUsername)) {
            matches.push(i);
        }
    }

    return matches;
}

async function searchFriends(query) {
    let inputElement = document.getElementsByClassName('search-people-element')[0];

    let str = query.trim();
    let wrapper = document.getElementsByClassName("friend-search-wrapper")[0];
    let container = document.getElementsByClassName("friend-search-container")[0];


    if (!str.length) {
        // wrapper.style.display = "none";
        document.getElementsByClassName(
            "search-people-cross-button"
        )[0].style.display = "none";


    } else {
        container.innerHTML =
            "<div style='align-self:center;padding:1vw;'>Searching...</div> ";
        let response = await sendPostRequest("/search-friend", { query });
        if (response.ok) {
            container.innerHTML = "";
            const searchResult = response.searchResult;

            for (let userInfo of searchResult) {
                let element = createSearchedFriendCard(userInfo);
                container.appendChild(element);
            }

            if (searchResult.length == 0) {
                container.innerHTML =
                    "<div style='align-self:center;padding:1vw;'>Couldn't find anything related to your search!</div> ";
            }
            container.style.display = "flex";
            document.getElementsByClassName(
                "search-people-cross-button"
            )[0].style.display = "flex";
        } else {
        }
    }
}

function createSearchedFriendCard(info) {
    let searchedFriend = document.createElement("div");
    searchedFriend.classList.add("searched-friend");

    searchedFriend.innerHTML = `<div class='searched-friend-profile-image' style='background-color:${info.color
        }'>${info.username[0].toUpperCase()}</div> <div class='searched-friend-profile-info' ><div class='searched-friend-profile-name'>${info.username
        }</div><div class='searched-friend-profile-gender'>${info.gender
        }</div></div >`;

    const addFriend = document.createElement("div");
    addFriend.classList.add("add-friend");

    if (info.isFriend == false) {
        addFriend.innerHTML = '<i class="fas fa-user-plus"></i> Add Friend';

        addFriend.addEventListener("click", async (e) => {
            addFriend.innerHTML = "Sending...";
            await sendPostRequest("/friend-request", { userid: info.userid });
            addFriend.innerHTML = '<i class="fas fa-check"></i> Request Sent';
        });
    } else {
        addFriend.innerHTML = '<i class="fas fa-comment"></i> Message';
        addFriend.addEventListener("click", e => {
            loadChats(info.userid)
        })
    }
    searchedFriend.appendChild(addFriend);

    return searchedFriend;
}

async function fetchNotifications() {

    document
        .getElementsByClassName("nav-active-option")[0]
        .classList.remove("nav-active-option");
    document
        .getElementsByClassName("notifications-option")[0]
        .classList.add("nav-active-option");
    document.getElementsByClassName(
        "recent-messages-wrapper"
    )[0].classList.add('hide-actually')
    document.getElementsByClassName(
        "notifications-wrapper"
    )[0].classList.remove('hide')
    // document.getElementsByClassName("welcome-page")[0].classList.remove('hide');
    document.getElementsByClassName("chat-wrapper")[0].classList.add('hide');
    document.getElementsByClassName('welcome-page')[0].classList.remove("hide")
    history.pushState({ contentId: "notifications" }, "", "/notifications");

    sendPostRequest('/notifications-seen', {})
    return;


    let response = await sendPostRequest("/fetch-notifications", {});
    if (response.ok) {
        document.getElementsByClassName(
            "notifications-container"
        )[0].innerHTML = "";
        const friendRequests = response.friendRequests;
        if (friendRequests) {
            for (let i = friendRequests.length - 1; i >= 0; i--) {
                let card = createNotificationCard(friendRequests[i]);
                document
                    .getElementsByClassName("notifications-container")[0]
                    .appendChild(card);
            }
        } else {
            document.getElementsByClassName(
                "notifications-container"
            )[0].innerHTML =
                '<div class="center" style="height:100%"><i class="fas fa-search-minus"></i>Nothing found </div>';
        }
    } else {
    }
    history.pushState({ contentId: "notifications" }, "", "/notifications");
}

function createNotificationCard(info) {
    let container = document.createElement("div");
    container.classList.add("notification");
    if (info.seen == false) {
        container.classList.add('unread-notification')
    }

    container.innerHTML = `  <div class="notification-profile-picture">
                        <div class="notification-image-element" style="background-color:${info.color}">${info.username[0].toUpperCase()}</div>
                    </div>
                    <div class="notification-info">
                        <div class="notification-username">${info.username
        }</div>
                        <div class="notification-content">
                            ${info.type == 1
            ? "wants to be your friend!"
            : "accepted your friend request!"
        }

                        </div>
                    </div>`;

    if (info.type == 2) {
        return container;
    }

    let notificationResponse = document.createElement("div");
    notificationResponse.classList.add("notification-response");
    let accept = document.createElement("div");
    let reject = document.createElement("div");

    accept.classList.add("accept");
    reject.classList.add("reject");

    if (info.accepted) {
        accept.innerHTML = "Accepted";
        accept.classList.add('accepted')
    } else {
        accept.innerHTML = "Confirm";
    }
    reject.innerHTML = "Delete";
    notificationResponse.appendChild(accept);

    if (!info.accepted) {
        notificationResponse.appendChild(reject);
        reject.addEventListener("click", async (e) => {
            let response = await sendPostRequest("/reject_friend_request", {
                userid: info.userid,
            });

            if (response.ok) {
                container.style.display = "none";
            } else {
                displayErrorMessage("Something went wrong!");
            }
        });
    }
    container.appendChild(notificationResponse);

    if (!info.accepted) {
        accept.addEventListener("click", async (e) => {
            let response = await sendPostRequest("/accept_friend_request", {
                userid: info.userid,
            });
            accept.innerHTML = "Accepted";
            accept.classList.add('accepted')
            reject.remove();
        });
    }

    return container;
}

function goHome() {
    window.location.href = "/home";
}

function copyMessageText() {
    let chatContainer = document.getElementsByClassName('active-chat-container')[0];
    let selectedMessage = chatContainer.getElementsByClassName('message-content-inner')[selectedMessageIndex];
    navigator.clipboard.writeText(selectedMessage.innerText)
        .then(() => {
            // document.getElementsByClassName('message-menu-wrapper')[0].style.display = 'none'
            document.getElementsByClassName('message-menu-wrapper')[0].classList.remove('show');
            document.getElementsByClassName("chat-container-wrapper")[0].style.overflow = 'auto'
            selectedMessageIndex = null;
        })
}

function replyMessage() {
    let chatContainer = document.getElementsByClassName('active-chat-container')[0];
    const selectedMessageContainer = chatContainer.getElementsByClassName('message')[selectedMessageIndex]
    let selectedMessage = chatContainer.getElementsByClassName('message-content-inner')[selectedMessageIndex];
    let messageText = selectedMessage.innerText;
    let replyMessageWrapper = document.getElementsByClassName('reply-message-wrapper')[0];
    if (selectedMessageContainer.classList.contains('my-message')) {

        replyMessageWrapper.getElementsByClassName('friend-name')[0].textContent = userInfo.username;
        replyMessageWrapper.getElementsByClassName('friend-name')[0].style.color = 'var(--accent-bright)'
    }
    else {

        replyMessageWrapper.getElementsByClassName('friend-name')[0].textContent = document.getElementsByClassName('friend-username')[0].textContent;
        replyMessageWrapper.getElementsByClassName('friend-name')[0].style.color = '#e707a0'
    }
    if (selectedMessageContainer.classList.contains("file-message")) {

        if (messageText.length == 0) {
            messageText = "<i class='fas fa-file-alt'></i> " + selectedMessageContainer.getElementsByClassName("file-name")[0].textContent;
        }
        else {

            messageText = "<i class='fas fa-file-alt'></i> " + messageText;
        }

    }
    else if (selectedMessageContainer.classList.contains("photo-message")) {

        if (messageText.length == 0) {
            messageText = "<i class='fas fa-image'></i> " + "Image";
        }
        else {

            messageText = "<i class='fas fa-image'></i> " + messageText;
        }

    }
    replyMessageWrapper.getElementsByClassName('reply-message-content')[0].innerHTML = (messageText)
    replyMessageWrapper.style.display = 'flex'
    document.getElementsByClassName('message-menu-wrapper')[0].classList.remove('show')
    document.getElementsByClassName("chat-container-wrapper")[0].style.overflow = 'auto'

}

function deleteMessage() {
    document.getElementsByClassName('message-menu-wrapper')[0].classList.remove('show')
    // document.getElementsByClassName('delete-message-wrapper')[0].style.display = 'flex'
    customAlert("Delete Message", "This action will delete this message for everone.", "Cancel", "Delete", confirmDelete, true);

}

function confirmDelete() {
    // const obj = { type: "delete-message", friendId: currentFriendId, messageIndex }
    // ws.send(JSON.stringify(obj))
    let chatContainer = document.getElementsByClassName('active-chat-container')[0];
    let messageIndex = selectedMessageIndex;
    document.getElementsByClassName("chat-container-wrapper")[0].style.overflow = 'auto'
    selectedMessageIndex = null;
    setTimeout(() => {
        explodeMessage(chatContainer.getElementsByClassName('message')[messageIndex]);
        deleteMessageSound.play()

    }, 100);
}

function explodeMessage(message) {
    message.classList.add('explode');

    // Wait for the animation to complete before removing the element
    setTimeout(() => {
        message.style.display = 'none';
    }, 400); // Match this duration with the CSS animation duration
}


function scrollChatContainer() {
    const chatContainer = document.getElementsByClassName('chat-container-wrapper')[0];
    if (isScrolledToMax(chatContainer)) {
        document.getElementsByClassName('chat-end')[0].style.display = 'none'
    }
    else {
        document.getElementsByClassName('chat-end')[0].style.display = 'flex'

    }
}

function scrollToBottom() {
    let chatContainer = document.getElementsByClassName("chat-container-wrapper")[0]
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


function pointToMessage(messageIndex) {
    let parent = document.getElementsByClassName(`chat-container-${currentFriendId}`)[0]
    let child = parent.getElementsByClassName('message-outer-container')[messageIndex]

    if (child) {
        scrollToCenter(document.getElementsByClassName('chat-container-wrapper')[0], child);
        child.classList.add('blinky-message')
        setTimeout(() => {
            child.classList.remove('blinky-message')

        }, 2000);
    }
}

function selectMessages() {
    let chatContainer = document.getElementsByClassName('active-chat-container')[0]
    messageSelection = true;
    selectedMessages.push(selectedMessageIndex)
    document.getElementsByClassName('message-outer-container')[selectedMessageIndex].classList.add('selected-message');
    document.getElementsByClassName('message-menu-wrapper')[0].classList.remove('show')
    // document.getElementsByClassName('message-menu-wrapper')[0].style.display = 'none';
    document.getElementsByClassName("chat-container-wrapper")[0].style.overflow = 'auto'
    selectedMessageIndex = null;
    document.getElementsByClassName('friend-profile-info')[0].style.display = 'none';
    document.getElementsByClassName('selected-messages-wrapper')[0].style.display = 'flex';
    document.getElementsByClassName('delete-count')[0].textContent = "(1)"
    document.getElementsByClassName('forward-count')[0].textContent = "(2)"
    document.getElementsByClassName('copy-count')[0].textContent = "(3)"


}

function cancelSelection() {
    messageSelection = false;
    selectedMessages = [];
    let selectedMessageElements = document.getElementsByClassName('selected-message');
    let len = selectedMessageElements.length;
    for (let i = 0; i < len; i++) {
        selectedMessageElements[0].classList.remove('selected-message')
    }
    document.getElementsByClassName('friend-profile-info')[0].style.display = 'flex';
    document.getElementsByClassName('selected-messages-wrapper')[0].style.display = 'none';
}
function scrollToCenter(parent, child) {
    // Get the parent and child elements

    // Calculate the offset of the child element
    const childOffsetTop = child.offsetTop;

    // Calculate the center position
    const parentHeight = parent.clientHeight;
    const childHeight = child.clientHeight;
    const centerOffset = childOffsetTop - (parentHeight / 2) + (childHeight / 2);

    // Set the scroll position of the parent element
    parent.scrollTop = centerOffset;
}

async function downloadFileMessage(container, fileId, fileName, fileType, isPhoto) {
    try {
        const fileIndex = container.getElementsByClassName('file-message').length - 1;
        const photoIndex = container.getElementsByClassName('photo-message').length - 1;
        let chunks = [];
        let cachedChunks = await getFileChunksFromCache(db, fileId);
        if (cachedChunks && cachedChunks.length) {
            console.log("Downloading From Local")
            chunks = cachedChunks
        }
        else {
            console.log("Downloading From Server")
            const response = await fetch('/files/id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: fileId }),
            });

            if (!response.ok) {
                console.error('Failed to download file:', response.statusText);
                return;
            }
            const reader = response.body.getReader();
            const totalSize = parseInt(response.headers.get('Content-Length'), 10) || null;
            let receivedSize = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }

                if (value) {
                    await storeFileChunk(db, fileId, value)
                    chunks.push(value);
                    receivedSize += value.length;
                    const progress = Math.floor((100 * receivedSize) / (totalSize))
                    if (!isPhoto) {
                        container.getElementsByClassName('size-downloaded')[fileIndex].textContent = getStandardSize(receivedSize)
                        container.getElementsByClassName('total-size')[fileIndex].textContent = "/" + getStandardSize(totalSize)
                        container.getElementsByClassName('bar')[fileIndex].style.width = progress + "%";
                    }
                    else {
                        container.getElementsByClassName('progressText')[photoIndex].textContent = `${getStandardSize(receivedSize)} / ${getStandardSize(totalSize)}`;
                        container.getElementsByClassName('progress-percent')[photoIndex].textContent = progress + '%';
                        setProgress(container.getElementsByClassName('photo-message')[photoIndex], progress)
                    }

                } else {
                    console.warn('Received empty chunk');
                }
            }


        }

        if (isPhoto) {
            const photoContainer = container.getElementsByClassName("photo-container")[photoIndex];
            filePreviewFromChunks(photoContainer, chunks, fileType, true)
        }
        else {
            const previewContainer = container.getElementsByClassName('file-preview')[fileIndex]
            filePreviewFromChunks(previewContainer, chunks, fileType, false)
        }

        const blob = new Blob(chunks, { type: fileType });
        const link = URL.createObjectURL(blob)
        if (!isPhoto) {
            container.getElementsByClassName('file-downloader')[fileIndex].classList.add("hide")
            container.getElementsByClassName('file-downloader')[fileIndex].classList.remove("show")
            container.getElementsByClassName('file-actions')[fileIndex].classList.remove("hide")
            container.getElementsByClassName('file-actions')[fileIndex].classList.add("show")
            container.getElementsByClassName('save-as')[fileIndex].addEventListener('click', e => { downloadCachedFile(link, fileName) })
            container.getElementsByClassName('open')[fileIndex].addEventListener('click', e => { openCachedFile(link) })
        }

    } catch (error) {
        console.error('Error downloading file:', error);
    }
}


async function downloadCachedFile(url, fileName) {

    const extension = fileName.split(".").pop();

    if (url && fileName) {

        const response = await fetch(url);
        const blob = await response.blob();

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        // description: 'All Files',
                        accept: {
                            'application/octet-stream': [`.${extension}`] || ['']
                        }
                    }]
                })
                const writableStream = await handle.createWritable();
                await writableStream.write(blob)
                await writableStream.close();


            } catch (error) {

                console.error('File system Access API is not supported', error)

            }
        }


    } else {
        console.error('No cached file found');
    }
}


function openCachedFile(url) {
    if (url) {
        window.open(url)
    }
    else {
        console.error("Doesn't exits!")
    }
}


function getStandardSize(size) {
    let count = 0;
    let map = ['B', 'KB', 'MB', 'GB'];
    while (size >= 1024) {
        size /= 1024;
        count++;
    }

    return size.toFixed(1) + " " + map[count];
}


function previewFile(container, file, receivePreview, isPhoto) {
    container.innerHTML = ""
    if (file) {
        const reader = new FileReader();
        if (file.type.startsWith('image/')) {
            reader.onload = function (e) {
                const img = document.createElement('img');
                if (isPhoto) {
                    img.classList.add('photo-image-element');
                }
                else if (receivePreview) {

                    img.classList.add('preview-element-alt')
                }
                else {

                    img.classList.add('preview-element')
                }
                img.src = e.target.result
                container.appendChild(img)
            }

            reader.readAsDataURL(file)
        }
        else if (file.type == 'application/pdf') {
            reader.onload = function (e) {
                try {
                    const loadingTask = pdfjsLib.getDocument({ data: e.target.result });
                    loadingTask.promise.then(function (pdf) {
                        pdf.getPage(1).then(function (page) {
                            const scale = 1;
                            const viewport = page.getViewport({ scale: scale })
                            const canvas = document.createElement('canvas');
                            if (receivePreview) {

                                canvas.classList.add('preview-element-alt')
                            }
                            else {

                                canvas.classList.add('preview-element')
                            }
                            const context = canvas.getContext('2d');
                            canvas.height = viewport.height
                            canvas.width = viewport.width

                            const renderContext = {
                                canvasContext: context,
                                viewport: viewport
                            }

                            page.render(renderContext)
                            container.appendChild(canvas)

                        }
                        )
                    })

                } catch (error) {

                    console.log("Error: could not load pdf.js")

                }


            }

            reader.readAsArrayBuffer(file)
        }

        else {
            container.style.display = 'none'
        }
    }

}

function filePreviewFromChunks(container, chunks, fileType, isPhoto) {
    const blob = new Blob(chunks, { type: fileType });
    const file = new File([blob], "tempFile", { type: fileType });
    previewFile(container, file, true, isPhoto);
}


function chunkFile(file, chunkSize) {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const chunks = [];
    let currentChunk = 0;

    function readNextChunk() {
        if (currentChunk >= totalChunks) {
            return Promise.resolve(); // All chunks processed
        }

        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const blob = file.slice(start, end);

        return new Promise((resolve, reject) => {
            processChunk(blob)
                .then(chunkData => {
                    chunks.push(chunkData);
                    currentChunk++;
                    resolve(readNextChunk()); // Process the next chunk
                })
                .catch(reject);
        });
    }

    function processChunk(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function (event) {
                const arrayBuffer = event.target.result;
                const uint8Array = new Uint8Array(arrayBuffer);
                resolve(uint8Array); // Resolve with the chunk data
            };

            reader.onerror = function (error) {
                reject(error); // Reject on error
            };

            reader.readAsArrayBuffer(blob);
        });
    }

    return readNextChunk().then(() => chunks); // Return the array of chunks
}


const dbPromise = indexedDB.open('database', 1);

dbPromise.onupgradeneeded = function (event) {
    const db = event.target.result;
    const store = db.createObjectStore('fileChunks', { autoIncrement: true });
    store.createIndex('fileId', 'fileId');
};

dbPromise.onerror = function (event) {
    console.error("IndexedDB error: ", event.target.errorCode);
};

dbPromise.onsuccess = async function (event) {
    db = event.target.result;
};

async function storeFileChunk(db, fileId, chunkData) {

    return new Promise((resolve, reject) => {
        const transaction = db.transaction('fileChunks', 'readwrite');
        const store = transaction.objectStore('fileChunks');
        const request = store.put({ fileId, chunkData });

        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            console.error("Error storing file chunk: ", request.error);
            reject(request.error);
        };
    });
}

async function getFileChunksFromCache(db, fileId) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const transaction = db.transaction('fileChunks', 'readonly');
        const store = transaction.objectStore('fileChunks');
        const index = store.index('fileId');
        const request = index.openCursor(IDBKeyRange.only(fileId));

        request.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                chunks.push(cursor.value.chunkData);
                cursor.continue();
            } else {
                resolve(chunks);
            }
        };

        request.onerror = () => {
            console.error("Error fetching file chunks: ", request.error);
            reject(request.error);
        };
    });
}


//testing for push notifications

const publicVapidKey = 'BE-Y9hALujcoIQGb6U3cxsUlszhT8KhYoLSy7T6wA6U8rNJP-f5dACdsNK6ZSJXeX0jr0hcJCkixV3j6hwh3KK8'; // Replace with your public VAPID key
async function subscribeUser() {
    try {
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/src/sw.js');

        // Check if the user is already subscribed
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // If not subscribed, subscribe the user
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Send the subscription to the server to save it
            await fetch('/subscribe', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Subscription saved:', subscription);
        } else {
            console.log('User is already subscribed:', subscription);
        }
    } catch (error) {
        console.error('Failed to subscribe:', error);
    }
}

subscribeUser()

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}


function sendCode() {
    let text = (document.getElementsByClassName('code-preview')[0].innerText);
    console.log("Text ", text);

    if (text.trim().length) {
        text = '```' + text + '```';
        DisplaySentMessage(currentFriendId, text, false);
        document.getElementsByClassName('code-wrapper')[0].classList.add('hide')
    }
}

function escapeHtml(html) {
    const text = document.createTextNode(html);
    const div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
}
function cleanHtml(html) {

    // Remove extra spaces and line breaks
    return html
        .replace(/(\s*\n\s*)+/g, '\n') // Replace multiple newlines with a single newline
        .replace(/\s{2,}/g, ' ')       // Replace multiple spaces with a single space
        .trim();                       // Remove leading and trailing spaces
}

function createChatErrorMessage(message) {
    let chatErrorMessage = document.createElement('div');
    chatErrorMessage.classList.add('chat-error-message');
    chatErrorMessage.innerHTML = message;

    document.getElementsByClassName('chat-container')[0].appendChild(chatErrorMessage)

}

function getGoodHTML(text) {
    return text.replace(/\n/g, '<br>').replace(/ {2}/g, '&nbsp;&nbsp;')
}


function encloseCodeInHtml(text) {
    // Regular expression to match code blocks enclosed by triple backticks
    const codeBlockRegex = /```([\s\S]*?)```/g;

    // Replace code blocks with <pre><code></code></pre>
    const htmlText = text.replace(codeBlockRegex, (match, code) => {
        // Optionally, you can add a class for syntax highlighting, e.g., `language-cpp`
        return `<pre><code>${code.trim()}</code></pre>`;
    });

    return htmlText;
}


function isScrolledToMax(element) {
    const offSet = Math.abs(element.scrollTop + element.clientHeight - element.scrollHeight)

    return offSet <= 50;
}



function processMessageContent(message) {

    let fragments = message.split('```');
    let html = "";

    for (let i = 0; i < fragments.length; i++) {

        if (i % 2 == 1) {
            //inside backticks
            const highlighted = highlightCode(fragments[i]);
            const lang = highlighted.language
            html += `<pre> <div class = 'code-tools'> <div>${lang ? lang : 'Unknown Language'}</div> <div class="copy-code"> <i class="fas fa-copy"></i> Copy code</div> </div><code>` + highlighted.value + "</code></pre>";

        }
        else {
            let text = getGoodHTML(escapeHtml(fragments[i]));
            text = markdownToHtml(text);
            // text = parseTable(text);
            try {

                text = Autolinker.link(text, {
                    newWindow: true,
                    stripPrefix: false,
                    urls: { schemeMatches: true, wwwMatches: true, tldMatches: true },
                    email: true,
                    phone: true,
                    replaceFn: function (match) {
                        // Get the URL from the match
                        const url = match.getAnchorHref();

                        // Only add the warning to external links
                        if (match.getType() === 'url') {
                            try {
                                const matchOrigin = new URL(url).origin;
                                if (matchOrigin !== window.location.origin) {
                                    // Return the custom anchor tag with the warning function
                                    return `<a class='link-button' href="${url}" onClick="filterLinks(event, '${url}')">${match.getAnchorText()}</a>`;
                                }
                            } catch (error) {
                                console.error("Invalid URL:", url, error);
                            }
                        }

                        // Return the default anchor for internal links or if no condition matched
                        return match.getAnchorHtml(); // Ensure to return something valid
                    }
                });


            } catch (error) {

                console.log("Could not load autolinker")

            }
            html += text;
        }
    }

    return getGoodHTML(html);


}

function highlightCode(code) {
    return hljs.highlightAuto(code)
}

function markdownToHtml(text) {
    // Convert bold: **text** or __text__
    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    text = text.replace(/__(.*?)__/g, '<u>$1</u>');

    // Convert italic: *text* or _text_
    text = text.replace(/\*(.*?)\*/g, '<i>$1</i>');
    text = text.replace(/\==(.*?)\==/g, '<important>$1</important>');
    // text = text.replace(/_(.*?)_/g, '<i>$1</i>');

    // Convert strikethrough: ~~text~~
    text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');
    text = text.replace(/`(.*?)`/g, '<code>$1</code >');

    // Convert links: [text](url)
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a class="link-button" href="$2" onClick="filterLinks(event,\'$2\')">$1</a>');


    return text;
}
function parseTable(text) {
    // Regular expression to find text between [table] and [/table]
    const regex = /\[table\]([\s\S]*?)\[\/table\]/;
    const match = text.match(regex);

    if (!match) {
        console.log("No table found.");
        return;
    }

    // Extract the CSV text
    const csvText = match[1].trim();

    // Split the CSV text into rows
    const rows = csvText.split('|').map(row => row.split(',').map(cell => cell.trim()));

    // Create HTML table
    let htmlTable = '<table border="1">';

    // Treat the first row as the header
    const headerRow = rows[0];
    htmlTable += '<tr>';
    for (const header of headerRow) {
        htmlTable += `<th>${header}</th>`;  // Use <th> for headers
    }
    htmlTable += '</tr>';

    // Create rows for the rest of the table
    for (let i = 1; i < rows.length; i++) {
        htmlTable += '<tr>';
        for (const cell of rows[i]) {
            htmlTable += `<td>${cell}</td>`;  // Use <td> for normal data cells
        }
        htmlTable += '</tr>';
    }

    htmlTable += '</table>';

    return htmlTable;
}


function copyHTML(html, element) {
    navigator.clipboard.write(getGoodHTML(escapeHtml(html)))
        .then(data => {
            element.innerHTML = '<i class="fas fa-check"></i> Copied';
            setTimeout(() => {

                element.innerHTML = '<i class="fas fa-copy"></i> Copy code';
            }, 1000);
        })
}


function createChatInfo(info) {
    const chatInfoContainer = document.createElement('div');
    chatInfoContainer.className = 'chat-info';
    chatInfoContainer.innerHTML = info;

    return chatInfoContainer;

}
function createDateInfo(time) {
    const relativeTime = getRelativeDate(time);
    const dateInfoContainer = document.createElement('div');
    dateInfoContainer.className = 'chat-info date-info';

    const relativeDateContainer = document.createElement('span');
    relativeDateContainer.className = "relative-date-info"
    const actualDateContainer = document.createElement('span');
    actualDateContainer.className = "actual-date-info"

    relativeDateContainer.textContent = getRelativeDate(time);
    actualDateContainer.textContent = JSON.stringify(time);
    dateInfoContainer.appendChild(relativeDateContainer)
    dateInfoContainer.appendChild(actualDateContainer)

    return dateInfoContainer;

}
function createChatContainer(messages, containerId) {
    const container = document.createElement('div');
    container.className = `chat-container active-chat-container  chat-container-${containerId}`;
    const chatBackground = document.createElement('div');
    chatBackground.className = 'chat-background';
    // container.appendChild(chatBackground)

    const topMessageTime = document.createElement('div')
    topMessageTime.className = 'top-message-time';
    topMessageTime.textContent = 'Yesterday'
    // container.appendChild(topMessageTime)
    container.appendChild(createChatInfo("<i class='fas fa-lock'></i> Messages to this chat are end to end encrypted. Stop worrying about the security."));

    document.getElementsByClassName('chat-container-wrapper')[0].appendChild(container);

    let unreadCount = 0;
    let visitedUnreadMessage = false;
    const unreadContainer = document.createElement('div');
    unreadContainer.className = 'unread';

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (message.status == 0 && message.sender == currentFriendId) {
            //unread message from friend
            unreadCount++;
            if (!visitedUnreadMessage) {
                container.appendChild(unreadContainer);
                unreadContainer.textContent = unreadCount + " unread messages";
            }
            else {

                unreadContainer.textContent = unreadCount + ' unread messages';
            }

            visitedUnreadMessage = true;
        }

        if (i == 0 || message.time.day != messages[i - 1].time.day) {
            const dateContainer = createDateInfo(message.time);
            container.appendChild(dateContainer);
        }

        if (message.type == 'send') {
            writeTextMessage(container, message.message, message.time, message.sender == myid, true, message.state == 0, message.status == 1, message.replyIndex, message.forwarded);
        }
        else if (message.type == 'file') {

            writeFileMessage(container, message.file_details, message.message, message.time, message.sender == myid, true, message.state == 0, message.status == 1, message.replyIndex, true);
            downloadFileMessage(container, message.fileId, message.file_details.name, message.file_details.type)

        }
        else if (message.type == 'photo') {
            writePhotoMessage(container, message.file_details, message.message, message.time, message.sender == myid, true, message.state == 0, message.status == 1, message.replyIndex, true);
            downloadFileMessage(container, message.fileId, message.file_details.name, message.file_details.type, true)
        }


    }
    return container;

}

function createForwardFriendElement(name, status, id, color) {
    // Create the outer container
    const forwardFriend = document.createElement('div');
    forwardFriend.className = 'forward-friend';

    // Create the inner container for friend info
    const forwardFriendInfo = document.createElement('div');
    forwardFriendInfo.className = 'forward-friend-info';

    // Create the profile image container
    const forwardFriendProfileImage = document.createElement('div');
    forwardFriendProfileImage.style.backgroundColor = color;
    forwardFriendProfileImage.className = 'forward-friend-profile-image';
    forwardFriendProfileImage.textContent = name.toUpperCase()[0];

    // Create the profile details container
    const forwardFriendProfileDetails = document.createElement('div');
    forwardFriendProfileDetails.className = 'forward-friend-profile-details';

    // Create the profile name element
    const forwardFriendProfileName = document.createElement('div');
    forwardFriendProfileName.className = 'forward-friend-profile-name';
    forwardFriendProfileName.textContent = name;

    // Create the profile status element
    const forwardFriendProfileStatus = document.createElement('div');
    forwardFriendProfileStatus.className = 'forward-friend-profile-status';
    forwardFriendProfileStatus.textContent = status;

    // Append profile name and status to profile details
    forwardFriendProfileDetails.appendChild(forwardFriendProfileName);
    forwardFriendProfileDetails.appendChild(forwardFriendProfileStatus);

    // Append profile image and details to the friend info container
    forwardFriendInfo.appendChild(forwardFriendProfileImage);
    forwardFriendInfo.appendChild(forwardFriendProfileDetails);

    // Create the checkbox container
    const forwardCheckBox = document.createElement('div');
    forwardCheckBox.className = 'forward-check-box';

    // Create the checkbox element
    const forwardCheckboxElement = document.createElement('input');
    forwardCheckboxElement.className = 'forward-checkbox-element';
    forwardCheckboxElement.type = 'checkbox';

    // Append the checkbox to the checkbox container
    forwardCheckBox.appendChild(forwardCheckboxElement);

    // Append the friend info and checkbox to the outer container
    forwardFriend.appendChild(forwardFriendInfo);
    forwardFriend.appendChild(forwardCheckBox);




    forwardFriend.addEventListener("click", e => {
        if (forwardCheckboxElement.checked == true) {
            forwardCheckboxElement.checked = false;
            forwardFriends = forwardFriends.filter(item => item != id);
            if (forwardFriends.length == 0) {
                document.getElementsByClassName("forward-button")[0].disabled = true;
                document.getElementsByClassName("forward-button")[0].classList.add("disabled-forward-button")

            }
        }
        else {

            forwardCheckboxElement.checked = true;
            forwardFriends.push(id);
            document.getElementsByClassName("forward-button")[0].disabled = false;
            document.getElementsByClassName("forward-button")[0].classList.remove("disabled-forward-button")

        }
    })

    // Return the outer container
    return forwardFriend;
}


function getSmartDate(date) {
    // Array of month abbreviations
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Get the date components from the date object
    const day = String(date.day).padStart(2, '0'); // Pad single digits to two digits
    const month = months[date.month - 1]; // Get the month abbreviation
    const year = date.year;
    const hours = String(date.hours).padStart(2, '0'); // Pad hours to two digits
    const mins = String(date.mins).padStart(2, '0'); // Pad minutes to two digits

    // Format the date string
    return `${day} ${month} ${year} ${hours}:${mins}`;
}


function getTopVisibleChild() {
    const parent = document.getElementsByClassName("chat-container-wrapper")[0];
    const children = parent.getElementsByClassName("message-outer-container");
    const parentRect = parent.getBoundingClientRect();

    for (let child of children) {
        const childRect = child.getBoundingClientRect();

        // Check if the top of the child is at or above the top of the parent
        if (childRect.bottom >= parentRect.top && childRect.bottom <= parentRect.bottom) {
            return child;  // Return the first visible child at the top
        }
    }
    return null;  // In case no child is in the viewport
}


function customAlert(alertTitle, alertMessage, back, next, callback, isWarning) {
    const container = document.createElement('div');
    container.className = 'alert-container';

    const title = document.createElement('h2');
    title.className = 'alert-title';
    title.textContent = alertTitle;

    const message = document.createElement('div');
    message.className = 'alert-message';
    message.innerHTML = alertMessage;

    const actions = document.createElement('div');
    actions.className = 'alert-actions';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'button alert-action alert-cancel';
    cancelButton.textContent = back;

    const okButton = document.createElement('button');
    okButton.className = 'button alert-action alert-ok';
    okButton.textContent = next;
    if (isWarning) {
        okButton.classList.add("warning-alert-button");
    }

    // Append buttons to actions
    actions.appendChild(okButton);
    actions.appendChild(cancelButton);

    // Append everything to the container
    container.appendChild(title);
    container.appendChild(message);
    container.appendChild(actions);

    const wrapper = document.getElementsByClassName("alert-wrapper")[0];
    wrapper.appendChild(container);
    wrapper.style.display = 'flex';


    okButton.addEventListener('click', (e) => {
        wrapper.style.display = 'none'
        container.remove();
        callback();

    });
    cancelButton.addEventListener('click', (e) => {
        wrapper.style.display = 'none'
        container.remove();
    })

}

function removeFileSendContainer() {
    selectedFile = null;
    selectedFormData = null;
    fileType = null;

    document.getElementsByClassName("caption-input-element")[0].value = "";
    document.getElementsByClassName("file-send-wrapper")[0].style.display = 'none';


}

function filterLinks(event, url) {
    event.preventDefault();
    const visit = () => {
        window.open(url, '_blank');
    }
    customAlert("External Website", `This link will take to an external website: <b>${url}</b>`, "Cancel", "Visit link", visit, true);
}

let startX = 0;
let currentX = 0;
let startY = 0;
let currentY = 0;
function swipeReplyBehaviour(message) {

    message.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });


    message.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientX;
        const distance = currentX - startX;

        const translateDistance = Math.min(distance, 100);

        if (distance > 50 && currentY - startY < 2) { // Only move if swiping right
            message.style.transform = `translateX(${translateDistance}px)`;
        }
    });


    message.addEventListener('touchend', (e) => {


        if (currentX - startX > 100 && currentY - startY < 2) {
            const parentContainer = document.getElementsByClassName("active-chat-container")[0];
            let overallIndex = Array.from(parentContainer.getElementsByClassName("message")).indexOf(message);
            selectedMessageIndex = overallIndex;
            document.getElementsByClassName('message-input-element')[0].focus();

            replyMessage();

        }
        message.style.transform = `translateX(0)`;
        startX = 0;
        currentX = 0;
        startY = 0;
        currentY = 0;

    });
}

function setProgress(messageContainer, percent) {
    const circle = messageContainer.getElementsByClassName('progress-circle')[0];
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    circle.style.strokeDashoffset = offset;
    // document.getElementById('progressText').textContent = `${percent}%`;
}


function toggleFullScreen(element) {
    if (!document.fullscreenElement) {
        // Enter full screen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, and Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
        }
        element.classList.remove('fa-expand');
        element.classList.add('fa-compress');
    } else {
        // Exit full screen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
        element.classList.remove('fa-compress');
        element.classList.add('fa-expand');
    }
}

function preForwardMesssage() {

    document.getElementsByClassName("message-menu-wrapper")[0].classList.remove("show")

    const outerContainer = document.getElementsByClassName('forward-message-wrapper')[0];

    document.getElementsByClassName("forwarding-from-name")[0].textContent = userInfo.friendUsernames[userInfo.friends.indexOf(currentFriendId)];

    const users = userInfo.friendUsernames;
    for (let i = 0; i < users.length; i++) {
        const container = createForwardFriendElement(users[i], "Hey there I am using Interact.", userInfo.friends[i], userInfo.colors[i]);
        outerContainer.getElementsByClassName("forward-friends")[0].appendChild(container);
    }

    outerContainer.classList.remove('hide');
}


async function forwardMessage() {

    // user can only forward text messages, not files or photos(may be i implement it in future!)

    const activeChatContainer = document.getElementsByClassName("active-chat-container")[0];
    const messageText = activeChatContainer.getElementsByClassName('message-content-inner')[selectedMessageIndex].innerText;

    for (let friend of forwardFriends) {
        await DisplaySentMessage(friend, messageText, true);
    }
    discardForwarding();

}

function changeTheme(newTheme) {
    const currentThemeElement = document.getElementsByClassName("chosen-theme");
    if (currentThemeElement.length) {
        currentThemeElement[0].classList.remove("chosen-theme");
    }
    if (newTheme == "dark") {
        document.getElementsByClassName("theme-option")[0].classList.add("chosen-theme");
        document.getElementById('css-file').setAttribute('href', `../src/index-dark.css`)
        localStorage.setItem("theme", "dark");


    }
    else if (newTheme == 'light') {
        document.getElementsByClassName("theme-option")[1].classList.add("chosen-theme");
        document.getElementById('css-file').setAttribute('href', `../src/index-light.css`)
        localStorage.setItem("theme", "light");

    }
    else if (newTheme == 'system') {
        document.getElementsByClassName("theme-option")[2].classList.add("chosen-theme");
        const defaultTheme = systemPrefersDark ? 'dark' : 'light';
        document.getElementById('css-file').setAttribute('href', `../src/index-${defaultTheme}.css`)
        localStorage.setItem("theme", "system");
    }
}