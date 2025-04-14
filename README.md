FIN_track
A personal finance tracking application with transaction management and visualization capabilities.

Features
Track income and expenses with detailed categorization
Visual dashboard with spending patterns and trends
Monthly spending charts and expense breakdown
Transaction history and management
Reports with financial insights
User settings and preferences
Technology Stack
Frontend: React with Tailwind CSS and shadcn UI components
Backend: Express.js
Database: MongoDB
Charts: Recharts for data visualization
Prerequisites
Node.js (version 16 or higher)
npm (comes with Node.js)
MongoDB Atlas account (or local MongoDB installation)
Setup Instructions
1. Clone the Repository
git clone https://github.com/Amritsaha0/FIN_track.git
cd FIN_track
2. Install Dependencies
npm install
3. Environment Configuration
Create a .env file in the root directory with the following:

MONGODB_URI=mongodb+srv://sahaamrit024:DfbMDSSPvIudCmRp@cluster0.s4oj0.mongodb.net/fin_project
This is the MongoDB connection string already set up for this project. If you want to use your own MongoDB database:

Create a MongoDB Atlas account at mongodb.com
Set up a new cluster
Create a database user with read/write privileges
Get your connection string and replace the one above with your own
Running the Application
Development Mode
npm run dev
This starts the application in development mode with hot-reloading.

Production Build
To create a production build:

npm run build
This compiles the application and creates optimized assets in the dist directory.

Running in Production Mode
Using Convenience Scripts (Recommended)
We've included starter scripts to make running in production mode easier:

On Windows:

start-prod.bat
On macOS/Linux:

chmod +x start-prod.sh  # Make executable (first time only)
./start-prod.sh
Manual Method
On Windows:

# Command Prompt
set NODE_ENV=production
node dist/index.js
# PowerShell
$env:NODE_ENV="production"
node dist/index.js
On macOS/Linux:

NODE_ENV=production node dist/index.js
Or use the npm script (works on macOS/Linux, may require cross-env on Windows):

npm start
API Endpoints
GET /api/transactions - Retrieve all transactions
GET /api/transactions/:id - Retrieve a specific transaction
POST /api/transactions - Create a new transaction
PATCH /api/transactions/:id - Update a transaction
DELETE /api/transactions/:id - Delete a transaction
GET /api/dashboard/statistics - Get dashboard statistics
Deployment
This project is configured for deployment with Vercel:

Push your code to GitHub
Connect your GitHub repository to Vercel
Add the MONGODB_URI environment variable
Deploy
