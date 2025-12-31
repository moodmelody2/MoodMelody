from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
from collections import Counter, defaultdict
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import threading
import os
import time
from openai import OpenAI
from dotenv import load_dotenv

# ------------------------------------------
# Load environment variables
# ------------------------------------------
load_dotenv()

# ------------------------------------------
# Flask App Setup
# ------------------------------------------
app = Flask(__name__, static_folder=".")
app.config['MAX_CONTENT_LENGTH'] = 150 * 1024 * 1024  # 150MB max
CORS(app, resources={r"/*": {"origins": "*"}})  # You can restrict to your frontend URL

# ------------------------------------------
# OpenAI Client
# ------------------------------------------
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ------------------------------------------
# Lazy-loaded Models
# ------------------------------------------
yolo_model = None
emotion_detector = None

def get_yolo():
    global yolo_model
    if yolo_model is None:
        from ultralytics import YOLO
        yolo_model = YOLO("yolov8n.pt")
    return yolo_model

def get_emotion_detector():
    global emotion_detector
    if emotion_detector is None:
        from fer import FER
        emotion_detector = FER(mtcnn=True)
    return emotion_detector

# ------------------------------------------
# Spotify Setup
# ------------------------------------------
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

sp = None
if SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET:
    try:
        sp = spotipy.Spotify(
            auth_manager=SpotifyClientCredentials(
                client_id=SPOTIFY_CLIENT_ID,
                client_secret=SPOTIFY_CLIENT_SECRET
            )
        )
    except Exception as e:
        print("Spotipy init warning:", e)

# ------------------------------------------
# Mappings & Status
# ------------------------------------------
emotion_to_genre = {
    "happy": "pop",
    "sad": "acoustic",
    "angry": "rock",
    "surprise": "dance",
    "fear": "ambient",
    "disgust": "metal",
    "neutral": "chill"
}

processing_status = {
    "objectDetection": "pending",
    "musicRecommendation": "pending",
    "emotionAnalysis": "pending",
    "storyGeneration": "pending"
}

final_result = {}

# ==========================================
# Helper Functions
# ==========================================
def sample_frames(video_path, target_fps=1, max_frames=60):
    cap = cv2.VideoCapture(video_path)
    src_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    step = max(1, int(round(src_fps / float(target_fps))))
    idx = collected = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if idx % step == 0:
            yield cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            collected += 1
            if collected >= max_frames:
                break
        idx += 1
    cap.release()

def detect_objects(video_path):
    model = get_yolo()
    counts, confs = Counter(), defaultdict(list)
    for frame in sample_frames(video_path):
        try:
            res = model(frame, verbose=False)[0]
            for b in res.boxes:
                if float(b.conf) < 0.35:
                    continue
                label = res.names[int(b.cls)]
                counts[label] += 1
                confs[label].append(float(b.conf))
        except Exception as e:
            print("YOLO frame error:", e)
    return [{"label": l, "count": c, "avg_conf": float(round(np.mean(confs[l]),3))} for l,c in counts.items()]

def detect_emotion(video_path):
    detector = get_emotion_detector()
    counts = Counter()
    for frame in sample_frames(video_path):
        try:
            faces = detector.detect_emotions(frame)
            for face in faces:
                label, conf = max(face["emotions"].items(), key=lambda x: x[1])
                if conf >= 0.35:
                    counts[label] += 1
        except Exception as e:
            print("Emotion frame error:", e)
    return max(counts, key=counts.get) if counts else "neutral"

def get_spotify_track_for_genre(genre):
    if not sp:
        return {"track_name": "Unknown", "artist": "Unknown", "url": "#"}
    try:
        result = sp.search(q=f"genre:{genre} track", type="track", limit=1)
        items = result.get("tracks", {}).get("items", [])
        if items:
            t = items[0]
            return {
                "track_name": t.get("name"),
                "artist": t.get("artists", [{}])[0].get("name"),
                "url": t.get("external_urls", {}).get("spotify")
            }
    except Exception as e:
        print("Spotify error:", e)
    return {"track_name": "Unknown", "artist": "Unknown", "url": "#"}

def generate_long_story(objects, emotion, keyword=None, max_words=130):
    try:
        prompt = (
            f"Write a cinematic and emotional story of about {max_words} words.\n"
            f"Emotion: {emotion}\n"
            f"Objects in scene: {', '.join(objects) if objects else 'none'}\n"
            f"Theme: {keyword or 'everyday life'}\n\n"
            "Make it descriptive and reflective."
        )
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a poetic storyteller."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600,
            temperature=0.8
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"(Story generation failed: {e})"

# ==========================================
# Routes
# ==========================================
@app.route("/")
def index():
    return jsonify({"message": "✅ MoodMelody backend running"})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/status", methods=["GET"])
def get_status():
    return jsonify({
        "status": processing_status,
        "result": {
            "detected_objects": final_result.get("detected_objects", []),
            "dominant_emotion": final_result.get("dominant_emotion", "neutral"),
            "recommended_song": final_result.get("recommended_song", {"track_name":"Unknown","artist":"Unknown","url":"#"}),
            "generated_story": final_result.get("generated_story", "")
        }
    })

@app.route("/upload", methods=["POST"])
def handle_video():
    global processing_status, final_result

    # Check file
    file = request.files.get("video")
    if not file:
        return jsonify({"error": "No video uploaded"}), 400

    # Save file to uploads folder
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    filename = "uploaded.mp4"  # same as old working code
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Always return this URL
    video_url = f"/uploads/{filename}"

    # Reset statuses
    for k in processing_status:
        processing_status[k] = "pending"
    final_result.clear()

    def process_video():
        try:
            # Object detection
            processing_status["objectDetection"] = "processing"
            objs = detect_objects(filepath)
            labels = [o["label"] for o in objs]
            processing_status["objectDetection"] = "completed"

            # Emotion analysis
            processing_status["emotionAnalysis"] = "processing"
            emotion = detect_emotion(filepath)
            processing_status["emotionAnalysis"] = "completed"

            # Music recommendation
            processing_status["musicRecommendation"] = "processing"
            song = get_spotify_track_for_genre(emotion_to_genre.get(emotion, "pop"))
            processing_status["musicRecommendation"] = "completed"

            # Story generation
            processing_status["storyGeneration"] = "processing"
            story = generate_long_story(labels, emotion)
            processing_status["storyGeneration"] = "completed"

            # Save final result
            final_result.update({
                "detected_objects": labels,
                "dominant_emotion": emotion,
                "recommended_song": song,
                "generated_story": story
            })
            print("✅ Processing completed")

        except Exception as e:
            print("Processing thread error:", e)
            for k, v in processing_status.items():
                if v != "completed":
                    processing_status[k] = "failed"
            final_result.update({"error": str(e)})

    threading.Thread(target=process_video, daemon=True).start()

    # Return exactly like old code
    return jsonify({
        "message": "Video upload accepted",
        "video_url": video_url
    })


# ==========================================
# Main
# ==========================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Use Render's port
    app.run(host="0.0.0.0", port=port)
