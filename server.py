# ===============================
# CITY BUDDY – FINAL SERVER (FIXED)
# ===============================

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os, json, re, smtplib
from datetime import datetime
from email.mime.text import MIMEText
from time import time

request_log = {}

load_dotenv()

EMAIL = os.getenv("SENDER_EMAIL")
PASSWORD = os.getenv("EMAIL_PASSWORD")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")
ADMIN_KEY = os.getenv("ADMIN_KEY")

# Local fallback values (development only; do not commit with real credentials)
if not EMAIL:
    EMAIL = "midnightgents175@gmail.com"
if not PASSWORD:
    PASSWORD = "yjlabsuigwendaf"

BOOKINGS_FILE = "bookings.json"

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

# VALIDATION
def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def is_valid_phone(phone):
    return re.match(r"^[6-9]\d{9}$", phone)

# SERVE
@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(app.static_folder, path)

# STORAGE
def load_bookings():
    if not os.path.exists(BOOKINGS_FILE):
        return []
    with open(BOOKINGS_FILE, "r") as f:
        try:
            return json.load(f)
        except:
            return []

def save_booking(data):
    bookings = load_bookings()
    bookings.append(data)

    temp_file = BOOKINGS_FILE + ".tmp"
    with open(temp_file, "w") as f:
        json.dump(bookings, f, indent=2)

    os.replace(temp_file, BOOKINGS_FILE)

# EMAIL

def send_email(to_email, subject, body):
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL
        msg["To"] = to_email

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL, PASSWORD)
            server.send_message(msg)

        print("Email sent successfully")

    except Exception as e:
        print("EMAIL ERROR:", e)
# API
@app.route("/api/booking", methods=["POST"])
def booking():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"status": "error", "message": "No data"}), 400

        if EMAIL and PASSWORD and RECEIVER_EMAIL:
            booking_body = f"""
Name: {data.get('client_name')}
Email: {data.get('client_email')}
Phone: {data.get('client_phone')}
Service: {data.get('service_type')}
Date: {data.get('meetup_date')}
Time: {data.get('meetup_time')}
Location: {data.get('meetup_location')}
Notes: {data.get('expectations')}
"""
            send_email(RECEIVER_EMAIL, "New Booking", booking_body)

        return jsonify({"status": "success"})

    except Exception as e:
        print("BOOKING ERROR:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data"}), 400

    required = ["sender_name", "sender_email", "subject", "message"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "error": f"Missing {field}"}), 400

    # Send email
    try:
        if EMAIL and PASSWORD and RECEIVER_EMAIL:
            body = f"From: {data['sender_name']}\nEmail: {data['sender_email']}\nSubject: {data['subject']}\n\n{data['message']}"
            send_email(RECEIVER_EMAIL, f"City Buddy Contact: {data['subject']}", body)
    except Exception as e:
        print(f"Email error: {e}")

    return jsonify({"success": True})

# ADMIN
@app.route("/api/bookings", methods=["GET"])
def get_bookings():
    token = request.headers.get("Authorization")

    if not ADMIN_KEY:
        return jsonify({"error": "Admin key not configured"}), 500

    if token != ADMIN_KEY:
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify(load_bookings())

# RUN
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

