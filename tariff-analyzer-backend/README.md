# Tariff Analyzer

A web application that analyzes tariff news to extract key information and provide sentiment analysis for affected sectors. This tool helps financial analysts quickly process tariff-related news and prioritize their research.

## Features

### MVP Version
- Paste news text for instant AI-powered analysis
- Get structured summaries of tariff actions, countries involved, and affected industries
- View sentiment outlook analysis for affected sectors
- Save and view history of past analyses

### Enhanced Version
- Browse recent tariff news automatically fetched from News API
- Select articles for analysis with a single click
- View original articles in their source publications
- All features from the MVP version included

## Tech Stack

### Backend
- Node.js & Express
- MongoDB Atlas (database)
- Auth0 (authentication)
- Google Gemini AI API (text analysis)
- News API (enhanced version)

### Frontend
- React
- React Router (navigation)
- Auth0 React SDK (authentication)
- React Markdown (rendering analysis)
- Tailwind CSS (styling)

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- MongoDB Atlas account
- Auth0 account
- Google Gemini API key
- News API key (for enhanced version)

### Installation

#### Backend Setup
1. Clone the repository
   ```
   git clone https://github.com/yourusername/tariff-analyzer.git
   cd tariff-analyzer/backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   AUTH0_AUDIENCE=your_auth0_api_identifier
   AUTH0_ISSUER=https://your-auth0-domain.auth0.com/
   GEMINI_API_KEY=your_gemini_api_key
   NEWS_API_KEY=your_news_api_key  # For enhanced version
   ```

4. Start the backend server
   ```
   npm run dev
   ```

#### Frontend Setup
1. Navigate to the frontend directory
   ```
   cd ../frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   REACT_APP_AUTH0_DOMAIN=your_auth0_domain.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=your_auth0_client_id
   REACT_APP_AUTH0_AUDIENCE=your_auth0_api_identifier
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the frontend development server
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

### Text Analysis (MVP)
1. Log in to the application
2. Navigate to "Paste Analysis"
3. Enter a title (optional) and paste the news text
4. Click "Analyze Tariff News"
5. View the structured analysis of tariff details and sentiment outlook

### News Browse (Enhanced Version)
1. Log in to the application
2. Navigate to "Tariff News"
3. Browse through recent tariff-related news articles 
4. Click on an article to select it
5. Click "Analyze Selected Article" to generate an analysis
6. View the results in the same format as the text analysis

## Project Structure

```
tariff-analyzer/
│
├── backend/                      # Backend Node.js application
│   ├── models/                   # MongoDB schemas
│   ├── routes/                   # API routes
│   ├── middleware/               # Custom middleware
│   ├── services/                 # Service layer
│   ├── server.js                 # Main server file
│   └── package.json              # Backend dependencies
│
└── frontend/                     # Frontend React application
    ├── public/                   # Static files
    ├── src/                      # Source code
    │   ├── components/           # Reusable React components
    │   ├── pages/                # Page components
    │   ├── utils/                # Utility functions
    │   ├── App.js                # Main App component
    │   └── index.js              # Entry point
    └── package.json              # Frontend dependencies
```

## Disclaimer

This tool provides AI-generated analysis based on provided text. It is NOT financial advice. Users should verify information and consult qualified professionals for investment decisions.

## License

[MIT License](LICENSE)

## Acknowledgments

- This project was created as a weekend hackathon project
- Uses Google's Gemini AI for natural language processing
