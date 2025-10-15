<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/56ff8831-be3b-410c-a10c-bbdf5443eabe" /><img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/41f3b1e1-6215-4a6b-a4d2-56a65cdbc1db" />RTSP Livestream Viewer - Documentation
📋 Project Overview
A full-stack web application for viewing RTSP livestreams with customizable overlays. Users can stream RTSP video feeds, add text/image overlays, and manage overlay positions and sizes.

🛠 Tech Stack
Backend: Python Flask

Database: MongoDB

Frontend: React.js

Video Streaming: RTSP to HLS conversion

🚀 Setup Instructions
Prerequisites
Python 3.8+

Node.js 14+

MongoDB

FFmpeg

Backend Setup
bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start backend server
python app.py
Server runs on http://localhost:5000

Frontend Setup
bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
Application runs on http://localhost:3000

🎮 How to Use the Application
1. Starting a Stream
Open http://localhost:3000 in your browser

Enter an RTSP URL in the "Stream Configuration" section

Example RTSP URLs:

rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4

rtsp://www.sec2demo.streamlock.net/vod/mp48d9Bix6Runny_115x.mp4

Click "Save URL" to store the stream settings

Click "Start RTSP Stream" to begin streaming

Use video controls: Play/Pause, Volume, Stop Stream

2. Managing Overlays
Adding Overlays
Click "Add Overlay" in the Overlay Manager section

Fill in the overlay details:

Name: Descriptive name for the overlay

Type: Choose "Text" or "Image"

Content:

For text: Enter the text to display

For image: Enter image URL

Position: X and Y coordinates (0-100%)

Size: Width and height in pixels

Click "Create Overlay"

Example Overlay Configurations
Text Overlay (Live Badge):

Name: Live Badge

Type: text

Content: LIVE STREAM

Position: X: 80, Y: 10

Size: Width: 120, Height: 40

Image Overlay (Logo):

Name: Company Logo

Type: image

Content: https://via.placeholder.com/100x50/007bff/ffffff?text=LOGO

Position: X: 10, Y: 10

Size: Width: 100, Height: 50

Editing Overlays
Click "Edit" next to any overlay

Modify the overlay properties

Click "Update Overlay"

Deleting Overlays
Click "Delete" next to any overlay

Confirm deletion in the popup

🔗 API Endpoints
Overlay Management
Method	Endpoint	Description
GET	/api/overlays	Get all overlays
GET	/api/overlays/:id	Get specific overlay
POST	/api/overlays	Create new overlay
PUT	/api/overlays/:id	Update overlay
DELETE	/api/overlays/:id	Delete overlay
Stream Management
Method	Endpoint	Description
GET	/api/stream/settings	Get stream settings
POST	/api/stream/settings	Save stream settings
POST	/api/stream/start	Start RTSP stream
POST	/api/stream/stop	Stop RTSP stream
💾 Data Models
Overlay Model
javascript
{
  "id": "string",
  "name": "string",
  "type": "text|image",
  "content": "string",
  "position": {
    "x": "number",  // 0-100%
    "y": "number"   // 0-100%
  },
  "size": {
    "width": "number",  // pixels
    "height": "number"  // pixels
  },
  "created_at": "datetime"
}
Stream Settings Model
javascript
{
  "rtsp_url": "string",
  "type": "stream"
}
🎯 Features
✅ Implemented
RTSP URL input and validation

Live video streaming with controls (Play/Pause/Volume)

Custom overlay management (CRUD operations)

Overlay positioning and resizing

Real-time overlay display on video

MongoDB data persistence

RESTful API endpoints

🎥 Video Controls
Play/Pause: Start and stop video playback

Volume: Adjust audio level (0-100%)

Stop Stream: Completely stop the current stream

Fullscreen: Native video player fullscreen support

📍 Overlay Features
Text Overlays: Custom text with transparent background

Image Overlays: Logos or images from URLs

Positioning: Drag-and-drop style positioning (X, Y coordinates)

Sizing: Custom width and height in pixels

Live Preview: Real-time display on active video stream

Screenshots
"C:\Users\anude\OneDrive\Pictures\Screenshots\Screenshot (797).png"
"C:\Users\anude\OneDrive\Pictures\Screenshots\Screenshot (798).png"


🐛 Troubleshooting
Common Issues
Video Not Playing:

Check RTSP URL format (must start with rtsp://)

Verify internet connection

Try alternative RTSP test URLs

Overlays Not Showing:

Check overlay position values (0-100%)

Verify image URLs are accessible

Ensure stream is active when adding overlays

Backend Connection Issues:

Verify MongoDB is running

Check if backend server is on port 5000

Confirm all dependencies are installed

FFmpeg Errors:

Install FFmpeg on your system

Add FFmpeg to system PATH

📝 Testing
Test RTSP URLs
text
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
rtsp://www.sec2demo.streamlock.net/vod/mp48d9Bix6Runny_115x.mp4
rtsp://170.93.143.139/rtplive/470011e600ef003a004ee33696235daa
Test Image URLs
text
https://via.placeholder.com/100x50/007bff/ffffff?text=LOGO
https://via.placeholder.com/150x40/28a745/ffffff?text=LIVE
📞 Support
For issues or questions:

Check the browser console for errors (F12)

Verify all services are running

Ensure MongoDB connection is configured

Check network connectivity for RTSP streams


