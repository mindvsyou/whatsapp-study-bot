const questionService = require('../services/questionService');
const conversationManager = require('../services/conversationManager');

describe('WhatsApp Study Bot Tests', () => {
    beforeAll(async () => {
        // Initialize database for testing
        await questionService.initializeDatabase();
    });

    afterAll(() => {
        // Close database connection
        questionService.close();
    });

    test('should create a new conversation', () => {
        const phoneNumber = '+1234567890';
        const conversation = conversationManager.createConversation(phoneNumber);
        
        expect(conversation).toBeDefined();
        expect(conversation.phoneNumber).toBe(phoneNumber);
        expect(conversation.state).toBe('initial');
    });

    test('should get questions by topic', async () => {
        const mathQuestions = await questionService.getQuestionsByTopic('math', 5);
        
        expect(mathQuestions).toBeDefined();
        expect(Array.isArray(mathQuestions)).toBe(true);
        expect(mathQuestions.length).toBeGreaterThan(0);
        
        // Check question structure
        const question = mathQuestions[0];
        expect(question).toHaveProperty('question');
        expect(question).toHaveProperty('options');
        expect(question).toHaveProperty('correctAnswer');
        expect(question).toHaveProperty('explanation');
        expect(question.options).toHaveLength(4);
    });

    test('should get question count by topic', async () => {
        const mathCount = await questionService.getQuestionCount('math');
        const totalCount = await questionService.getQuestionCount();
        
        expect(mathCount).toBeGreaterThan(0);
        expect(totalCount).toBeGreaterThan(mathCount);
    });

    test('should update conversation state', () => {
        const phoneNumber = '+1234567890';
        conversationManager.createConversation(phoneNumber);
        
        const success = conversationManager.setState(phoneNumber, 'topic_selection');
        expect(success).toBe(true);
        
        const conversation = conversationManager.getConversation(phoneNumber);
        expect(conversation.state).toBe('topic_selection');
    });

    test('should get available topics', async () => {
        const topics = await questionService.getTopics();
        
        expect(topics).toBeDefined();
        expect(Array.isArray(topics)).toBe(true);
        expect(topics).toContain('math');
        expect(topics).toContain('science');
        expect(topics).toContain('english');
        expect(topics).toContain('history');
    });
});
