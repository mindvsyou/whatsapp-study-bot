const { v4: uuidv4 } = require('uuid');

class ConversationManager {
    constructor() {
        this.conversations = new Map();
    }

    createConversation(phoneNumber) {
        const conversation = {
            id: uuidv4(),
            phoneNumber: phoneNumber,
            state: 'initial',
            selectedTopic: null,
            currentQuestionIndex: 0,
            score: 0,
            startTime: new Date(),
            lastActivity: new Date(),
            data: {}
        };

        this.conversations.set(phoneNumber, conversation);
        console.log(`Created new conversation for ${phoneNumber}`);
        return conversation;
    }

    getConversation(phoneNumber) {
        return this.conversations.get(phoneNumber);
    }

    updateConversation(phoneNumber, conversation) {
        conversation.lastActivity = new Date();
        this.conversations.set(phoneNumber, conversation);
    }

    deleteConversation(phoneNumber) {
        const deleted = this.conversations.delete(phoneNumber);
        if (deleted) {
            console.log(`Deleted conversation for ${phoneNumber}`);
        }
        return deleted;
    }

    // Get all conversations (for debugging/admin purposes)
    getAllConversations() {
        return Array.from(this.conversations.values());
    }

    // Clean up old conversations (older than 24 hours)
    cleanupOldConversations() {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        for (const [phoneNumber, conversation] of this.conversations.entries()) {
            if (conversation.lastActivity < twentyFourHoursAgo) {
                this.conversations.delete(phoneNumber);
                console.log(`Cleaned up old conversation for ${phoneNumber}`);
            }
        }
    }

    // Reset conversation to initial state
    resetConversation(phoneNumber) {
        const conversation = this.getConversation(phoneNumber);
        if (conversation) {
            conversation.state = 'initial';
            conversation.selectedTopic = null;
            conversation.currentQuestionIndex = 0;
            conversation.score = 0;
            conversation.data = {};
            conversation.lastActivity = new Date();
            
            this.updateConversation(phoneNumber, conversation);
            return conversation;
        }
        return null;
    }

    // Set conversation state
    setState(phoneNumber, state) {
        const conversation = this.getConversation(phoneNumber);
        if (conversation) {
            conversation.state = state;
            conversation.lastActivity = new Date();
            this.updateConversation(phoneNumber, conversation);
            return true;
        }
        return false;
    }

    // Set conversation data
    setData(phoneNumber, key, value) {
        const conversation = this.getConversation(phoneNumber);
        if (conversation) {
            conversation.data[key] = value;
            conversation.lastActivity = new Date();
            this.updateConversation(phoneNumber, conversation);
            return true;
        }
        return false;
    }

    // Get conversation data
    getData(phoneNumber, key) {
        const conversation = this.getConversation(phoneNumber);
        return conversation ? conversation.data[key] : null;
    }

    // Get conversation statistics
    getStats() {
        const conversations = this.getAllConversations();
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const activeLastHour = conversations.filter(c => c.lastActivity > oneHourAgo).length;
        const activeLastDay = conversations.filter(c => c.lastActivity > oneDayAgo).length;

        return {
            total: conversations.length,
            activeLastHour,
            activeLastDay,
            topics: this.getTopicDistribution(conversations)
        };
    }

    // Get topic distribution
    getTopicDistribution(conversations) {
        const topicCount = {};
        conversations.forEach(conversation => {
            if (conversation.selectedTopic) {
                topicCount[conversation.selectedTopic] = (topicCount[conversation.selectedTopic] || 0) + 1;
            }
        });
        return topicCount;
    }
}

module.exports = new ConversationManager();
