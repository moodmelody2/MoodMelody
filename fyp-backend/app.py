from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ultralytics import YOLO
import cv2, numpy as np
from collections import Counter, defaultdict
from fer import FER
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import threading
import time
import os
import requests
import base64

# 🆕 Add these lines for OpenAI
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables (for OPENAI_API_KEY)
load_dotenv()

app = Flask(__name__, static_folder=".")
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/*": {"origins": "https://moodmelody-gz7c7tkgg-moodmelody2s-projects.vercel.app/"}})


# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# -- Models --
yolo_model = YOLO("yolov8n.pt")
emotion_detector = FER(mtcnn=True)

# Spotify credentials
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "d080e4de4c7e42f096579071f7afa910")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "c7cd31acb816407ca8db500f562dae73")

# Try to initialize spotipy client
sp = None
try:
    sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET
    ))
except Exception as e:
    print("Spotipy init warning:", e)
    sp = None

emotion_to_genre = {
    "happy": "pop", "sad": "acoustic", "angry": "rock",
    "surprise": "dance", "fear": "ambient",
    "disgust": "metal", "neutral": "chill"
}

processing_status = {
    "objectDetection": "pending",
    "musicRecommendation": "pending",
    "emotionAnalysis": "pending",
    "storyGeneration": "pending"
}
final_result = {}

# ==========================================
# 🧠 HELPER FUNCTIONS
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
    counts, confs = Counter(), defaultdict(list)
    for frame in sample_frames(video_path):
        try:
            res = yolo_model(frame, verbose=False)[0]
            for b in res.boxes:
                if float(b.conf) < 0.35:
                    continue
                label = res.names[int(b.cls)]
                counts[label] += 1
                confs[label].append(float(b.conf))
        except Exception as e:
            print("YOLO frame error:", e)
    return [{"label": l, "count": c, "avg_conf": float(round(np.mean(confs[l]), 3))} for l, c in counts.items()]

def detect_emotion(video_path):
    counts = Counter()
    for frame in sample_frames(video_path):
        try:
            faces = emotion_detector.detect_emotions(frame)
            for face in faces:
                label, conf = max(face["emotions"].items(), key=lambda x: x[1])
                if conf < 0.35:
                    continue
                counts[label] += 1
        except Exception as e:
            print("Emotion frame error:", e)
    return max(counts, key=counts.get) if counts else "neutral"

def get_spotify_track_for_genre(genre):
    try:
        if sp:
            result = sp.search(q=f"genre:{genre} track", type="track", limit=1)
            items = result.get("tracks", {}).get("items", [])
            if items:
                t = items[0]
                return {
                    "track_name": t.get("name", "Unknown"),
                    "artist": t.get("artists", [{}])[0].get("name", "Unknown"),
                    "url": t.get("external_urls", {}).get("spotify", "#")
                }
    except Exception as e:
        print("Spotipy search error:", e)

    # fallback
    return {"track_name": "Unknown", "artist": "Unknown", "url": "#"}

# ==========================================
# 🆕 DEFINE generate_long_story()
# ==========================================
def generate_long_story(objects, emotion, keyword=None, max_words=130):
    """
    Generates a cinematic short story using OpenAI GPT.
    """
    try:
        prompt = (
            f"Write a cinematic and emotional story of about {max_words} words.\n"
            f"Emotion: {emotion}\n"
            f"Objects in scene: {', '.join(objects) if objects else 'none'}\n"
            f"Theme: {keyword or 'everyday life'}\n\n"
            "Make it descriptive, with vivid sensory imagery, realistic tone, "
            "and a reflective ending."
        )

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a creative and poetic storyteller."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600,
            temperature=0.8
        )

        return completion.choices[0].message.content.strip()

    except Exception as e:
        print("❌ Error in generate_long_story():", e)
        return f"(Story generation failed: {e})"

# ==========================================
# ROUTES
# ==========================================

@app.route("/")
def index():
    return jsonify({
        "message": "✅ MoodMelody Flask backend is running successfully!",
        "available_endpoints": [
            "/upload",
            "/status",
            "/generate_story"
        ]
    })


@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory('.', filename, as_attachment=False)

@app.route("/status", methods=["GET"])
def get_status():
    return jsonify({
        "status": processing_status,
        "result": {
            "detected_objects": final_result.get("detected_objects", []),
            "dominant_emotion": final_result.get("dominant_emotion", "neutral"),
            "recommended_song": final_result.get("recommended_song", {
                "track_name": "Unknown",
                "artist": "Unknown",
                "url": "#"
            }),
            "generated_story": final_result.get("generated_story", "")
        }
    })

@app.route("/generate_story", methods=["POST"])
def generate_story():
    try:
        data = request.get_json()
        objects = data.get("objects", [])
        emotion = data.get("emotion", "neutral")
        keyword = data.get("keyword", "moment")

        story = generate_long_story(objects, emotion, keyword)
        return jsonify({"status": "success", "generated_story": story})

    except Exception as e:
        print("❌ Error generating story:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/upload", methods=["POST"])
def handle_video():
    global processing_status, final_result
    if "video" not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    file = request.files["video"]
    filename = "uploaded.mp4"
    file.save(filename)
    video_url = f"/uploads/{filename}"
    # video_url = f"http://127.0.0.1:5000/uploads/{filename}"

    for k in processing_status:
        processing_status[k] = "pending"
    final_result.clear()

    def process_video():
        global processing_status, final_result
        try:
            processing_status["objectDetection"] = "processing"
            objects_raw = detect_objects(filename)
            objects_labels = [o["label"] for o in objects_raw]
            processing_status["objectDetection"] = "completed"

            processing_status["emotionAnalysis"] = "processing"
            dominant_emotion = detect_emotion(filename)
            processing_status["emotionAnalysis"] = "completed"

            processing_status["musicRecommendation"] = "processing"
            genre = emotion_to_genre.get(dominant_emotion, "pop")
            song = get_spotify_track_for_genre(genre)
            processing_status["musicRecommendation"] = "completed"

            processing_status["storyGeneration"] = "processing"
            story = generate_long_story(objects_labels, dominant_emotion)
            processing_status["storyGeneration"] = "completed"

            final_result.update({
                "detected_objects": objects_labels,
                "dominant_emotion": dominant_emotion,
                "recommended_song": song,
                "generated_story": story
            })
            print("✅ Processing completed:", final_result)

        except Exception as e:
            print("Processing thread error:", e)
            for k, v in processing_status.items():
                if v != "completed":
                    processing_status[k] = "failed"
            final_result.update({"error": str(e)})

    threading.Thread(target=process_video, daemon=True).start()

    return jsonify({"message": "Video upload accepted", "video_url": video_url})

# ==========================================
# MAIN
# ==========================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Flask backend running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
