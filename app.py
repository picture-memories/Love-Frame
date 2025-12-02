from flask import Flask, request, send_from_directory, render_template
from pywebpush import webpush, WebPushException
import random, os, json

app = Flask(__name__)

# -------------------- Persistent Subscriptions --------------------
SUB_FILE = "subscriptions.json"
if os.path.exists(SUB_FILE):
    with open(SUB_FILE, "r") as f:
        subscriptions = json.load(f)
else:
    subscriptions = []

VAPID_PRIVATE_KEY = "ifdb_gOVdDOJQEroNgSqDenNI64-uIPHMRI4JWiKwek"
VAPID_CLAIMS = {"sub": "mailto:zenovix05@gmail.com"}

# -------------------- Service Worker --------------------
@app.route('/service-worker.js')
def service_worker():
    return send_from_directory('.', 'service-worker.js')

# -------------------- HOME ROUTE --------------------
@app.get("/")
def home():
    return render_template("index.html")

# -------------------- LOVE MESSAGES --------------------
LOVE_FILE = [
    "Your love has sent you a photo/video <3",
    "Your sweetheart has sent you a photo/video <3",
    "Your angel has sent you a photo/video <3",
    "Your partner has sent you a photo/video <3",
    "They love you so much and they just sent you a photo/video! <3"
]

LOVE_MESSAGES = [
    "They are thinking of you right now, and always are <3",
    "You are the reason their heart smiles <3",
    "They love you so much there arent words for them to describe it yet <3",
    "A little reminder: You're so amazing, special, loved, beautiful and they are always so proud of you! <3",
    "Surprise hugs and kisses!! <3",
    "Through the hardest times, they will always be there for you no matter what <3",
    "They wish we could be irl together, and are determined to make that a reality one day <3",
    "They think they are the luckiest person in all of existence to be with you!! <3",
    "You are their sweet angel!! And they love you so much <3",
    "You are their sweetheart!! And they love you so much <3"
]

# -------------------- UPLOAD HANDLING --------------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/uploads")
def upload_media():
    file = request.files.get("media")
    if not file:
        return "No file", 400

    filename = file.filename
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    media_url = f"/uploads/{filename}"

    rnd_file = random.choice(LOVE_FILE)
    payload = {
        "title": "New Media <3",
        "body": rnd_file,
        "mediaUrl": media
