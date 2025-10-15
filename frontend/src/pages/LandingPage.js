import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import OverlayManager from '../components/OverlayManager';
import { streamAPI } from '../services/api';
import './LandingPage.css';

const LandingPage = () => {
  const [rtspUrl, setRtspUrl] = useState('');
  const [overlays, setOverlays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load stream settings on component mount
  useEffect(() => {
    loadStreamSettings();
  }, []);

  const loadStreamSettings = async () => {
    try {
      const response = await streamAPI.getSettings();
      if (response.data.success) {
        setRtspUrl(response.data.data.rtsp_url || '');
      }
    } catch (error) {
      console.error('Error loading stream settings:', error);
    }
  };

  const handleSaveStreamUrl = async () => {
    if (!rtspUrl.trim()) {
      alert('Please enter an RTSP URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await streamAPI.saveSettings({ rtsp_url: rtspUrl });
      if (response.data.success) {
        alert('Stream settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving stream settings:', error);
      alert('Failed to save stream settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearStreamUrl = () => {
    setRtspUrl('');
  };

  return (
    <div className="landing-page">
      <header className="app-header">
        <h1>🎥 RTSP Livestream Viewer</h1>
        <p>View RTSP streams with customizable overlays</p>
      </header>

      <div className="stream-config-section">
        <div className="config-card">
          <h3>Stream Configuration</h3>
          <div className="url-input-group">
            <input
              type="text"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              placeholder="Enter RTSP URL (e.g., rtsp://example.com/stream)"
              className="url-input"
            />
            <button 
              onClick={handleSaveStreamUrl}
              disabled={isLoading || !rtspUrl.trim()}
              className="save-btn"
            >
              {isLoading ? 'Saving...' : '💾 Save URL'}
            </button>
            <button 
              onClick={handleClearStreamUrl}
              className="clear-btn"
            >
              🗑️ Clear
            </button>
          </div>
          <div className="url-examples">
            <small>
              <strong>Example RTSP URLs for testing:</strong><br />
              • rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4<br />
              • Use services like RTSP.me for temporary test streams
            </small>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="video-section">
          <VideoPlayer rtspUrl={rtspUrl} overlays={overlays} />
        </div>
        
        <div className="overlay-section">
          <OverlayManager onOverlaysUpdate={setOverlays} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;