from flask import Flask, request, send_from_directory, render_template, url_for
from pywebpush import webpush, WebPushException
import random, os, json

app = Flask(__name__)

# -------------------- PERSISTENT SUBSCRIPTIONS --------------------
SUBS_FILE = "subscriptions.json"

def load_subscriptions():
    if not os.path.exists(SUBS_FILE):
        return []
    with open(SUBS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_subscriptions(subs):
    with open(SUBS_FILE, "w") as f:
        json.dump(subs, f)

# -------------------- VAPID CONFIG --------------------
VAPID_PRIVATE_KEY = "ifdb_gOVdDOJQEroNgSqDenNI64-uIPHMRI4JWiKwek"
VAPID_CLAIMS = {"sub": "mailto:zenovix05@gmail.com"}

# -------------------- SERVICE WORKER --------------------
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

    media_url = f"/view/{filename}"
    rnd_file = random.choice(LOVE_FILE)
    payload = {
        "title": "New Media <3",
        "body": rnd_file,
        "mediaUrl": media_url
    }

    subs = load_subscriptions()
    remove_subs = []

    for sub in subs:
        try:
            webpush(
                subscription_info=sub,
                data=json.dumps(payload),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
            print(f"Sent push to {sub['endpoint']}")
        except WebPushException as e:
            print("Push error (removing sub):", e)
            remove_subs.append(sub)

    if remove_subs:
        subs = [s for s in subs if s not in remove_subs]
        save_subscriptions(subs)

    return "OK"

@app.get("/uploads/<path:filename>")
def serve_media(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# -------------------- VIEW ROUTE --------------------
@app.get("/view/<path:filename>")
def view_media(filename):
    uploaded_url = url_for('serve_media', filename=filename, _external=True)
    return render_template("view_media.html", media_url=uploaded_url)

# -------------------- SUBSCRIPTION ROUTE --------------------
@app.post("/save-subscription")
def save_subscription():
    sub = request.get_json()
    subs = load_subscriptions()
    
    if sub not in subs:
        subs.append(sub)
        save_subscriptions(subs)
        print("New subscription added:", sub)

    return "OK"

# -------------------- SEND LOVE MESSAGE --------------------
@app.get("/sendlove")
def send_love():
    subs = load_subscriptions()
    remove_subs = []

    for sub in subs:
        try:
            payload = {
                "title": "Love Alert <3",
                "body": random.choice(LOVE_MESSAGES),
                "mediaUrl": None
            }
            webpush(
                subscription_info=sub,
                data=json.dumps(payload),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
            print(f"Sent push to {sub['endpoint']}")
        except WebPushException as e:
            print("Push Failed:", e)
            remove_subs.append(sub)

    if remove_subs:
        subs = [s for s in subs if s not in remove_subs]
        save_subscriptions(subs)

    return "Your love has been sent!"
