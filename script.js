document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const emojiButton = document.getElementById('emoji-button');
    const voiceButton = document.getElementById('voice-button');
    const typingAnimation = document.getElementById('typing-animation');
    const voiceVisualizer = document.getElementById('voice-visualizer');

    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];

    // Initialize EmojiButton
    const picker = new EmojiButton();
    picker.on('emoji', emoji => {
        userInput.value += emoji;
    });

    emojiButton.addEventListener('click', () => {
        picker.togglePicker(emojiButton);
    });

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user' : 'ai');

        const avatar = document.createElement('img');
        avatar.src = isUser ? 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=30' : 'https://cdn.pixabay.com/photo/2021/02/27/16/25/woman-6055084_1280.jpg';
        avatar.alt = isUser ? 'User Avatar' : 'AI Avatar';
        avatar.classList.add('message-avatar');

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = content;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Translate text to English using Google Translate API
    async function translateToEnglish(text) {
        const apiKey = 'AIzaSyAEv94v3_i2ltYglHwiq02x5C6WkEaBOPA'; // Replace with your actual Google Translate API Key 
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                q: text,
                target: 'en'  // Force the translation to English
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return data.data.translations[0].translatedText;
    }

    // Handle special cases (Apple customer service and Thato information)
    function handleSpecialCases(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('unlockappleid>/<') || lowerMessage.includes('stoleniphone') || lowerMessage.includes('resetiphone')) {
            return "I see you need help to unlock an iPhone but you don't have Apple ID and email address, cyana.ai will help you accessing unlock your Apple device, before we start please be warned: this is sensitive data, misuse of this data carries significant legal liability. To continue, provide your **cyanide developer Key**. If you don’t have one, click on my profile picture at the top to purchase it. then put a simcard on your iPhone and send us your phone number +27 xxx xxx xxx.";
        }

        if (lowerMessage.includes('who is thato')) {
            return "Thato is an entrepreneur based in Midrand. That's my G!";
        }

        return null;
    }

    // Send user message to the chatbot and handle translation of the response
    async function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true); // Add user message to chat
            userInput.value = ''; // Clear user input

            // Check if the message matches a special case
            const specialResponse = handleSpecialCases(message);
            if (specialResponse) {
                addMessage(specialResponse);
                return; // Stop further processing if a special case is matched
            }

            // Step 1: Translate the user input to English if needed
            const translatedMessage = await translateToEnglish(message);

            try {
                // Step 2: Send translated message to chatbot API
                const response = await fetch(`https://acawapi.vercel.app/v2/acaw?q=${encodeURIComponent(translatedMessage)}`);
                const data = await response.json();

                if (data.status === 200) {
                    // Step 3: Translate chatbot's response back to English if it's not already
                    const aiResponse = data.data.result;  // Chatbot's response (in another language, e.g., Indonesian)

                    // If needed, translate the response to English
                    const translatedResponse = await translateToEnglish(aiResponse);

                    // Step 4: Add the translated response to the chat
                    addMessage(translatedResponse);
                } else {
                    addMessage('Sorry, I encountered an error while processing your request.');
                }
            } catch (error) {
                console.error('Error:', error);
                addMessage('Sorry, I encountered an error while processing your request.');
            }
        }
    }

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    voiceButton.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    function animateTyping() {
        const text = "Type your message here";  // Changed to English
        typingAnimation.innerHTML = text.split('').map(char => `<span>${char}</span>`).join('');
        
        const spans = typingAnimation.querySelectorAll('span');
        spans.forEach((span, index) => {
            setTimeout(() => {
                span.style.opacity = 1;
                span.style.transform = 'translateY(0)';
            }, index * 50);
        });

        setTimeout(() => {
            spans.forEach((span, index) => {
                setTimeout(() => {
                    span.style.opacity = 0;
                    span.style.transform = 'translateY(20px)';
                }, index * 50);
            });
        }, text.length * 50 + 1000);
    }

    userInput.addEventListener('focus', () => {
        typingAnimation.style.display = 'none';
    });

    userInput.addEventListener('blur', () => {
        if (!userInput.value) {
            typingAnimation.style.display = 'flex';
            animateTyping();
        }
    });

    // Initial typing animation
    animateTyping();
    setInterval(animateTyping, (text.length * 50 + 1000) * 2);

    // Initial greeting message
    addMessage("Hi! How can I help you? 😄");
});
