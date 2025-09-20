const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const whatsappService = require('./services/whatsappService');
const conversationManager = require('./services/conversationManager');
const questionService = require('./services/questionService');

const app = express();
const PORT = process.env.PORT || 3000;

// Add error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'WhatsApp Study Bot is running',
        timestamp: new Date().toISOString()
    });
});

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
    console.log('Webhook GET request received:', req.query);
    
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('Mode:', mode, 'Token:', token, 'Challenge:', challenge);
    console.log('Expected token:', process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN);

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
            console.log('Webhook verified successfully');
            res.status(200).send(challenge);
        } else {
            console.log('Webhook verification failed - token mismatch');
            res.status(403).send('Forbidden');
        }
    } else {
        console.log('Webhook verification failed - missing parameters');
        res.status(400).send('Bad Request');
    }
});

// Webhook endpoint for receiving messages
app.post('/webhook', async (req, res) => {
    try {
        console.log('POST /webhook received:', JSON.stringify(req.body, null, 2));
        const body = req.body;
        
        if (body.object === 'whatsapp_business_account') {
            console.log('WhatsApp Business Account webhook received');
            body.entry.forEach(async (entry) => {
                const webhookEvent = entry.changes[0];
                const { value } = webhookEvent;
                
                if (value.messages) {
                    console.log('Message received:', value.messages);
                    const message = value.messages[0];
                    const phoneNumber = message.from;
                    const messageText = message.text?.body || '';
                    console.log('Processing message from:', phoneNumber, 'Text:', messageText);
                    
                    console.log(`Received message from ${phoneNumber}: ${messageText}`);
                    
                    // Process the message
                    await handleMessage(phoneNumber, messageText);
                }
            });
        }
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle incoming messages
async function handleMessage(phoneNumber, messageText) {
    try {
        // Get or create conversation state
        let conversation = conversationManager.getConversation(phoneNumber);
        
        if (!conversation) {
            conversation = conversationManager.createConversation(phoneNumber);
        }
        
        // Process the message based on current state
        const response = await processMessage(conversation, messageText);
        
        // Send response back to user
        await whatsappService.sendMessage(phoneNumber, response);
        
        // Update conversation state
        conversationManager.updateConversation(phoneNumber, conversation);
        
    } catch (error) {
        console.error('Error handling message:', error);
        await whatsappService.sendMessage(phoneNumber, 'Sorry, I encountered an error. Please try again.');
    }
}

// Process message based on conversation state
async function processMessage(conversation, messageText) {
    const state = conversation.state;
    const message = messageText.toLowerCase().trim();
    
    switch (state) {
        case 'initial':
            return getWelcomeMessage();
            
        case 'topic_selection':
            return await handleTopicSelection(conversation, message);
            
        case 'question_mode':
            return await handleQuestionResponse(conversation, message);
            
        case 'menu':
            return await handleMenuSelection(conversation, message);
            
        default:
            return getWelcomeMessage();
    }
}

// Get welcome message with topic options
function getWelcomeMessage() {
    return {
        type: 'interactive',
        interactive: {
            type: 'button',
            body: {
                text: "🎓 Welcome to StudyBot! I'm here to help you practice with questions on various topics. Choose a subject to get started:"
            },
            action: {
                buttons: [
                    {
                        type: 'reply',
                        reply: {
                            id: 'math',
                            title: 'Mathematics'
                        }
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'science',
                            title: 'Science'
                        }
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'english',
                            title: 'English'
                        }
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'history',
                            title: 'History'
                        }
                    }
                ]
            }
        }
    };
}

// Handle topic selection
async function handleTopicSelection(conversation, message) {
    const topics = ['math', 'science', 'english', 'history'];
    
    if (topics.includes(message)) {
        conversation.selectedTopic = message;
        conversation.state = 'question_mode';
        conversation.currentQuestionIndex = 0;
        conversation.score = 0;
        
        const question = await questionService.getQuestion(message, 0);
        return {
            type: 'text',
            text: {
                body: `Great choice! Let's start with ${message.toUpperCase()} questions.\n\n${question.question}\n\nA) ${question.options[0]}\nB) ${question.options[1]}\nC) ${question.options[2]}\nD) ${question.options[3]}\n\nReply with A, B, C, or D`
            }
        };
    } else {
        return {
            type: 'text',
            text: {
                body: "Please select a valid topic by clicking one of the buttons above."
            }
        };
    }
}

// Handle question responses
async function handleQuestionResponse(conversation, message) {
    const validAnswers = ['a', 'b', 'c', 'd'];
    const answer = message.toLowerCase();
    
    if (!validAnswers.includes(answer)) {
        return {
            type: 'text',
            text: {
                body: "Please reply with A, B, C, or D to answer the question."
            }
        };
    }
    
    const currentQuestion = await questionService.getQuestion(conversation.selectedTopic, conversation.currentQuestionIndex);
    const isCorrect = answer === currentQuestion.correctAnswer.toLowerCase();
    
    if (isCorrect) {
        conversation.score++;
    }
    
    let responseText = isCorrect ? "✅ Correct!" : `❌ Incorrect. The correct answer is ${currentQuestion.correctAnswer.toUpperCase()}.`;
    responseText += `\n\nExplanation: ${currentQuestion.explanation}`;
    
    conversation.currentQuestionIndex++;
    
    // Check if there are more questions
    const nextQuestion = await questionService.getQuestion(conversation.selectedTopic, conversation.currentQuestionIndex);
    
    if (nextQuestion) {
        responseText += `\n\n--- Next Question ---\n\n${nextQuestion.question}\n\nA) ${nextQuestion.options[0]}\nB) ${nextQuestion.options[1]}\nC) ${nextQuestion.options[2]}\nD) ${nextQuestion.options[3]}\n\nReply with A, B, C, or D`;
    } else {
        // End of questions
        responseText += `\n\n🎉 Quiz Complete!\nYour score: ${conversation.score}/${conversation.currentQuestionIndex}\n\nType 'menu' to choose another topic or 'restart' to start over.`;
        conversation.state = 'menu';
    }
    
    return {
        type: 'text',
        text: {
            body: responseText
        }
    };
}

// Handle menu selections
async function handleMenuSelection(conversation, message) {
    if (message === 'menu') {
        conversation.state = 'topic_selection';
        return getWelcomeMessage();
    } else if (message === 'restart') {
        conversation.state = 'topic_selection';
        conversation.selectedTopic = null;
        conversation.currentQuestionIndex = 0;
        conversation.score = 0;
        return getWelcomeMessage();
    } else {
        return {
            type: 'text',
            text: {
                body: "Type 'menu' to choose another topic or 'restart' to start over."
            }
        };
    }
}

// Initialize database and start server
async function startServer() {
    try {
        await questionService.initializeDatabase();
        console.log('Database initialized successfully');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`WhatsApp Study Bot server is running on port ${PORT}`);
            console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
            console.log('Server is ready to receive requests');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
