// Mock API URL - Replace with your actual MockAPI endpoint
const API_URL = "https://6864231888359a373e979da4.mockapi.io/MoviesData";

// Mock data
const movies= [ 
  {
    id: "M001",
    title: "Thug Life",
    poster: "IMAGES/thug-life-et00375421-1748844108.avif",
    rating: "U",
    language: "Tamil",
    genre: ["Action", "Drama"],
    duration: "2h 46min",
    synopsis: "A father's journey to protect his family from the underworld.",
    formats: ["2D", "IMAX"],
  },
  {
    id: "M002",
    title: "Ponniyin Selvan 2",
    poster: "https://example.com/posters/ps2.jpg",
    rating: "UA",
    language: "Tamil",
    genre: ["Historical", "Drama"],
    duration: "2h 52min",
    synopsis: "The epic conclusion to the Chola dynasty saga.",
    formats: ["2D", "3D", "IMAX"],
  },
  {
    id: "M003",
    title: "Jailer",
    poster: "https://example.com/posters/jailer.jpg",
    rating: "UA",
    language: "Tamil",
    genre: ["Action", "Thriller"],
    duration: "2h 38min",
    synopsis: "A retired jailer returns to action when his family is threatened.",
    formats: ["2D", "Dolby Atmos"],
  },
  {
    id: "M004",
    title: "Avatar: The Way of Water",
    poster: "https://example.com/posters/avatar2.jpg",
    rating: "UA",
    language: "English",
    genre: ["Sci-Fi", "Adventure"],
    duration: "3h 12min",
    synopsis: "Jake Sully and his family explore the oceans of Pandora.",
    formats: ["3D", "IMAX", "4DX"],
  },
];

const theaters = [
  {
    id: "T001",
    name: "PVR Cinemas",
    location: "Phoenix MarketCity, Chennai",
    amenities: ["Dolby Atmos", "Food Court", "Wheelchair Access"],
    screens: [
      { 
        id: "T001-S1", 
        name: "Screen 1", 
        seatingCapacity: 180,
        seatLayout: [
          ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"],
          ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"], 
          // ... more rows
        ]
      },
      { 
        id: "T001-S2", 
        name: "IMAX Screen", 
        seatingCapacity: 250,
        seatLayout: [
          ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
          // ... more rows
        ]
      },
    ],
  },
  {
    id: "T002",
    name: "INOX Leisure",
    location: "Forum Vijaya Mall, Chennai",
    amenities: ["4K Projection", "Gourmet Food", "Luxury Seating"],
    screens: [
      { 
        id: "T002-S1", 
        name: "Screen 1", 
        seatingCapacity: 150,
        seatLayout: [
          ["A1", "A2", "A3", "A4", "A5", "A6"],
          ["B1", "B2", "B3", "B4", "B5", "B6"],
          // ... more rows
        ]
      },
      { 
        id: "T002-S2", 
        name: "4DX Screen", 
        seatingCapacity: 120,
        seatLayout: [
          ["A1", "A2", "A3", "A4"],
          ["B1", "B2", "B3", "B4"],
          // ... more rows
        ]
      },
    ],
  },
];

const showtimes= [
  {
    id: "SH001",
    movieId: "M001",
    theaterId: "T001",
    screenId: "T001-S1",
    date: "2023-12-15",
    time: "10:00",
    price: 200,
    bookedSeats: ["A1", "A2", "B3"],
  },
  {
    id: "SH002",
    movieId: "M001",
    theaterId: "T001",
    screenId: "T001-S1",
    date: "2023-12-15",
    time: "13:30",
    price: 250,
    bookedSeats: ["A5", "B2"],
  },
  {
    id: "SH003",
    movieId: "M002",
    theaterId: "T001",
    screenId: "T001-S2",
    date: "2023-12-15",
    time: "11:00",
    price: 350,
    bookedSeats: ["A3", "A4", "B1", "B2"],
  },
  {
    id: "SH004",
    movieId: "M003",
    theaterId: "T002",
    screenId: "T002-S1",
    date: "2023-12-15",
    time: "14:00",
    price: 220,
    bookedSeats: ["A1", "A2"],
  },
];

const bookings= [
  {
    id: "B001",
    userId: "U001",
    showtimeId: "SH001",
    movieId: "M001",
    theaterId: "T001",
    seats: ["A1", "A2"],
    totalAmount: 400,
    bookingDate: "2023-12-10T14:30:00Z",
    paymentMethod: "credit_card",
    status: "confirmed",
  },
  {
    id: "B002",
    userId: "U001",
    showtimeId: "SH003",
    movieId: "M002",
    theaterId: "T001",
    seats: ["A3", "A4"],
    totalAmount: 700,
    bookingDate: "2023-12-11T10:15:00Z",
    paymentMethod: "upi",
    status: "confirmed",
  },
  {
    id: "B003",
    userId: "U002",
    showtimeId: "SH004",
    movieId: "M003",
    theaterId: "T002",
    seats: ["A1", "A2"],
    totalAmount: 440,
    bookingDate: "2023-12-12T16:45:00Z",
    paymentMethod: "net_banking",
    status: "confirmed",
  },
];

const users=[
  {
    id: "U001",
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "9876543210",
    bookings: ["B001", "B002"],
    joinDate: "2023-01-15",
    preferences: {
      favoriteTheater: "T001",
      preferredPayment: "upi",
      favoriteGenres: ["Action", "Drama"],
    },
  },
  {
    id: "U002",
    name: "Priya Patel",
    email: "priya@example.com",
    phone: "8765432109",
    bookings: ["B003"],
    joinDate: "2023-03-22",
    preferences: {
      preferredPayment: "net_banking",
    },
  },
];

const offers = [
  {
    id: "OFF001",
    code: "WELCOME20",
    discountType: "percentage",
    discountValue: 20,
    minAmount: 500,
    validFrom: "2023-12-01",
    validTo: "2023-12-31",
    description: "20% off on your first booking (min. ₹500)",
  },
  {
    id: "OFF002",
    code: "FRIDAY50",
    discountType: "fixed",
    discountValue: 50,
    minAmount: 300,
    validFrom: "2023-12-01",
    validTo: "2023-12-31",
    applicableDays: [5], // Friday
    description: "Flat ₹50 off on Fridays (min. ₹300)",
  },
];

// Combine all data into a single database object
const movieBookingDatabase = {
  movies,
  theaters,
  showtimes,
  bookings,
  users,
  offers,
};

// Function to upload data to MockAPI
async function uploadToMockAPI() {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movieBookingDatabase),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Database uploaded successfully!", result);
    return result;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw error;
  }
}

// Call the function to upload data
uploadToMockAPI()
  .then(() => console.log("Upload completed"))
  .catch(() => console.log("Upload failed"));