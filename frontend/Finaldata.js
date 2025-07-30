
const movieBookingDatabase = {

  "users": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@movieapp.com",
      "phone": "9999999999",
      "role": "admin",
      "created_at": "2025-07-04T08:47:50.760325"
    },
    {
      "id": 2,
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "phone": "9876543210",
      "role": "user",
      "created_at": "2025-07-04T08:47:50.760336"
    },
    {
      "id": 3,
      "name": "Priya Patel",
      "email": "priya@example.com",
      "phone": "8765432109",
      "role": "user",
      "created_at": "2025-07-04T08:47:50.760338"
    }
  ],
  "theatre": {
    "id": 1,
    "name": "CineStar Grand",
    "location": "City Center Mall, Hyderabad",
    "contact": "+91-9876543210",
    "is_active": true,
    "created_at": "2025-07-04T08:47:50.760421",
    "screens": [
      {
        "id": 1,
        "name": "Screen 1"
      },
      {
        "id": 2,
        "name": "Screen 2"
      },
            {
      "id": 3,
        "name": "Screen 3"
      },
            {
      "id": 4,
        "name": "Screen 4"
      }
    ]
  },
  "movies": [
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
    
  ],
  "offers": [
    {
      "id": 1,
      "code": "WELCOME100",
      "title": "Welcome Offer",
      "discount_type": "fixed",
      "discount_value": 100,
      "min_amount": 300,
      "max_discount": null,
      "valid_from": "2025-07-01T00:00:00Z",
      "valid_to": "2025-07-31T23:59:59Z",
      "created_at": "2025-07-04T08:47:50.770705"
    }
  ],
  "bookings": [
    {
      "id": 1,
      "user_id": 2,
      "show_id": 1,
      "base_amount": 300,
      "convenience_fee": 40,
      "discount_applied": 0,
      "final_amount": 340,
      "status": "confirmed",
      "created_at": "2025-07-04T08:47:50.770830"
    },
    {
      "id": 2,
      "user_id": 3,
      "show_id": 3,
      "base_amount": 560,
      "convenience_fee": 40,
      "discount_applied": 50,
      "final_amount": 550,
      "status": "confirmed",
      "created_at": "2025-07-04T08:47:50.770835"
    }
  ],
  "booking_offers": [
    {
      "id": 1,
      "booking_id": 2,
      "offer_id": 1,
      "discount_amount": 50,
      "created_at": "2025-07-04T08:47:50.770900"
    }
  ],
  "payments": [
    {
      "id": 1,
      "booking_id": 1,
      "original_amount": 340,
      "final_amount": 340,
      "payment_method": "cash",
      "receipt_number": "RCP001",
      "status": "paid",
      "created_at": "2025-07-04T08:47:50.771005"
    },
    {
      "id": 2,
      "booking_id": 2,
      "original_amount": 600,
      "final_amount": 550,
      "payment_method": "voucher",
      "receipt_number": "RCP002",
      "status": "paid",
      "created_at": "2025-07-04T08:47:50.771008"
    }
  ],
  "seat_operations": [
    {
      "id": 1,
      "seat_id": 1,
      "admin_id": 1,
      "action": "block",
      "reason": "Broken chair",
      "created_at": "2025-07-04T08:47:50.771055"
    }
  ],
  "banners": [
    {
      "id": 1,
      "position": 1,
      "image_data": "<binary>",
      "mimetype": "image/png",
      "title": "Weekend Blockbuster",
      "target_url": "https://example.com/blockbuster",
      "is_active": true,
      "start_date": "2025-07-01T00:00:00Z",
      "end_date": "2025-07-10T00:00:00Z",
      "created_by": 1,
      "created_at": "2025-07-04T08:47:50.771132"
    }
  ],
    "shows": [
    {
      "id": 1,
      "movie_id": 1,
      "screen_id": 1,
      "date": "2025-07-04",
      "show_time": "11:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.667244"
    },
    {
      "id": 2,
      "movie_id": 2,
      "screen_id": 1,
      "date": "2025-07-04",
      "show_time": "14:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.667658"
    },
    {
      "id": 3,
      "movie_id": 1,
      "screen_id": 1,
      "date": "2025-07-04",
      "show_time": "18:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.668075"
    },
    {
      "id": 4,
      "movie_id": 2,
      "screen_id": 1,
      "date": "2025-07-04",
      "show_time": "21:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.668766"
    },
    {
      "id": 5,
      "movie_id": 1,
      "screen_id": 2,
      "date": "2025-07-04",
      "show_time": "11:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.669288"
    },
    {
      "id": 6,
      "movie_id": 2,
      "screen_id": 2,
      "date": "2025-07-04",
      "show_time": "14:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.670039"
    },
    {
      "id": 7,
      "movie_id": 1,
      "screen_id": 2,
      "date": "2025-07-04",
      "show_time": "18:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.670815"
    },
    {
      "id": 8,
      "movie_id": 2,
      "screen_id": 2,
      "date": "2025-07-04",
      "show_time": "21:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.671931"
    },
    {
      "id": 9,
      "movie_id": 1,
      "screen_id": 3,
      "date": "2025-07-04",
      "show_time": "11:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.673388"
    },
    {
      "id": 10,
      "movie_id": 2,
      "screen_id": 3,
      "date": "2025-07-04",
      "show_time": "14:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.674387"
    },
    {
      "id": 11,
      "movie_id": 1,
      "screen_id": 3,
      "date": "2025-07-04",
      "show_time": "18:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.675008"
    },
    {
      "id": 12,
      "movie_id": 2,
      "screen_id": 3,
      "date": "2025-07-04",
      "show_time": "21:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.675710"
    },
    {
      "id": 13,
      "movie_id": 1,
      "screen_id": 4,
      "date": "2025-07-04",
      "show_time": "11:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.676207"
    },
    {
      "id": 14,
      "movie_id": 2,
      "screen_id": 4,
      "date": "2025-07-04",
      "show_time": "14:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.676885"
    },
    {
      "id": 15,
      "movie_id": 1,
      "screen_id": 4,
      "date": "2025-07-04",
      "show_time": "18:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.677489"
    },
    {
      "id": 16,
      "movie_id": 2,
      "screen_id": 4,
      "date": "2025-07-04",
      "show_time": "21:00",
      "normal_price": 150,
      "premium_price": 250,
      "is_active": true,
      "created_at": "2025-07-04T08:43:50.677977"
    }
  ]
};



const API_URL = "https://686a04a42af1d945cea2fe42.mockapi.io/Main/2";

async function uploadToMockAPI() {
  try {
    // Step 1: Create an empty object first
    const createResponse = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}) // Empty or partial data
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create resource: ${createResponse.status}`);
    }

    const created = await createResponse.json();
    const resourceId = created.id;

    // Step 2: Update with full database
    const updateResponse = await fetch(`${API_URL}/${resourceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movieBookingDatabase)
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update resource: ${updateResponse.status}`);
    }

    const result = await updateResponse.json();
    console.log("✅ Database uploaded successfully!", result);
    return result;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw error;
  }
}

uploadToMockAPI()
  .then(() => console.log("Upload completed"))
  .catch(() => console.log("Upload failed"));
