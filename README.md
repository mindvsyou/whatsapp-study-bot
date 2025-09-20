# WhatsApp Study Bot

A WhatsApp chatbot that helps students practice questions on various topics including Mathematics, Science, English, and History.

## Features

- **Topic Selection**: Choose from Mathematics, Science, English, and History
- **Interactive Questions**: Multiple choice questions with immediate feedback
- **Score Tracking**: Keep track of your performance
- **Explanations**: Detailed explanations for each answer
- **Conversation Management**: Maintains conversation state for each user

## Prerequisites

- Node.js (v14 or higher)
- WhatsApp Business API access
- A webhook URL (for production deployment)

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your WhatsApp Business API credentials:
   ```
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
   PORT=3000
   NODE_ENV=development
   DATABASE_PATH=./database/questions.db
   ```

## WhatsApp Business API Setup

1. **Create a Meta Developer Account**:
   - Go to [developers.facebook.com](https://developers.facebook.com)
   - Create a new app and select "Business" type

2. **Set up WhatsApp Business API**:
   - Add WhatsApp product to your app
   - Get your Phone Number ID and Access Token
   - Set up a webhook URL pointing to your server

3. **Configure Webhook**:
   - Webhook URL: `https://yourdomain.com/webhook`
   - Verify Token: Use the same token from your `.env` file
   - Subscribe to `messages` events

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## Usage

1. Send any message to your WhatsApp Business number
2. The bot will respond with topic selection buttons
3. Choose a topic (Mathematics, Science, English, or History)
4. Answer the practice questions
5. Get immediate feedback and explanations
6. Type 'menu' to choose another topic or 'restart' to start over

## API Endpoints

- `GET /webhook` - Webhook verification endpoint
- `POST /webhook` - Receives incoming WhatsApp messages

## Database

The application uses SQLite database to store questions. The database is automatically created and seeded with sample questions when the server starts.

### Question Structure
- Topic (math, science, english, history)
- Question text
- Four multiple choice options (A, B, C, D)
- Correct answer
- Explanation
- Difficulty level (easy, medium, hard)

## Adding New Questions

You can add new questions by:

1. **Using the database directly**:
   ```sql
   INSERT INTO questions (topic, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
   VALUES ('math', 'Your question here?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'Explanation here', 'medium');
   ```

2. **Programmatically** (extend the questionService):
   ```javascript
   await questionService.addQuestion({
       topic: 'math',
       question: 'Your question here?',
       option_a: 'Option A',
       option_b: 'Option B',
       option_c: 'Option C',
       option_d: 'Option D',
       correct_answer: 'A',
       explanation: 'Explanation here',
       difficulty: 'medium'
   });
   ```

## Deployment

### Using Heroku

1. Create a Heroku app:
   ```bash
   heroku create your-app-name
   ```

2. Set environment variables:
   ```bash
   heroku config:set WHATSAPP_ACCESS_TOKEN=your_token
   heroku config:set WHATSAPP_PHONE_NUMBER_ID=your_phone_id
   heroku config:set WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

### Using Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Using DigitalOcean App Platform

1. Create a new app from GitHub repository
2. Set environment variables
3. Deploy

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WHATSAPP_ACCESS_TOKEN` | Your WhatsApp Business API access token | Yes |
| `WHATSAPP_PHONE_NUMBER_ID` | Your WhatsApp Business phone number ID | Yes |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Token for webhook verification | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `DATABASE_PATH` | Path to SQLite database file | No |

## Troubleshooting

### Common Issues

1. **Webhook verification fails**:
   - Check that your `WHATSAPP_WEBHOOK_VERIFY_TOKEN` matches the one in Meta Developer Console
   - Ensure your server is accessible from the internet

2. **Messages not being received**:
   - Verify your webhook URL is correct and accessible
   - Check that you've subscribed to the correct events in Meta Developer Console
   - Ensure your access token is valid and has the necessary permissions

3. **Database errors**:
   - Make sure the database directory exists and is writable
   - Check file permissions

### Logs

The application logs important events to the console. In production, consider using a logging service like Winston or similar.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review WhatsApp Business API documentation
3. Create an issue in this repository

## Roadmap

- [ ] Add more question topics
- [ ] Implement difficulty-based question selection
- [ ] Add user progress tracking
- [ ] Implement leaderboards
- [ ] Add image support for questions
- [ ] Multi-language support
- [ ] Admin panel for question management
