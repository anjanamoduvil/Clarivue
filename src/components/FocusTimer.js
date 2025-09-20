import React, { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';

export default function FocusTimer({ onFocusLost, notes }) {
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes by default
  const [duration, setDuration] = useState(1500);
  const [isActive, setIsActive] = useState(false);
  const [webcamStarted, setWebcamStarted] = useState(false);
  const [userPresent, setUserPresent] = useState(true);
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  const videoRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const alertSound = useRef(new Audio('data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA=='));

  useEffect(() => {
    const cleanup = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopWebcam();
      setWebcamStarted(false);
    };

    if (isActive && webcamStarted && userPresent) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            cleanup();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return cleanup;
  }, [isActive, webcamStarted, userPresent]);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const stopWebcam = async () => {
    try {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    } catch (error) {
      console.error('Error stopping webcam:', error);
    }
  };

  const startWebcam = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support webcam access");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Load the TinyFaceDetector model from the /models folder
      await faceapi.nets.tinyFaceDetector.loadFromUri(process.env.PUBLIC_URL + '/models');

      // Start detection interval to check for face every second
      detectionIntervalRef.current = setInterval(async () => {
        if (videoRef.current) {
          const detection = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          );
          if (!detection) {
            console.log('No face detected');
            if (userPresent) {
              setUserPresent(false);
              alertSound.current.play();
              onFocusLost();
            }
          } else {
            setUserPresent(true);
            console.log('Face detected');
          }
        }
      }, 1000);

      setWebcamStarted(true);
      setIsActive(true);
      setUserPresent(true);
    } catch (error) {
      console.error("Error starting webcam:", error);
      alert(error.message || "Could not start webcam. Please ensure you have granted camera permissions.");
      setWebcamStarted(false);
      setIsActive(false);
    }
  };

  const stopTimer = async () => {
    setIsActive(false);
    try {
      await stopWebcam();
      setWebcamStarted(false);
    } catch (error) {
      console.error('Error stopping webcam:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="focus-timer">
      <div className="webcam-container">
        <video
          ref={videoRef}
          id="faceVideo"
          autoPlay
          muted
          playsInline
          style={{
            display: 'block',
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            width: '240px',
            height: '180px',
            borderRadius: '10px',
            border: '2px solid #4CAF50',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        ></video>
        {isCalibrating && (
          <div className="calibration-overlay">
            <div className="calibration-message">
              Calibrating webcam...
              <br />
              Please look directly at the camera and move your head slightly
            </div>
          </div>
        )}
      </div>
      {!isActive ? (
        <div>
          <div className="timer-controls">
            <div className="status-message">
              {webcamStarted ? "Webcam initialized successfully!" : "Click start to enable focus monitoring"}
            </div>
            <div className="timer-setup">
              <label>Study Duration (minutes):</label>
              <input
                type="number"
                min="1"
                max="120"
                value={Math.floor(timeLeft / 60)}
                onChange={(e) => {
                  const mins = parseInt(e.target.value) || 25;
                  setTimeLeft(mins * 60);
                }}
                className="duration-input"
              />
            </div>
          </div>
          <button 
            className="button button-primary"
            onClick={startWebcam}
          >
            Start Focus Timer
          </button>
        </div>
      ) : (
        <div>
          <div className="timer-display">
            {formatTime(timeLeft)}
          </div>
          <div className="focus-status">
            {userPresent ? (
              <span className="status-good">Focused ✓</span>
            ) : (
              <span className="status-warning">Focus Lost! ⚠</span>
            )}
          </div>
          <button
            className="button button-danger"
            onClick={stopTimer}
          >
            Stop Focus Timer
          </button>
        </div>
      )}
    </div>
  );
}