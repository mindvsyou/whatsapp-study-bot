const axios = require('axios');

class WhatsAppService {
    constructor() {
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    }

    async sendMessage(phoneNumber, message) {
        try {
            let messageData;

            if (typeof message === 'string') {
                // Simple text message
                messageData = {
                    messaging_product: 'whatsapp',
                    to: phoneNumber,
                    type: 'text',
                    text: {
                        body: message
                    }
                };
            } else if (message.type === 'text') {
                // Text message with structured format
                messageData = {
                    messaging_product: 'whatsapp',
                    to: phoneNumber,
                    type: 'text',
                    text: {
                        body: message.text.body
                    }
                };
            } else if (message.type === 'interactive') {
                // Interactive message (buttons, lists, etc.)
                messageData = {
                    messaging_product: 'whatsapp',
                    to: phoneNumber,
                    type: 'interactive',
                    interactive: message.interactive
                };
            } else {
                throw new Error('Unsupported message type');
            }

            const response = await axios.post(this.apiUrl, messageData, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Message sent successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error sending WhatsApp message:', error.response?.data || error.message);
            throw error;
        }
    }

    async sendTextMessage(phoneNumber, text) {
        return await this.sendMessage(phoneNumber, {
            type: 'text',
            text: {
                body: text
            }
        });
    }

    async sendInteractiveMessage(phoneNumber, interactiveData) {
        return await this.sendMessage(phoneNumber, {
            type: 'interactive',
            interactive: interactiveData
        });
    }

    async sendButtonMessage(phoneNumber, bodyText, buttons) {
        const interactiveData = {
            type: 'button',
            body: {
                text: bodyText
            },
            action: {
                buttons: buttons
            }
        };

        return await this.sendInteractiveMessage(phoneNumber, interactiveData);
    }

    async sendListMessage(phoneNumber, bodyText, buttonText, sections) {
        const interactiveData = {
            type: 'list',
            body: {
                text: bodyText
            },
            action: {
                button: buttonText,
                sections: sections
            }
        };

        return await this.sendInteractiveMessage(phoneNumber, interactiveData);
    }

    // Method to mark message as read
    async markAsRead(messageId) {
        try {
            const messageData = {
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId
            };

            const response = await axios.post(this.apiUrl, messageData, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error marking message as read:', error.response?.data || error.message);
            throw error;
        }
    }

    // Method to send typing indicator
    async sendTypingIndicator(phoneNumber) {
        try {
            const messageData = {
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'text',
                text: {
                    body: ''
                }
            };

            // Note: WhatsApp doesn't have a direct typing indicator API
            // This is a placeholder for future implementation
            console.log(`Typing indicator for ${phoneNumber}`);
        } catch (error) {
            console.error('Error sending typing indicator:', error);
        }
    }
}

module.exports = new WhatsAppService();
