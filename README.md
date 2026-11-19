
# LinkIndexer

A personal bulk URL indexing dashboard powered by the IndexMyLink API.

## Features

- Bulk URL submission
- Automatic batches of 100 URLs
- Duplicate URL removal
- Live account information
- Local browser submission history
- Responsive dashboard
- Server-side API key storage
- HTTP Basic Authentication

## Requirements

- Node.js 20.9 or newer
- npm
- IndexMyLink API key

## Installation

Clone your repository:

    git clone https://github.com/YOUR_USERNAME/link-indexer.git

Enter the project directory:

    cd link-indexer

Install dependencies:

    npm install

Create your environment file:

    cp .env.example .env.local

Edit .env.local:

    INDEXMYLINK_API_KEY=your_api_key
    BASIC_AUTH_USER=admin
    BASIC_AUTH_PASSWORD=your_strong_password

Start the application:

    npm run dev

Open:

    http://localhost:3000

## Production build

    npm run build
    npm start

## API endpoints

POST /api/index

Submit URLs:

    {
      "urls": [
        "https://example.com/page1",
        "https://example.com/page2"
      ]
    }

GET /api/account

Retrieve IndexMyLink account information.

Both endpoints require website authentication.

## GitHub deployment

1. Create a GitHub repository.
2. Upload all project files.
3. Do not upload .env.local.
4. Import the repository into Vercel.
5. Add the three environment variables in Vercel.
6. Deploy the application.

## Security

- Never commit API keys.
- Use a strong Basic Auth password.
- Keep the repository private if desired.
- Use HTTPS in production.
- Do not share your deployed dashboard credentials.

## History

Submission history is stored in browser localStorage.
It is not synchronized between devices and can be
deleted when browser storage is cleared.

## Disclaimer

This project is an independent personal interface
for the IndexMyLink API. It does not guarantee that
submitted URLs will be indexed by search engines.
