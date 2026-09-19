// ==========================================
// UP YATRA AI TOURISM CHATBOT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const toggleBtn = document.getElementById("chatbotToggle");
    const closeBtn = document.getElementById("chatbotClose");
    const chatbotBox = document.getElementById("chatbotBox");
    const chatInput = document.getElementById("chatInput");
    const chatSend = document.getElementById("chatSend");
    const chatMessages = document.getElementById("chatMessages");

    // Check elements
    if (
        !toggleBtn ||
        !chatbotBox ||
        !chatInput ||
        !chatSend ||
        !chatMessages
    ) {
        console.error("Chatbot elements not found.");
        return;
    }


    // ==========================================
    // OPEN CHATBOT
    // ==========================================

    toggleBtn.addEventListener("click", function () {

        chatbotBox.classList.toggle("hidden");

        if (!chatbotBox.classList.contains("hidden")) {
            chatInput.focus();
        }

    });


    // ==========================================
    // CLOSE CHATBOT
    // ==========================================

    if (closeBtn) {

        closeBtn.addEventListener("click", function () {

            chatbotBox.classList.add("hidden");

        });

    }


    // ==========================================
    // ADD MESSAGE
    // ==========================================

    function addMessage(message, type) {

        const messageWrapper = document.createElement("div");

        messageWrapper.className =
            "chat-message " + type;


        const bubble = document.createElement("div");

        bubble.className = "message-bubble";


        // Allow simple HTML formatting
        bubble.innerHTML = message;


        messageWrapper.appendChild(bubble);

        chatMessages.appendChild(messageWrapper);


        // Scroll to latest message

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    async function sendMessage() {

        const message =
            chatInput.value.trim();


        // Empty message
        if (!message) {
            return;
        }


        // Show user's message

        addMessage(
            escapeHTML(message),
            "user"
        );


        // Clear input

        chatInput.value = "";


        // Disable button while loading

        chatSend.disabled = true;


        // Loading message

        addMessage(
            "⏳ Thinking...",
            "bot"
        );


        const loadingMessage =
            chatMessages.lastElementChild;


        try {

            const response = await fetch(
                "/api/chatbot",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })
                }
            );


            // Check HTTP response

            if (!response.ok) {

                throw new Error(
                    "Server returned " +
                    response.status
                );

            }


            const data =
                await response.json();


            // Remove loading message

            if (loadingMessage) {
                loadingMessage.remove();
            }


            // Bot response

            if (data.reply) {

                addMessage(
                    data.reply,
                    "bot"
                );

            } else {

                addMessage(
                    "Sorry, mujhe samajh nahi aaya. Please dobara try karo.",
                    "bot"
                );

            }


        } catch (error) {

            console.error(
                "Chatbot Error:",
                error
            );


            // Remove loading

            if (loadingMessage) {
                loadingMessage.remove();
            }


            addMessage(
                "⚠️ Chatbot server se connect nahi ho pa raha. Please check karo ki Flask server running hai.",
                "bot"
            );

        }


        // Enable button

        chatSend.disabled = false;


        // Focus input

        chatInput.focus();

    }


    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }


    // ==========================================
    // SEND BUTTON
    // ==========================================

    chatSend.addEventListener(
        "click",
        sendMessage
    );


    // ==========================================
    // ENTER KEY
    // ==========================================

    chatInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();

            }

        }
    );

});