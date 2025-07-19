# MediWallet - AI Chat Application for Health Concerns

MediWallet is an AI-powered chat application that allows users to log in, upload their medical documents, and chat with a bot about their health concerns. The backend is powered by **FastAPI**, and the frontend uses **Expo React Native** for a seamless mobile experience.

## Technologies
- **Backend**: FastAPI (Python)
- **Frontend**: Expo React Native (JavaScript)
- **Containerization**: Docker & Docker Compose
- **AI**: Custom-trained health AI bot

## Setup and Installation

1. **Clone the repository**:
   git clone https://github.com/HolboxAI/SparkStorm_Application
   cd SparkStorm_Application

2. Install Docker:
Make sure Docker and Docker Compose are installed. Follow the instructions to install them:

[Docker](https://www.docker.com/products/docker-desktop)

[Docker Compose](https://docs.docker.com/compose/install/)

3. Build and run the containers:
docker-compose up --build

4. Access the app:

Backend (FastAPI): http://localhost:8000

Frontend (Expo): http://localhost:8081

mediwallet/
├── Backend/              # FastAPI backend source code
├── Frontend/             # Expo React Native source code
├── docker-compose.yml    # Docker Compose configuration
├── README.md             # Project documentation
└── .gitignore            # Git ignore file

5. Features
Login: Secure user authentication.

Document Upload: Users can upload medical files for AI analysis.

Chatbot: AI-powered health chatbot for discussing health concerns.

6. Docker Configuration
Backend: Built using node:18-alpine, exposing port 8000 for the FastAPI app.

Frontend: Built using node:18-alpine and Expo, exposing ports for development tools and the Metro bundler (19000, 19001, 19002, 8081).


