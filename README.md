# Community Mangrove Watch

A community-based platform for monitoring and reporting mangrove ecosystem issues. This application helps connect citizens, researchers, NGOs, and government agencies to protect valuable mangrove habitats.

## Features

- **Reports System:** Submit and track reports of mangrove ecosystem issues
- **Dashboard:** Visualize data and analytics on mangrove health and threats
- **Community Portal:** Connect with other mangrove conservationists
- **Gamification:** Earn rewards and recognition for active participation
- **Profile Management:** Manage your personal profile and track contributions

## Tech Stack

- **Frontend:** React.js with TailwindCSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT-based authentication

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/meetjaka/Hackout_Community-Mangrove-Watch.git
   cd Hackout_Community-Mangrove-Watch
   ```

2. Install backend dependencies
   ```
   cd Backend
   npm install
   ```

3. Install frontend dependencies
   ```
   cd ../Frontend
   npm install
   ```

4. Create a `.env` file in the Backend directory with the following variables:
   ```
   PORT=5002
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. Start the backend server
   ```
   npm start
   ```

6. Start the frontend development server
   ```
   cd ../Frontend
   npm run dev
   ```

7. Access the application at `http://localhost:5173`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Special thanks to everyone who contributed to the Hackout project
- Inspired by the need for better community involvement in mangrove conservation