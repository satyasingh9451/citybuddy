# ===============================
# CITY BUDDY – FINAL SERVER (FIXED)
# ===============================

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os, json, re, smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from time import time

request_log = {}

load_dotenv()

GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")
ADMIN_KEY = os.getenv("ADMIN_KEY")

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
def send_email(data):
    if not GMAIL_ADDRESS:
        return

    try:
        msg = MIMEMultipart()
        msg["From"] = GMAIL_ADDRESS
        msg["To"] = RECEIVER_EMAIL
        msg["Subject"] = f"New Booking - {data['client_name']}"

        body = f"""
Name: {data['client_name']}
Email: {data['client_email']}
Phone: {data['client_phone']}
Service: {data['service_type']}
Date: {data['meetup_date']}
Time: {data['meetup_time']}
Location: {data['meetup_location']}
Notes: {data['expectations']}
"""
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
        server.send_message(msg)
        server.quit()

    except Exception as e:
        print("Email failed:", e)
# API
@app.route("/api/booking", methods=["POST"])
def booking():
    data = request.json
    print(data)

    # Optional: save booking data for your own records
    # save_booking(data)

    # Email sending is disabled per request
    # send_email(data)

    return {"status": "success"}

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
        if GMAIL_ADDRESS:
            msg = MIMEMultipart()
            msg["From"] = GMAIL_ADDRESS
            msg["To"] = RECEIVER_EMAIL
            msg["Subject"] = f"City Buddy Contact: {data['subject']}"
            body = f"From: {data['sender_name']}\nEmail: {data['sender_email']}\nSubject: {data['subject']}\n\n{data['message']}"
            msg.attach(MIMEText(body, "plain"))
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(msg)
            server.quit()
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
    app.run(debug=False)

