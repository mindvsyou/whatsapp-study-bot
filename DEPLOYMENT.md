# Deployment Guide

This guide will help you deploy your WhatsApp Study Bot to various cloud platforms.

## Prerequisites

- WhatsApp Business API access
- A cloud platform account (Heroku, Railway, DigitalOcean, etc.)
- Domain name (for webhook URL)

## Quick Setup

1. **Clone and setup locally**:
   ```bash
   git clone <your-repo-url>
   cd whatsapp-study-bot
   npm install
   npm run setup
   ```

2. **Test locally**:
   ```bash
   npm run dev
   ```

3. **Deploy to your chosen platform** (see sections below)

## Platform-Specific Deployment

### Heroku

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set WHATSAPP_ACCESS_TOKEN=your_token
   heroku config:set WHATSAPP_PHONE_NUMBER_ID=your_phone_id
   heroku config:set WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

5. **Get your webhook URL**:
   ```bash
   heroku info
   ```
   Your webhook URL will be: `https://your-app-name.herokuapp.com/webhook`

### Railway

1. **Connect GitHub repository** to Railway
2. **Set environment variables** in Railway dashboard:
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - `NODE_ENV=production`

3. **Deploy automatically** - Railway will build and deploy your app
4. **Get webhook URL** from Railway dashboard

### DigitalOcean App Platform

1. **Create new app** from GitHub repository
2. **Configure build settings**:
   - Build command: `npm install`
   - Run command: `npm start`
   - Source directory: `/`

3. **Set environment variables**:
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - `NODE_ENV=production`

4. **Deploy** and get your webhook URL

### Docker Deployment

1. **Build Docker image**:
   ```bash
   docker build -t whatsapp-study-bot .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Or run directly**:
   ```bash
   docker run -d \
     --name whatsapp-bot \
     -p 3000:3000 \
     -e WHATSAPP_ACCESS_TOKEN=your_token \
     -e WHATSAPP_PHONE_NUMBER_ID=your_phone_id \
     -e WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token \
     -e NODE_ENV=production \
     whatsapp-study-bot
   ```

## WhatsApp Business API Configuration

After deploying, configure your WhatsApp webhook:

1. **Go to Meta Developer Console**
2. **Navigate to your app** → WhatsApp → Configuration
3. **Set webhook URL**: `https://your-domain.com/webhook`
4. **Set verify token**: Same as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
5. **Subscribe to events**: `messages`
6. **Verify webhook** (should return 200 OK)

## Testing Your Deployment

1. **Check webhook verification**:
   ```bash
   curl "https://your-domain.com/webhook?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test"
   ```

2. **Send test message** to your WhatsApp Business number
3. **Check logs** for any errors

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `WHATSAPP_ACCESS_TOKEN` | Your WhatsApp Business API access token | `EAABwzLixnjYBO...` |
| `WHATSAPP_PHONE_NUMBER_ID` | Your WhatsApp Business phone number ID | `123456789012345` |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Token for webhook verification | `my_secure_verify_token` |
| `PORT` | Server port (usually set by platform) | `3000` |
| `NODE_ENV` | Environment | `production` |
| `DATABASE_PATH` | Path to SQLite database | `./database/questions.db` |

## Monitoring and Logs

### Heroku
```bash
heroku logs --tail
```

### Railway
Check logs in Railway dashboard

### DigitalOcean
```bash
doctl apps logs <app-id> --follow
```

### Docker
```bash
docker logs whatsapp-bot -f
```

## Troubleshooting

### Common Issues

1. **Webhook verification fails**:
   - Check that your webhook URL is accessible
   - Verify the verify token matches
   - Ensure HTTPS is enabled

2. **Messages not received**:
   - Check webhook subscription in Meta Console
   - Verify access token permissions
   - Check server logs for errors

3. **Database issues**:
   - Ensure database directory is writable
   - Check file permissions
   - Consider using persistent storage for production

### Health Checks

Most platforms support health checks. The app includes a basic health check endpoint:
```
GET /webhook?hub.mode=subscribe&hub.verify_token=health&hub.challenge=test
```

## Scaling Considerations

- **Database**: Consider PostgreSQL for production
- **Caching**: Add Redis for conversation state
- **Load Balancing**: Use multiple instances behind a load balancer
- **Monitoring**: Add application monitoring (e.g., New Relic, DataDog)

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **HTTPS**: Always use HTTPS in production
3. **Access Tokens**: Rotate tokens regularly
4. **Rate Limiting**: Implement rate limiting for webhook endpoint
5. **Input Validation**: Validate all incoming webhook data

## Backup and Recovery

1. **Database Backup**: Regular SQLite database backups
2. **Code Backup**: Use version control (Git)
3. **Configuration Backup**: Document all environment variables
4. **Disaster Recovery**: Have a rollback plan ready

## Cost Optimization

- **Free Tiers**: Use free tiers for development/testing
- **Resource Limits**: Monitor resource usage
- **Auto-scaling**: Configure auto-scaling based on demand
- **Database Optimization**: Optimize database queries and indexes
