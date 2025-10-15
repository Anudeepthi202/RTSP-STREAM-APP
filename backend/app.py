from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId
from datetime import datetime
import os
import subprocess
import atexit
import time
import glob

app = Flask(__name__)
CORS(app)

# Configuration
app.config["MONGO_URI"] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/rtsp_app')
mongo = PyMongo(app)

# Global variables for stream processing
ffmpeg_process = None
current_stream_url = ""

# Helper function to validate ObjectId
def is_valid_object_id(id):
    return ObjectId.is_valid(id)

# Overlay model
class Overlay:
    def __init__(self, name, type, content, position, size):
        self.name = name
        self.type = type
        self.content = content
        self.position = position
        self.size = size
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'name': self.name,
            'type': self.type,
            'content': self.content,
            'position': self.position,
            'size': self.size,
            'created_at': self.created_at
        }

# Overlay CRUD Endpoints
@app.route('/api/overlays', methods=['GET'])
def get_overlays():
    """Get all overlays"""
    try:
        overlays = list(mongo.db.overlays.find())
        for overlay in overlays:
            overlay['id'] = str(overlay['_id'])
            del overlay['_id']
        return jsonify(overlays)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/overlays', methods=['POST'])
def create_overlay():
    """Create a new overlay"""
    try:
        data = request.get_json()
        
        overlay = Overlay(
            name=data['name'],
            type=data['type'],
            content=data['content'],
            position=data['position'],
            size=data['size']
        )
        
        result = mongo.db.overlays.insert_one(overlay.to_dict())
        return jsonify({'id': str(result.inserted_id), 'message': 'Overlay created successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/overlays/<overlay_id>', methods=['GET'])
def get_overlay(overlay_id):
    """Get a specific overlay by ID"""
    try:
        if not is_valid_object_id(overlay_id):
            return jsonify({'error': 'Invalid overlay ID'}), 400
            
        overlay = mongo.db.overlays.find_one({'_id': ObjectId(overlay_id)})
        if not overlay:
            return jsonify({'error': 'Overlay not found'}), 404
            
        overlay['id'] = str(overlay['_id'])
        del overlay['_id']
        return jsonify(overlay)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/overlays/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    """Update an existing overlay"""
    try:
        if not is_valid_object_id(overlay_id):
            return jsonify({'error': 'Invalid overlay ID'}), 400
            
        data = request.get_json()
        update_data = {
            'name': data['name'],
            'type': data['type'],
            'content': data['content'],
            'position': data['position'],
            'size': data['size'],
            'updated_at': datetime.utcnow()
        }
        
        result = mongo.db.overlays.update_one(
            {'_id': ObjectId(overlay_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Overlay not found'}), 404
            
        return jsonify({'message': 'Overlay updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/overlays/<overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    """Delete an overlay"""
    try:
        if not is_valid_object_id(overlay_id):
            return jsonify({'error': 'Invalid overlay ID'}), 400
            
        result = mongo.db.overlays.delete_one({'_id': ObjectId(overlay_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Overlay not found'}), 404
            
        return jsonify({'message': 'Overlay deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Stream Management Endpoints
@app.route('/api/stream/start', methods=['POST'])
def start_stream():
    """Convert RTSP to HLS for browser playback"""
    global ffmpeg_process, current_stream_url
    try:
        data = request.get_json()
        rtsp_url = data['rtsp_url']
        
        # Stop existing stream
        stop_stream()
        
        # Create HLS directory
        os.makedirs('static/hls', exist_ok=True)
        
        # Clean up any existing files
        for file in glob.glob('static/hls/stream*'):
            try:
                os.remove(file)
            except:
                pass
        
        # Convert RTSP to HLS - WORKING COMMAND
        cmd = [
            'ffmpeg',
            '-i', rtsp_url,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-hls_time', '4',
            '-hls_list_size', '6',
            '-hls_flags', 'delete_segments',
            '-f', 'hls',
            'static/hls/stream.m3u8'
        ]
        
        print(f"🟡 Starting FFmpeg: {' '.join(cmd)}")
        
        # Start FFmpeg in background
        ffmpeg_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.PIPE
        )
        current_stream_url = rtsp_url
        
        # Wait for HLS file to be created
        max_attempts = 10
        for i in range(max_attempts):
            if os.path.exists('static/hls/stream.m3u8'):
                file_size = os.path.getsize('static/hls/stream.m3u8')
                if file_size > 0:
                    print(f"✅ HLS file created successfully (size: {file_size} bytes)")
                    break
            print(f"⏳ Waiting for HLS file... attempt {i+1}/{max_attempts}")
            time.sleep(1)
        else:
            print("❌ HLS file was not created in time")
            return jsonify({'error': 'HLS file not created'}), 400
        
        return jsonify({
            'message': 'Stream started successfully',
            'hls_url': '/static/hls/stream.m3u8'
        })
        
    except Exception as e:
        print(f"🔴 Stream start error: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/stream/stop', methods=['POST'])
def stop_stream():
    """Stop the current stream"""
    global ffmpeg_process
    try:
        if ffmpeg_process:
            ffmpeg_process.terminate()
            ffmpeg_process.wait(timeout=5)
            ffmpeg_process = None
            print("🟡 Stream stopped successfully")
        return jsonify({'message': 'Stream stopped successfully'})
    except Exception as e:
        print(f"🔴 Stream stop error: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/stream/status', methods=['GET'])
def get_stream_status():
    """Get current stream status"""
    return jsonify({
        'is_running': ffmpeg_process is not None,
        'current_url': current_stream_url,
        'hls_url': '/static/hls/stream.m3u8' if ffmpeg_process else None
    })

@app.route('/api/stream/settings', methods=['POST'])
def save_stream_settings():
    """Save RTSP stream settings"""
    try:
        data = request.get_json()
        result = mongo.db.settings.update_one(
            {'type': 'stream'},
            {'$set': {'rtsp_url': data.get('rtsp_url', '')}},
            upsert=True
        )
        return jsonify({'message': 'Stream settings saved successfully'})
    except Exception as e:
        print(f"Error in save_stream_settings: {str(e)}")
        return jsonify({'error': 'Failed to save settings'}), 400

@app.route('/api/stream/settings', methods=['GET'])
def get_stream_settings():
    """Get RTSP stream settings"""
    try:
        settings = mongo.db.settings.find_one({'type': 'stream'})
        if settings:
            # Remove MongoDB _id as it's not JSON serializable
            if '_id' in settings:
                settings['id'] = str(settings['_id'])
                del settings['_id']
            return jsonify(settings)
        else:
            # Return default settings if none exist
            return jsonify({'rtsp_url': ''})
    except Exception as e:
        print(f"Error in get_stream_settings: {str(e)}")
        return jsonify({'error': 'Failed to load settings'}), 500

# Serve HLS files
@app.route('/static/hls/<filename>')
def serve_hls_file(filename):
    """Serve HLS files directly"""
    try:
        return send_from_directory('static/hls', filename)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Server is running'})

# Cleanup function
def cleanup_stream():
    global ffmpeg_process
    if ffmpeg_process:
        ffmpeg_process.terminate()

# Register cleanup when app exits
atexit.register(cleanup_stream)

if __name__ == '__main__':
    app.run(debug=True, port=5000)