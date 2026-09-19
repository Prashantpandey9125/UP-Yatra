from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
import uuid
import json
from pathlib import Path
from functools import wraps

# =========================================================
# UP YATRA - FLASK BACKEND 3.0
# =========================================================

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "up_tourism.db"

app = Flask(__name__)
app.secret_key = "up-yatra-secret-key-2026"

# =========================================================
# DEFAULT UP TOURISM DESTINATIONS
# =========================================================

DESTINATIONS = [
    {
        "slug": "agra",
        "name": "Agra",
        "category": "Heritage",
        "short": "Taj Mahal, Mughal heritage and unforgettable architecture.",
        "description": "Agra is one of Uttar Pradesh's most famous heritage destinations, known for the Taj Mahal, Agra Fort and rich Mughal history.",
        "location": "Agra, Uttar Pradesh",
        "best_time": "October - March",
        "food": "Petha, Mughlai cuisine",
        "places": "Taj Mahal, Agra Fort, Mehtab Bagh, Itmad-ud-Daulah",
        "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "slug": "varanasi",
        "name": "Varanasi",
        "category": "Spiritual",
        "short": "Ghats, Ganga Aarti, temples and timeless spiritual atmosphere.",
        "description": "Varanasi offers a unique experience around the Ganga ghats, temples, sunrise boat rides and evening Ganga Aarti.",
        "location": "Varanasi, Uttar Pradesh",
        "best_time": "October - March",
        "food": "Kachori-sabzi, lassi, Banarasi paan",
        "places": "Dashashwamedh Ghat, Assi Ghat, Kashi Vishwanath area, Manikarnika Ghat",
        "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "slug": "ayodhya",
        "name": "Ayodhya",
        "category": "Spiritual",
        "short": "Sacred ghats, temples and the cultural heritage of the ancient city.",
        "description": "Ayodhya is a major spiritual and cultural destination on the banks of the Sarayu, with temples, ghats and heritage experiences.",
        "location": "Ayodhya, Uttar Pradesh",
        "best_time": "October - March",
        "food": "North Indian vegetarian cuisine, local sweets",
        "places": "Ram Mandir area, Hanuman Garhi, Kanak Bhawan, Saryu Ghat",
        "image": "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "slug": "lucknow",
        "name": "Lucknow",
        "category": "Culture",
        "short": "Nawabi architecture, chikankari, kebabs and refined culture.",
        "description": "Lucknow blends historic Nawabi architecture, traditional crafts, food culture and modern city life.",
        "location": "Lucknow, Uttar Pradesh",
        "best_time": "October - February",
        "food": "Tunday kebab, Lucknowi biryani, basket chaat",
        "places": "Bara Imambara, Chota Imambara, Rumi Darwaza, Residency",
        "image": "https://images.unsplash.com/photo-1600100397608-f0104c5b2d9d?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "slug": "mathura-vrindavan",
        "name": "Mathura - Vrindavan",
        "category": "Spiritual",
        "short": "Krishna heritage, colourful temples and vibrant devotional culture.",
        "description": "Mathura and Vrindavan are important pilgrimage and cultural centres associated with Krishna traditions and temple heritage.",
        "location": "Mathura, Uttar Pradesh",
        "best_time": "October - March",
        "food": "Peda, lassi, North Indian vegetarian food",
        "places": "Shri Krishna Janmabhoomi area, Banke Bihari Temple area, Prem Mandir, Vishram Ghat",
        "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "slug": "prayagraj",
        "name": "Prayagraj",
        "category": "Spiritual",
        "short": "Triveni Sangam, historic landmarks and riverside experiences.",
        "description": "Prayagraj is known for the Triveni Sangam and its historic, literary and cultural significance.",
        "location": "Prayagraj, Uttar Pradesh",
        "best_time": "October - March",
        "food": "Kachori-sabzi, street snacks",
        "places": "Triveni Sangam, Anand Bhavan, Allahabad Fort area, Khusro Bagh",
        "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "slug": "sarnath",
        "name": "Sarnath",
        "category": "Heritage",
        "short": "Buddhist heritage, museums and peaceful archaeological sites.",
        "description": "Sarnath, near Varanasi, is an important Buddhist heritage site associated with the Buddha's first sermon.",
        "location": "Sarnath, Uttar Pradesh",
        "best_time": "October - March",
        "food": "Banarasi and North Indian cuisine",
        "places": "Dhamek Stupa, Sarnath Museum, Chaukhandi Stupa, Deer Park",
        "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "slug": "jhansi",
        "name": "Jhansi",
        "category": "Heritage",
        "short": "Fort, Bundelkhand history and the legacy of Rani Lakshmibai.",
        "description": "Jhansi is a historic Bundelkhand city centred around the impressive Jhansi Fort and its rich history.",
        "location": "Jhansi, Uttar Pradesh",
        "best_time": "October - March",
        "food": "Bundelkhandi and North Indian dishes",
        "places": "Jhansi Fort, Rani Mahal, Government Museum",
        "image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "slug": "dudhwa",
        "name": "Dudhwa",
        "category": "Nature",
        "short": "Forests, wildlife and a refreshing nature escape in Uttar Pradesh.",
        "description": "Dudhwa is a major nature destination in Uttar Pradesh offering forest landscapes and wildlife experiences.",
        "location": "Lakhimpur Kheri, Uttar Pradesh",
        "best_time": "November - April",
        "food": "Local North Indian cuisine",
        "places": "Dudhwa National Park, forest zones, nature areas",
        "image": "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "slug": "fatehpur-sikri",
        "name": "Fatehpur Sikri",
        "category": "Heritage",
        "short": "Grand Mughal-era architecture and historic monuments.",
        "description": "Fatehpur Sikri is a historic city near Agra with remarkable Mughal-era architectural monuments.",
        "location": "Fatehpur Sikri, Uttar Pradesh",
        "best_time": "October - March",
        "food": "Agra-region cuisine and sweets",
        "places": "Buland Darwaza, Jama Masjid, Diwan-i-Khas, Panch Mahal",
        "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "slug": "vindhyachal",
        "name": "Vindhyachal",
        "category": "Spiritual",
        "short": "A revered pilgrimage town with temples and riverside atmosphere.",
        "description": "Vindhyachal is an important pilgrimage destination in Mirzapur district of Uttar Pradesh.",
        "location": "Mirzapur, Uttar Pradesh",
        "best_time": "October - March",
        "food": "North Indian vegetarian food and local sweets",
        "places": "Vindhyavasini Temple, Kali Khoh, Ashtabhuja",
        "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85"
    },
    {
        "slug": "kanpur",
        "name": "Kanpur",
        "category": "City",
        "short": "Urban culture, riverfront experiences and historic landmarks.",
        "description": "Kanpur is a major city of Uttar Pradesh with industrial history, markets, parks and cultural attractions.",
        "location": "Kanpur, Uttar Pradesh",
        "best_time": "October - February",
        "food": "Thaggu ke laddu, street food, North Indian cuisine",
        "places": "JK Temple, Moti Jheel, Allen Forest Zoo, Ganga Barrage",
        "image": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85"
    }
]

# =========================================================
# REAL UP STAYS
# =========================================================

REAL_STAYS = [
    {
        "name": "Hotel Taj Khema",
        "city": "Agra",
        "category": "UPSTDC Hotel",
        "location": "Near Eastern Gate of Taj Mahal, Tajganj, Agra, Uttar Pradesh",
        "phone": "9415902742",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85"
    },
    {
        "name": "Hotel Saket",
        "city": "Ayodhya",
        "category": "UPSTDC Hotel",
        "location": "Near Ayodhya Railway Station, Ayodhya, Uttar Pradesh",
        "phone": "9451090074",
        "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=85"
    },
    {
        "name": "Hotel Gomti",
        "city": "Lucknow",
        "category": "UPSTDC Hotel",
        "location": "Tej Bahadur Sapru Marg, Hazratganj, Lucknow, Uttar Pradesh",
        "phone": "9453671319",
        "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=85"
    },
    {
        "name": "Rahi Tourist Bungalow",
        "city": "Varanasi",
        "category": "UPSTDC Tourist Bungalow",
        "location": "Parade Kothi, Near Cantt Railway Station, Varanasi, Uttar Pradesh",
        "phone": "9415902707",
        "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=85"
    },
    {
        "name": "Rahi Tourist Bungalow Sarnath",
        "city": "Sarnath",
        "category": "UPSTDC Tourist Bungalow",
        "location": "Sarnath Station Road, Sarnath, Varanasi, Uttar Pradesh",
        "phone": "8789773573",
        "image": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=85"
    },
    {
        "name": "Rahi Ilawart Tourist Bungalow",
        "city": "Prayagraj",
        "category": "UPSTDC Tourist Bungalow",
        "location": "M.G. Marg, Civil Lines, Prayagraj, Uttar Pradesh",
        "phone": "9415311133",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85"
    },
    {
        "name": "Rahi Triveni Darshan",
        "city": "Prayagraj",
        "category": "UPSTDC Hotel",
        "location": "Yamuna Bank Road, Kydganj, Prayagraj, Uttar Pradesh",
        "phone": "9532437599",
        "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=85"
    },
    {
        "name": "Rahi Veerangana Tourist Bungalow",
        "city": "Jhansi",
        "category": "UPSTDC Tourist Bungalow",
        "location": "Civil Lines, Jhansi, Uttar Pradesh",
        "phone": "9415609450",
        "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=85"
    },
    {
        "name": "Rahi Gulistan Tourist Complex",
        "city": "Fatehpur Sikri",
        "category": "UPSTDC Tourist Complex",
        "location": "Shahkuli, Fatehpur Sikri, Agra, Uttar Pradesh",
        "phone": "9415233448",
        "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85"
    },
    {
        "name": "Rahi Tourist Bungalow",
        "city": "Kanpur",
        "category": "UPSTDC Tourist Bungalow",
        "location": "Bithoor, Kanpur, Uttar Pradesh",
        "phone": "9415609464",
        "image": "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=900&q=85"
    }
]

# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# =========================================================
# DATABASE INITIALIZATION
# =========================================================

def init_db():
    conn = get_db()

    conn.executescript("""
        CREATE TABLE IF NOT EXISTS destinations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            short TEXT,
            description TEXT,
            location TEXT,
            best_time TEXT,
            food TEXT,
            places TEXT,
            image TEXT
        );

        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            destination_slug TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(session_id, destination_slug)
        );

        CREATE TABLE IF NOT EXISTS trip_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            destination TEXT NOT NULL,
            days INTEGER NOT NULL,
            budget TEXT NOT NULL,
            travel_type TEXT NOT NULL,
            plan_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS stays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            city TEXT NOT NULL,
            category TEXT NOT NULL,
            location TEXT NOT NULL,
            phone TEXT,
            image TEXT,
            booking_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # =====================================================
    # SEED DESTINATIONS
    # =====================================================

    for destination in DESTINATIONS:
        conn.execute("""
            INSERT OR IGNORE INTO destinations
            (
                slug,
                name,
                category,
                short,
                description,
                location,
                best_time,
                food,
                places,
                image
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            destination["slug"],
            destination["name"],
            destination["category"],
            destination["short"],
            destination["description"],
            destination["location"],
            destination["best_time"],
            destination["food"],
            destination["places"],
            destination["image"]
        ))

    # =====================================================
    # SEED REAL STAYS
    # =====================================================

    for stay in REAL_STAYS:
        exists = conn.execute("""
            SELECT id
            FROM stays
            WHERE name = ?
            AND city = ?
        """, (
            stay["name"],
            stay["city"]
        )).fetchone()

        if not exists:
            conn.execute("""
                INSERT INTO stays
                (
                    name,
                    city,
                    category,
                    location,
                    phone,
                    image,
                    booking_url
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                stay["name"],
                stay["city"],
                stay["category"],
                stay["location"],
                stay["phone"],
                stay["image"],
                ""
            ))

    # =====================================================
    # DEFAULT ADMIN
    # =====================================================

    conn.execute("""
        INSERT OR IGNORE INTO admin_users
        (username, password)
        VALUES (?, ?)
    """, (
        "admin",
        "admin123"
    ))

    conn.commit()
    conn.close()

# =========================================================
# VISITOR SESSION
# =========================================================

def ensure_session():
    if "visitor_id" not in session:
        session["visitor_id"] = str(uuid.uuid4())

    return session["visitor_id"]

# =========================================================
# ADMIN AUTHENTICATION
# =========================================================

def admin_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return redirect(url_for("admin_login"))

        return function(*args, **kwargs)

    return wrapper

# =========================================================
# BUILD SMART ITINERARY
# =========================================================

def build_itinerary(destination, days, budget, travel_type):
    selected = next(
        (
            item
            for item in DESTINATIONS
            if item["slug"] == destination
        ),
        None
    )

    if not selected:
        conn = get_db()

        row = conn.execute("""
            SELECT *
            FROM destinations
            WHERE slug = ?
        """, (
            destination,
        )).fetchone()

        conn.close()

        if not row:
            return None

        selected = dict(row)

    places = [
        place.strip()
        for place in selected["places"].split(",")
        if place.strip()
    ]

    if not places:
        places = [
            "Local sightseeing",
            "Local market",
            "Cultural experience"
        ]

    itinerary = []

    themes = [
        "Explore & Sightseeing",
        "Culture & Food",
        "Relax & Local Experience"
    ]

    for day in range(days):
        morning = places[(day * 2) % len(places)]
        afternoon = places[(day * 2 + 1) % len(places)]

        itinerary.append({
            "day": day + 1,
            "title": themes[day % len(themes)],
            "morning": morning,
            "afternoon": afternoon,
            "evening": "Local market / cultural experience"
        })

    budget_description = {
        "Budget": "Budget-friendly stay, local food and public/shared transport.",
        "Standard": "Comfortable stay with balanced food, accommodation and transport.",
        "Luxury": "Premium stay, private transport and curated experiences."
    }.get(
        budget,
        "Balanced travel plan."
    )

    return {
        "title": f"{selected['name']} - {days} Day Smart Plan",
        "description": (
            f"{budget_description} "
            f"Travel type: {travel_type}. "
            f"Best time: {selected['best_time']}."
        ),
        "days": itinerary
    }

# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    ensure_session()
    return render_template("index.html")

# =========================================================
# API - DESTINATIONS
# =========================================================

@app.route("/api/destinations", methods=["GET"])
def api_destinations():
    conn = get_db()

    rows = conn.execute("""
        SELECT *
        FROM destinations
        ORDER BY id
    """).fetchall()

    conn.close()

    return jsonify([
        dict(row)
        for row in rows
    ])

@app.route("/api/destinations/<slug>", methods=["GET"])
def api_destination(slug):
    conn = get_db()

    row = conn.execute("""
        SELECT *
        FROM destinations
        WHERE slug = ?
    """, (
        slug,
    )).fetchone()

    conn.close()

    if not row:
        return jsonify({
            "success": False,
            "error": "Destination not found"
        }), 404

    return jsonify({
        "success": True,
        "destination": dict(row)
    })

# =========================================================
# API - REAL STAYS
# =========================================================

@app.route("/api/stays", methods=["GET"])
def api_stays():
    city = (
        request.args.get("city")
        or ""
    ).strip()

    conn = get_db()

    if city and city.lower() != "all":
        rows = conn.execute("""
            SELECT *
            FROM stays
            WHERE city = ?
            ORDER BY id DESC
        """, (
            city,
        )).fetchall()
    else:
        rows = conn.execute("""
            SELECT *
            FROM stays
            ORDER BY id DESC
        """).fetchall()

    conn.close()

    return jsonify({
        "success": True,
        "count": len(rows),
        "stays": [
            dict(row)
            for row in rows
        ]
    })

@app.route("/api/stays/<city>", methods=["GET"])
def api_stays_by_city(city):
    conn = get_db()

    rows = conn.execute("""
        SELECT *
        FROM stays
        WHERE city = ?
        ORDER BY id DESC
    """, (
        city,
    )).fetchall()

    conn.close()

    return jsonify({
        "success": True,
        "count": len(rows),
        "stays": [
            dict(row)
            for row in rows
        ]
    })

# =========================================================
# API - FAVORITES
# =========================================================

@app.route("/api/favorites", methods=["GET"])
def get_favorites():
    sid = ensure_session()

    conn = get_db()

    rows = conn.execute("""
        SELECT destination_slug
        FROM favorites
        WHERE session_id = ?
        ORDER BY id DESC
    """, (
        sid,
    )).fetchall()

    conn.close()

    return jsonify([
        row["destination_slug"]
        for row in rows
    ])

@app.route("/api/favorites", methods=["POST"])
def add_favorite():
    sid = ensure_session()

    data = request.get_json(silent=True) or {}

    slug = (
        data.get("slug")
        or data.get("destination_slug")
        or ""
    ).strip()

    if not slug:
        return jsonify({
            "success": False,
            "error": "Destination slug is required"
        }), 400

    conn = get_db()

    destination = conn.execute("""
        SELECT id
        FROM destinations
        WHERE slug = ?
    """, (
        slug,
    )).fetchone()

    if not destination:
        conn.close()

        return jsonify({
            "success": False,
            "error": "Destination not found"
        }), 404

    conn.execute("""
        INSERT OR IGNORE INTO favorites
        (
            session_id,
            destination_slug
        )
        VALUES (?, ?)
    """, (
        sid,
        slug
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Added to favorites"
    })

@app.route("/api/favorites/<slug>", methods=["DELETE"])
def remove_favorite(slug):
    sid = ensure_session()

    conn = get_db()

    conn.execute("""
        DELETE FROM favorites
        WHERE session_id = ?
        AND destination_slug = ?
    """, (
        sid,
        slug
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Removed from favorites"
    })

# =========================================================
# API - CONTACT
# =========================================================

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()

    if not name:
        return jsonify({
            "success": False,
            "error": "Name is required."
        }), 400

    if not email:
        return jsonify({
            "success": False,
            "error": "Email is required."
        }), 400

    if not message:
        return jsonify({
            "success": False,
            "error": "Message is required."
        }), 400

    conn = get_db()

    conn.execute("""
        INSERT INTO contacts
        (
            name,
            email,
            subject,
            message
        )
        VALUES (?, ?, ?, ?)
    """, (
        name,
        email,
        subject,
        message
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Your message has been submitted successfully."
    })

# =========================================================
# API - SMART TRIP PLANNER
# =========================================================

@app.route("/api/plan", methods=["POST"])
def plan():
    sid = ensure_session()

    data = request.get_json(silent=True) or {}

    destination = (
        data.get("destination")
        or ""
    ).strip()

    budget = (
        data.get("budget")
        or "Standard"
    ).strip()

    travel_type = (
        data.get("travel_type")
        or data.get("travelType")
        or "Friends"
    ).strip()

    try:
        days = int(
            data.get("days", 3)
        )
    except (
        TypeError,
        ValueError
    ):
        days = 3

    days = max(
        1,
        min(days, 10)
    )

    if not destination:
        return jsonify({
            "success": False,
            "error": "Please select a destination."
        }), 400

    plan_data = build_itinerary(
        destination,
        days,
        budget,
        travel_type
    )

    if not plan_data:
        return jsonify({
            "success": False,
            "error": "Please select a valid Uttar Pradesh destination."
        }), 400

    conn = get_db()

    conn.execute("""
        INSERT INTO trip_plans
        (
            session_id,
            destination,
            days,
            budget,
            travel_type,
            plan_json
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        sid,
        destination,
        days,
        budget,
        travel_type,
        json.dumps(plan_data)
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        **plan_data
    })

# =========================================================
# AI TOURISM CHATBOT
# =========================================================

@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json(silent=True) or {}

    user_message = (
        data.get("message")
        or data.get("query")
        or ""
    ).strip()

    if not user_message:
        return jsonify({
            "success": False,
            "reply": "Please type a question about Uttar Pradesh tourism."
        }), 400

    message = user_message.lower()

    conn = get_db()

    destinations = conn.execute("""
        SELECT *
        FROM destinations
        ORDER BY id
    """).fetchall()

    stays = conn.execute("""
        SELECT *
        FROM stays
        ORDER BY id
    """).fetchall()

    conn.close()

    # =====================================================
    # GREETING
    # =====================================================

    greetings = [
        "hello",
        "hi",
        "hey",
        "namaste",
        "hii",
        "helo"
    ]

    if message in greetings:
        return jsonify({
            "success": True,
            "reply": (
                "Namaste! 🙏 Main UP Yatra Tourism Assistant hoon. "
                "Main Uttar Pradesh ke destinations, food, best time, "
                "stays aur travel planning ke baare mein help kar sakta hoon. "
                "Aap kya jaana chahte hain?"
            )
        })

    # =====================================================
    # HELP
    # =====================================================

    if (
        "help" in message
        or "what can you do" in message
        or "kya kar sakte ho" in message
    ):
        return jsonify({
            "success": True,
            "reply": (
                "🤖 Main aapki UP tourism mein help kar sakta hoon:\n\n"
                "📍 Destinations\n"
                "🏛️ Places to visit\n"
                "🌤️ Best time\n"
                "🍴 Famous food\n"
                "🏨 Real stays\n"
                "🧳 Trip planning\n"
                "💰 Budget suggestions\n"
                "🕌 Heritage / Spiritual / Culture / Nature places"
            )
        })

    # =====================================================
    # STAY SEARCH
    # =====================================================

    stay_keywords = [
        "hotel",
        "stay",
        "stays",
        "room",
        "rooms",
        "accommodation",
        "rukne",
        "rehne",
        "rehna",
        "thaharne"
    ]

    if any(keyword in message for keyword in stay_keywords):
        matching_stays = []

        for stay in stays:
            stay_city = stay["city"].lower()
            stay_name = stay["name"].lower()

            if (
                stay_city in message
                or stay_name in message
                or "up" in message
                or "uttar pradesh" in message
            ):
                matching_stays.append(stay)

        if matching_stays:
            stay_text = "\n\n".join(
                f"🏨 {stay['name']}\n"
                f"📍 {stay['city']}, Uttar Pradesh\n"
                f"📌 {stay['location']}"
                for stay in matching_stays[:5]
            )

            return jsonify({
                "success": True,
                "reply": (
                    "🏨 UP Yatra par available real-property listings:\n\n"
                    f"{stay_text}\n\n"
                    "Property details ke liye Stay section check karein."
                )
            })

        return jsonify({
            "success": True,
            "reply": (
                "🏨 Stay section mein Uttar Pradesh ke different cities "
                "ki properties available hain. Aap Agra, Ayodhya, Lucknow, "
                "Varanasi, Sarnath, Prayagraj, Jhansi, Fatehpur Sikri "
                "ya Kanpur ke stays search kar sakte hain."
            )
        })

    # =====================================================
    # DESTINATION SEARCH
    # =====================================================

    for destination in destinations:
        name = destination["name"].lower()
        slug = destination["slug"].lower()

        if name in message or slug in message:

            if (
                "best time" in message
                or "kab jana" in message
                or "kab jao" in message
                or "kab jaaye" in message
                or "season" in message
                or "time" in message
            ):
                return jsonify({
                    "success": True,
                    "reply": (
                        f"🌤️ {destination['name']} visit karne ka "
                        f"best time {destination['best_time']} hai."
                    )
                })

            if (
                "food" in message
                or "khana" in message
                or "kya khaye" in message
                or "kya khae" in message
                or "famous food" in message
                or "famous khana" in message
            ):
                return jsonify({
                    "success": True,
                    "reply": (
                        f"🍴 {destination['name']} mein aap "
                        f"{destination['food']} try kar sakte hain."
                    )
                })

            if (
                "place" in message
                or "places" in message
                or "kya dekhe" in message
                or "kya dekhein" in message
                or "ghumne" in message
                or "visit" in message
                or "dekhna" in message
            ):
                return jsonify({
                    "success": True,
                    "reply": (
                        f"📍 {destination['name']} mein ye places "
                        f"dekh sakte hain:\n\n"
                        f"{destination['places']}."
                    )
                })

            return jsonify({
                "success": True,
                "reply": (
                    f"📍 {destination['name']}\n\n"
                    f"{destination['description']}\n\n"
                    f"🌤️ Best Time: {destination['best_time']}\n"
                    f"🍴 Food: {destination['food']}\n"
                    f"📌 Places: {destination['places']}"
                )
            })

    # =====================================================
    # CATEGORY SEARCH
    # =====================================================

    categories = {
        "heritage": "Heritage",
        "spiritual": "Spiritual",
        "culture": "Culture",
        "nature": "Nature",
        "city": "City"
    }

    for keyword, category in categories.items():
        if keyword in message:
            matching = [
                dict(destination)
                for destination in destinations
                if destination["category"].lower() == category.lower()
            ]

            if matching:
                names = ", ".join(
                    destination["name"]
                    for destination in matching
                )

                return jsonify({
                    "success": True,
                    "reply": (
                        f"📍 Uttar Pradesh ke {category} destinations:\n\n"
                        f"{names}"
                    )
                })

    # =====================================================
    # GENERAL UP TOURISM
    # =====================================================

    if (
        "up tourism" in message
        or "uttar pradesh" in message
        or "uttar pradesh tourism" in message
        or "up ke tourist" in message
        or "up mein ghumna" in message
    ):
        return jsonify({
            "success": True,
            "reply": (
                "🕌 Uttar Pradesh mein heritage, spiritual, "
                "culture aur nature tourism ke bahut destinations hain.\n\n"
                "Popular options:\n"
                "Agra, Varanasi, Ayodhya, Lucknow, "
                "Mathura-Vrindavan, Prayagraj, Sarnath, "
                "Jhansi, Dudhwa, Fatehpur Sikri, "
                "Vindhyachal aur Kanpur."
            )
        })

    # =====================================================
    # TRIP PLAN
    # =====================================================

    if (
        "trip" in message
        or "itinerary" in message
        or "travel plan" in message
        or "tour plan" in message
        or "plan bana" in message
        or "trip plan" in message
    ):
        return jsonify({
            "success": True,
            "reply": (
                "🧳 Smart Trip Planner use karke aap "
                "UP destination select karke 1-10 days "
                "ka travel plan generate kar sakte hain.\n\n"
                "Aap destination, budget aur travel type select karein."
            )
        })

    # =====================================================
    # BUDGET
    # =====================================================

    if (
        "budget" in message
        or "cheap" in message
        or "sasta" in message
        or "kam paisa" in message
        or "low budget" in message
        or "kam budget" in message
    ):
        return jsonify({
            "success": True,
            "reply": (
                "💰 Low-budget UP trip ke liye "
                "public/shared transport, local food aur "
                "budget-friendly accommodation choose karna "
                "useful rahega.\n\n"
                "Smart Trip Planner mein 'Budget' option select karein."
            )
        })

    # =====================================================
    # GENERAL FOOD
    # =====================================================

    if (
        "famous food" in message
        or "famous khana" in message
        or "food in up" in message
        or "up ka food" in message
        or "up ka famous food" in message
        or "kya khaye" in message
    ):
        return jsonify({
            "success": True,
            "reply": (
                "🍴 Uttar Pradesh ke different cities ke famous "
                "foods try kar sakte hain, jaise:\n\n"
                "• Agra - Petha\n"
                "• Lucknow - Nawabi cuisine\n"
                "• Varanasi - Banarasi food\n"
                "• Mathura - Peda\n"
                "• Prayagraj - Kachori-sabzi"
            )
        })

    # =====================================================
    # DEFAULT
    # =====================================================

    return jsonify({
        "success": True,
        "reply": (
            "🤔 Mujhe aapka question completely samajh nahi aaya.\n\n"
            "Aap is type ka question pooch sakte hain:\n\n"
            "• Agra mein kya dekhein?\n"
            "• Varanasi ka best time kya hai?\n"
            "• UP ke spiritual places batao\n"
            "• UP mein famous food kya hai?\n"
            "• UP mein hotel/stay batao\n"
            "• 3 din ka trip plan kaise banaye?\n"
            "• Low budget trip kaise karein?"
        )
    })

# =========================================================
# WEATHER API
# =========================================================

@app.route("/api/weather", methods=["GET"])
def weather():
    city = (
        request.args.get("city")
        or ""
    ).strip().lower()

    if not city:
        return jsonify({
            "success": False,
            "message": "City is required."
        }), 400

    weather_data = {
        "agra": {
            "city": "Agra",
            "temperature": 32,
            "condition": "Sunny",
            "humidity": 45
        },
        "varanasi": {
            "city": "Varanasi",
            "temperature": 31,
            "condition": "Partly Cloudy",
            "humidity": 52
        },
        "ayodhya": {
            "city": "Ayodhya",
            "temperature": 31,
            "condition": "Sunny",
            "humidity": 48
        },
        "lucknow": {
            "city": "Lucknow",
            "temperature": 30,
            "condition": "Cloudy",
            "humidity": 55
        },
        "mathura-vrindavan": {
            "city": "Mathura - Vrindavan",
            "temperature": 32,
            "condition": "Sunny",
            "humidity": 46
        },
        "prayagraj": {
            "city": "Prayagraj",
            "temperature": 31,
            "condition": "Cloudy",
            "humidity": 50
        },
        "sarnath": {
            "city": "Sarnath",
            "temperature": 31,
            "condition": "Partly Cloudy",
            "humidity": 51
        },
        "jhansi": {
            "city": "Jhansi",
            "temperature": 33,
            "condition": "Sunny",
            "humidity": 42
        },
        "dudhwa": {
            "city": "Dudhwa",
            "temperature": 29,
            "condition": "Cloudy",
            "humidity": 60
        },
        "fatehpur-sikri": {
            "city": "Fatehpur Sikri",
            "temperature": 32,
            "condition": "Sunny",
            "humidity": 44
        },
        "vindhyachal": {
            "city": "Vindhyachal",
            "temperature": 30,
            "condition": "Partly Cloudy",
            "humidity": 53
        },
        "kanpur": {
            "city": "Kanpur",
            "temperature": 31,
            "condition": "Cloudy",
            "humidity": 54
        }
    }

    if city not in weather_data:
        return jsonify({
            "success": False,
            "message": "Weather data is not available for this UP destination."
        }), 404

    return jsonify({
        "success": True,
        "weather": weather_data[city]
    })

# =========================================================
# ADMIN LOGIN
# =========================================================

@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if session.get("admin_logged_in"):
        return redirect(
            url_for("admin_dashboard")
        )

    if request.method == "POST":
        username = (
            request.form.get("username")
            or ""
        ).strip()

        password = (
            request.form.get("password")
            or ""
        ).strip()

        conn = get_db()

        admin = conn.execute("""
            SELECT *
            FROM admin_users
            WHERE username = ?
            AND password = ?
        """, (
            username,
            password
        )).fetchone()

        conn.close()

        if admin:
            session["admin_logged_in"] = True
            session["admin_username"] = admin["username"]

            return redirect(
                url_for("admin_dashboard")
            )

        return render_template(
            "admin_login.html",
            error="Invalid username or password."
        )

    return render_template(
        "admin_login.html"
    )

# =========================================================
# ADMIN LOGOUT
# =========================================================

@app.route("/admin/logout")
def admin_logout():
    session.pop("admin_logged_in", None)
    session.pop("admin_username", None)

    return redirect(
        url_for("admin_login")
    )

# =========================================================
# ADMIN DASHBOARD
# =========================================================

@app.route("/admin")
@admin_required
def admin_dashboard():
    conn = get_db()

    destinations = conn.execute("""
        SELECT *
        FROM destinations
        ORDER BY id DESC
    """).fetchall()

    messages = conn.execute("""
        SELECT *
        FROM contacts
        ORDER BY id DESC
    """).fetchall()

    trip_plans = conn.execute("""
        SELECT *
        FROM trip_plans
        ORDER BY id DESC
        LIMIT 50
    """).fetchall()

    stays = conn.execute("""
        SELECT *
        FROM stays
        ORDER BY id DESC
    """).fetchall()

    destination_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM destinations
    """).fetchone()["count"]

    message_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM contacts
    """).fetchone()["count"]

    favorite_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM favorites
    """).fetchone()["count"]

    trip_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM trip_plans
    """).fetchone()["count"]

    stay_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM stays
    """).fetchone()["count"]

    conn.close()

    return render_template(
        "admin.html",
        destinations=destinations,
        messages=messages,
        trip_plans=trip_plans,
        stays=stays,
        destination_count=destination_count,
        message_count=message_count,
        favorite_count=favorite_count,
        trip_count=trip_count,
        stay_count=stay_count,
        admin_username=session.get(
            "admin_username",
            "admin"
        )
    )

# =========================================================
# ADMIN - ADD DESTINATION
# =========================================================

@app.route("/admin/destinations/add", methods=["POST"])
@admin_required
def add_destination():
    name = (
        request.form.get("name")
        or ""
    ).strip()

    slug = (
        request.form.get("slug")
        or ""
    ).strip().lower()

    category = (
        request.form.get("category")
        or "Heritage"
    ).strip()

    short = (
        request.form.get("short")
        or ""
    ).strip()

    description = (
        request.form.get("description")
        or ""
    ).strip()

    location = (
        request.form.get("location")
        or ""
    ).strip()

    best_time = (
        request.form.get("best_time")
        or ""
    ).strip()

    food = (
        request.form.get("food")
        or ""
    ).strip()

    places = (
        request.form.get("places")
        or ""
    ).strip()

    image = (
        request.form.get("image")
        or ""
    ).strip()

    if not name or not slug or not location:
        return redirect(
            url_for("admin_dashboard")
        )

    if "uttar pradesh" not in location.lower():
        return redirect(
            url_for("admin_dashboard")
        )

    conn = get_db()

    try:
        conn.execute("""
            INSERT INTO destinations
            (
                slug,
                name,
                category,
                short,
                description,
                location,
                best_time,
                food,
                places,
                image
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            slug,
            name,
            category,
            short,
            description,
            location,
            best_time,
            food,
            places,
            image
        ))

        conn.commit()

    except sqlite3.IntegrityError:
        pass

    finally:
        conn.close()

    return redirect(
        url_for("admin_dashboard")
    )

# =========================================================
# ADMIN - EDIT DESTINATION
# =========================================================

@app.route("/admin/destinations/edit/<int:dest_id>", methods=["POST"])
@admin_required
def edit_destination(dest_id):
    name = (
        request.form.get("name")
        or ""
    ).strip()

    slug = (
        request.form.get("slug")
        or ""
    ).strip().lower()

    category = (
        request.form.get("category")
        or "Heritage"
    ).strip()

    short = (
        request.form.get("short")
        or ""
    ).strip()

    description = (
        request.form.get("description")
        or ""
    ).strip()

    location = (
        request.form.get("location")
        or ""
    ).strip()

    best_time = (
        request.form.get("best_time")
        or ""
    ).strip()

    food = (
        request.form.get("food")
        or ""
    ).strip()

    places = (
        request.form.get("places")
        or ""
    ).strip()

    image = (
        request.form.get("image")
        or ""
    ).strip()

    if not name or not slug or not location:
        return redirect(
            url_for("admin_dashboard")
        )

    if "uttar pradesh" not in location.lower():
        return redirect(
            url_for("admin_dashboard")
        )

    conn = get_db()

    try:
        conn.execute("""
            UPDATE destinations
            SET
                slug = ?,
                name = ?,
                category = ?,
                short = ?,
                description = ?,
                location = ?,
                best_time = ?,
                food = ?,
                places = ?,
                image = ?
            WHERE id = ?
        """, (
            slug,
            name,
            category,
            short,
            description,
            location,
            best_time,
            food,
            places,
            image,
            dest_id
        ))

        conn.commit()

    except sqlite3.IntegrityError:
        pass

    finally:
        conn.close()

    return redirect(
        url_for("admin_dashboard")
    )

# =========================================================
# ADMIN - DELETE DESTINATION
# =========================================================

@app.route("/admin/destinations/delete/<int:dest_id>", methods=["POST"])
@admin_required
def delete_destination(dest_id):
    conn = get_db()

    destination = conn.execute("""
        SELECT slug
        FROM destinations
        WHERE id = ?
    """, (
        dest_id,
    )).fetchone()

    if destination:
        conn.execute("""
            DELETE FROM favorites
            WHERE destination_slug = ?
        """, (
            destination["slug"],
        ))

    conn.execute("""
        DELETE FROM destinations
        WHERE id = ?
    """, (
        dest_id,
    ))

    conn.commit()
    conn.close()

    return redirect(
        url_for("admin_dashboard")
    )

# =========================================================
# ADMIN - ADD STAY
# =========================================================

@app.route("/admin/stays/add", methods=["POST"])
@admin_required
def add_stay():
    name = (
        request.form.get("name")
        or ""
    ).strip()

    city = (
        request.form.get("city")
        or ""
    ).strip()

    category = (
        request.form.get("category")
        or "Hotel"
    ).strip()

    location = (
        request.form.get("location")
        or ""
    ).strip()

    phone = (
        request.form.get("phone")
        or ""
    ).strip()

    image = (
        request.form.get("image")
        or ""
    ).strip()

    booking_url = (
        request.form.get("booking_url")
        or ""
    ).strip()

    if not name or not city or not location:
        return redirect(
            url_for("admin_dashboard")
        )

    if "uttar pradesh" not in location.lower():
        return redirect(
            url_for("admin_dashboard")
        )

    conn = get_db()

    conn.execute("""
        INSERT INTO stays
        (
            name,
            city,
            category,
            location,
            phone,
            image,
            booking_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        name,
        city,
        category,
        location,
        phone,
        image,
        booking_url
    ))

    conn.commit()
    conn.close()

    return redirect(
        url_for("admin_dashboard")
    )

# =========================================================
# ADMIN - EDIT STAY
# =========================================================

@app.route("/admin/stays/edit/<int:stay_id>", methods=["POST"])
@admin_required
def edit_stay(stay_id):
    name = (
        request.form.get("name")
        or ""
    ).strip()

    city = (
        request.form.get("city")
        or ""
    ).strip()

    category = (
        request.form.get("category")
        or "Hotel"
    ).strip()

    location = (
        request.form.get("location")
        or ""
    ).strip()

    phone = (
        request.form.get("phone")
        or ""
    ).strip()

    image = (
        request.form.get("image")
        or ""
    ).strip()

    booking_url = (
        request.form.get("booking_url")
        or ""
    ).strip()

    if not name or not city or not location:
        return redirect(
            url_for("admin_dashboard")
        )

    if "uttar pradesh" not in location.lower():
        return redirect(
            url_for("admin_dashboard")
        )

    conn = get_db()

    conn.execute("""
        UPDATE stays
        SET
            name = ?,
            city = ?,
            category = ?,
            location = ?,
            phone = ?,
            image = ?,
            booking_url = ?
        WHERE id = ?
    """, (
        name,
        city,
        category,
        location,
        phone,
        image,
        booking_url,
        stay_id
    ))

    conn.commit()
    conn.close()

    return redirect(
        url_for("admin_dashboard")
    )

# =========================================================
# ADMIN - DELETE STAY
# =========================================================

@app.route("/admin/stays/delete/<int:stay_id>", methods=["POST"])
@admin_required
def delete_stay(stay_id):
    conn = get_db()

    conn.execute("""
        DELETE FROM stays
        WHERE id = ?
    """, (
        stay_id,
    ))

    conn.commit()
    conn.close()

    return redirect(
        url_for("admin_dashboard")
    )

# =========================================================
# ADMIN - DELETE CONTACT MESSAGE
# =========================================================

@app.route("/admin/messages/delete/<int:msg_id>", methods=["POST"])
@admin_required
def delete_message(msg_id):
    conn = get_db()

    conn.execute("""
        DELETE FROM contacts
        WHERE id = ?
    """, (
        msg_id,
    ))

    conn.commit()
    conn.close()

    return redirect(
        url_for("admin_dashboard")
    )

# =========================================================
# ADMIN - DELETE TRIP PLAN
# =========================================================

@app.route("/admin/trips/delete/<int:trip_id>", methods=["POST"])
@admin_required
def delete_trip_plan(trip_id):
    conn = get_db()

    conn.execute("""
        DELETE FROM trip_plans
        WHERE id = ?
    """, (
        trip_id,
    ))

    conn.commit()
    conn.close()

    return redirect(
        url_for("admin_dashboard")
    )

# =========================================================
# ADMIN - LIVE STATISTICS API
# =========================================================

@app.route("/api/admin/stats", methods=["GET"])
@admin_required
def admin_stats():
    conn = get_db()

    destination_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM destinations
    """).fetchone()["count"]

    message_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM contacts
    """).fetchone()["count"]

    favorite_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM favorites
    """).fetchone()["count"]

    trip_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM trip_plans
    """).fetchone()["count"]

    stay_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM stays
    """).fetchone()["count"]

    conn.close()

    return jsonify({
        "success": True,
        "stats": {
            "destinations": destination_count,
            "messages": message_count,
            "favorites": favorite_count,
            "trip_plans": trip_count,
            "stays": stay_count
        }
    })

# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(404)
def page_not_found(error):
    return jsonify({
        "success": False,
        "message": "Page not found"
    }), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500

# =========================================================
# INITIALIZE DATABASE
# =========================================================

init_db()

# =========================================================
# RUN FLASK
# =========================================================

if __name__ == "__main__":
    print()
    print("=" * 60)
    print("                 UP YATRA")
    print("          UP TOURISM WEB APPLICATION")
    print("=" * 60)
    print()
    print("Website:")
    print("http://127.0.0.1:5000/")
    print()
    print("Admin Panel:")
    print("http://127.0.0.1:5000/admin/login")
    print()
    print("Admin Username: admin")
    print("Admin Password: admin123")
    print()
    print("API - Stays:")
    print("http://127.0.0.1:5000/api/stays")
    print()
    print("=" * 60)
    print()

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )