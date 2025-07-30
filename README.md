Movie Ticket Booking System
This is a full-stack movie ticket booking application designed to provide a seamless experience for users to browse movies, select seats, book tickets, and manage their bookings. It also includes a comprehensive admin panel for managing movies, shows, theatres, users, and viewing analytics.
✨ Features
User Features
Browse Movies: View a list of current and upcoming movies.
Advanced Filtering: Filter movies by language, genre, format (2D, 3D, IMAX), and rating.
Search Functionality: Search for movies by title directly from the header.
Movie Details: View detailed information about each movie, including synopsis, duration, and ratings.
Showtime Selection: Select a movie, date, and view available showtimes across different theatres and screens.
Interactive Seat Selection: Visually select desired seats from a dynamic seat map, with real-time availability and pricing.
Optional Add-ons: Add snacks/beverages and opt for parking during booking.
Coupon Application: Apply promotional coupon codes for discounts.
Secure Payment Flow: Proceed to a payment page with a booking summary.
Booking Confirmation: Receive a unique booking ID and QR code upon successful payment.
My Bookings: View a history of all past and upcoming bookings.
Cancellation: Full booking cancellation (within a time limit) and partial cancellation for bookings with more than 5 tickets.
User Profile Management: Update personal details like name, email, and date of birth.
Admin Features
Dashboard: Overview of key metrics like active movies, total bookings, and revenue.
Movies Management: Full CRUD operations (Create, Read, Update, Delete) for movies, including managing genres, formats, and categories.
Shows Management: Create, update, and delete movie showtimes for specific screens. Automatic generation of initial seat layouts for new shows.
Seating Management: Real-time visual tool to block and unblock seats for any show (e.g., for maintenance or VIP holds).
Reports & Analytics: Detailed reports on movie performance, screen utilization, payment methods, and user acquisition trends.
Content Management: Manage homepage banners and promotional offers.
User Management: View all registered users and their details.
Admin Profile: Manage admin user profile.
🚀 Technologies Used
Frontend
Angular: Frontend framework
TypeScript: Primary language
Tailwind CSS: For rapid UI development and styling
Chart.js: For data visualization in the admin dashboard
RxJS: For reactive programming and asynchronous operations
Angular Material: (If used for dialogs/components)
Backend
Node.js: JavaScript runtime
Express.js: Web application framework
MongoDB: NoSQL database
Mongoose: MongoDB object modeling for Node.js
JWT (JSON Web Tokens): For authentication and authorization
Dotenv: For environment variable management
Bcrypt.js: For password hashing (if implemented)
Http-Proxy-Middleware: For API Gateway functionality
Infrastructure & Deployment
Docker: Containerization platform
Docker Compose: For defining and running multi-container Docker applications
API Gateway (Node.js/Express): Single entry point for all frontend requests, routing to backend services.
⚙️ Local Setup & Installation
Follow these steps to get the project up and running on your local machine.
Prerequisites
Node.js (v18 or higher) & npm (v8 or higher)
Docker Desktop (or Docker Engine for Linux) - Ensure it's running.
MongoDB Community Server (Optional, if not using the Dockerized MongoDB provided by Docker Compose)
1. Clone the Repository
git clone <repository_url>
cd Movie_Ticket_Booking # Navigate to the root of the cloned project


2. Configure Environment Variables
Create .env files in the respective directories:
Project Root (./.env):
This file is for common environment variables used by Docker Compose.
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

(Replace with a strong, random string. You can generate one online.)
Backend (./backend/.env):
MONGO_URI=mongodb://mongodb:27017/movie_booking_db # 'mongodb' is the service name in docker-compose
PORT=5000 # Internal port for backend service
JWT_SECRET=${JWT_SECRET} # References the variable from the project root .env


Gateway (./gateway/.env):
BACKEND_API_URL=http://grabseat-backend:5000 # 'grabseat-backend' is the service name in docker-compose
GATEWAY_PORT=3000 # Internal port for gateway service


Frontend (./frontend/src/environments/environment.ts):
This file is already part of your Angular project. Ensure apiUrl points to your Gateway.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api' // Frontend talks to the Gateway
};


3. Build and Run with Docker Compose (Recommended)
This is the easiest way to get all services (MongoDB, Backend, Gateway, Frontend) running.
Navigate to the project root directory:
cd Movie_Ticket_Booking


Build and start all services:
docker compose up --build -d


--build: Builds the Docker images for frontend, backend, and gateway.
-d: Runs the containers in detached mode (in the background).
Monitor logs (optional but recommended for debugging):
docker compose logs -f

Look for messages indicating successful startup: "MongoDB Connected Successfully...", "Server running on port...", "API Gateway running...", "nginx started".
Check running containers:
docker compose ps

All services should show State: Up.
4. Access the Application
Once all services are running, open your web browser and navigate to:
http://localhost


Your Angular frontend should load. All API requests will automatically be routed through the API Gateway to your backend and MongoDB.
5. Stop the Application
To stop and remove all running containers, networks, and volumes created by Docker Compose:
docker compose down


To also remove the persistent MongoDB data volume (for a clean slate):
docker compose down -v


📊 Database Seeding (Optional)
Your backend includes a script to populate the database with sample data. This is useful for development and testing.
Ensure MongoDB and your Backend container are running (docker compose up -d).
Execute the migration script:
docker compose exec grabseat-backend node src/scripts/migrate-data.js

This command runs the migrate-data.js script inside your grabseat-backend container. You should see console logs indicating data migration progress.
☁️ Deployment (Cloud Run)
This project is designed to be easily deployable to Google Cloud Run. Each backend service (Backend API, API Gateway) can be deployed as a separate Cloud Run service. The frontend can be served via Cloud Storage/Firebase Hosting or its own Cloud Run service.
General Steps for Cloud Run Deployment (Backend Example):
Prepare Service: Ensure your backend's Dockerfile is ready and its MONGO_URI points to an external MongoDB (e.g., MongoDB Atlas).
Build & Push Image: Use gcloud builds submit --tag gcr.io/[PROJECT_ID]/[SERVICE_NAME]:latest .
Deploy to Cloud Run: Use gcloud run deploy [SERVICE_NAME] --image gcr.io/[PROJECT_ID]/[SERVICE_NAME]:latest --platform managed --region [REGION] --allow-unauthenticated --set-env-vars ...
Update Frontend apiUrl: Change frontend/src/environments/environment.prod.ts to point to your deployed Cloud Run service URLs.
🤝 Contributing
Feel free to fork the repository, make improvements, and submit pull requests.
📄 License
This project is licensed under the MIT License.
