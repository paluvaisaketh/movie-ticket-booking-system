# 🎬 Online Movie Ticket Booking System

This is a **full-stack online movie ticket booking system** built with **Angular**, **Tailwind CSS**, and **MockAPI** for mock data handling. The platform allows users to browse movies, view showtimes, book tickets, and manage their bookings, while admins can manage content, movies, banners, offers, and shows.

---

## 📁 Project Structure

The project is organized into the following Angular modules:

- **Admin Module**: For managing movies, shows, banners, offers, and screen content.
- **User Module**: For browsing movies, viewing showtimes, booking tickets, and accessing booking history.
- **Core Module**: Shared components like headers, footers, profile dropdown, and services.

---

## ✅ Prerequisites

Ensure the following are installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Angular CLI](https://angular.io/cli) (v12 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- Internet access to fetch data from [MockAPI](https://mockapi.io/)

---

## 🚀 Getting Started

1. Install Dependencies

    npm install

2. Run the Application

    ng serve
    Open your browser and visit: http://localhost:4200

🧪 MockAPI Setup
This project uses MockAPI to simulate a backend for development and testing purposes. The following resources are managed through MockAPI:

Users
Movies
Theatres and Screens
Shows
Bookings
Offers
Banners
Seat Layouts

You can view mock data by visiting your MockAPI Links.
https://686a04a42af1d945cea2fe42.mockapi.io/Main/2
https://686a04a42af1d945cea2fe42.mockapi.io/seatingdata

🌐 Folder Structure (Frontend)

src/
│
├── app/
│   ├── admin/               # Admin panel (movie, show, banner, offer management)
│   ├── user/                # User module (movie browsing, booking)
│   ├── core/                # Shared components (navbar, footer, services)
│   ├── app-routing.module.ts
│   └── app.module.ts
│
├── assets/                 # Static files (images, icons)
├── environments/           # API base URLs for dev/prod
└── index.html


📦 Features

👤 User

View movies and showtimes
Filter and search by category or language
Book tickets with seat selection
View booking history and details
View offers and discounts

🔧 Admin

Add/edit/delete movies
Schedule shows and manage screens
Manage seat layouts
Upload banners and promotional content
Add and update offers
View basic reports (in-progress)

🧰 Tech Stack

Frontend: Angular 19, Tailwind CSS
Backend: MockAPI (Simulated REST API)
UI Design: Responsive with utility-first styling (Tailwind)
Data Management: HTTP requests to MockAPI using Angular’s HttpClient