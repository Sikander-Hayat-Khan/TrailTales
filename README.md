# TrailTales

TrailTales is a full-stack web application designed to help users document, share, and explore memorable journeys and experiences. The platform features user authentication, memory sharing, friend requests, chat, notifications, and an interactive map/calendar view.

## Screenshots

<img width="1811" height="913" alt="image" src="https://github.com/user-attachments/assets/6a04d31a-8eb5-43c1-8ffd-5435c6e5e496" />
<img width="1809" height="898" alt="image" src="https://github.com/user-attachments/assets/4a0456dd-34c3-478e-a45a-e03a5d9b2221" />


## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Overview](#api-overview)
- [Contributing](#contributing)
- [License](#license)

## Features
- User authentication (signup/login)
- Create, view, and delete memories (with images)
- Friend requests and management
- Real-time chat between friends
- Notifications for friend requests, messages, and memory events
- Interactive map and calendar views for memories
- Profile management

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Axios, CSS
- **Backend:** Node.js, Express, TypeScript, MongoDB
- **Other:** Cloudinary (image uploads), JWT (auth), Socket.io (real-time chat)

## Project Structure
```
TrailTales/
├── Backend/
│   ├── app.ts
│   ├── package.json
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── db/
│   ├── utils/
│   └── ...
├── Frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
└── TrailTales User Manual.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)
- Cloudinary account (for image uploads)

### Backend Setup
1. Navigate to the Backend folder:
   ```sh
   cd Backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file (see [Environment Variables](#environment-variables))
4. Start the backend server:
   ```sh
   npm run dev
   ```

### Frontend Setup
1. Navigate to the Frontend folder:
   ```sh
   cd Frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm run dev
   ```

## Environment Variables
Create a `.env` file in the `Backend/` directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Scripts
### Backend
- `npm run dev` — Start backend in development mode
- `npm run build` — Build backend TypeScript
- `npm start` — Start backend from build output

### Frontend
- `npm run dev` — Start frontend in development mode
- `npm run build` — Build frontend for production
- `npm run preview` — Preview production build

## API Overview
The backend exposes RESTful endpoints for authentication, memory management, friends, chat, and notifications. See the `routes/` and `controllers/` folders in `Backend/` for details.

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License.
# TrailTales

Welcome to TrailTales, your digital companion for documenting life’s journey. TrailTales allows you to pin your memories to a map, organize them by date, and share your adventures with friends.

## Features

- **Account Management:** Sign up, log in, and personalize your profile with an avatar color.
- **Friend System:** Search for users, send/accept/reject friend requests, and manage your friend list.
- **Journaling & Mapping:** Create memories with titles, descriptions, dates, media, and privacy settings. Pin them on a map or view them in a calendar.
- **Chat:** Real-time messaging with friends.
- **Notifications:** Receive toast notifications for friend requests, uploads, and errors.
- **Privacy:** Control who can see your memories. Private memories are encrypted and visible only to you.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sikander-Hayat-Khan/TrailTales.git
   ```
2. **Install dependencies:**
   - For Backend:
     ```bash
     cd Backend
     npm install
     ```
   - For Frontend:
     ```bash
     cd ../Frontend
     npm install
     ```
3. **Run the application:**
   - Start the backend server:
     ```bash
     npm run dev
     ```
   - Start the frontend (in a new terminal):
     ```bash
     npm run dev
     ```

## Usage

- **Sign Up:** Create an account and choose your avatar color.
- **Add Friends:** Search for users and send friend requests.
- **Create Memories:** Pin memories on the map or add them via the dashboard. Attach photos/videos and set privacy.
- **Chat:** Select a friend to start chatting.
- **View Notifications:** Stay updated with real-time notifications.

## Troubleshooting

- **Friend Request Issues:** Ensure you haven’t already sent a request or are already friends.
- **Map Location Issues:** Grant location permissions to your browser.
- **Deleting Memories:** Open a memory and click the trash icon to delete.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, open an issue on GitHub or contact the repository owner.
