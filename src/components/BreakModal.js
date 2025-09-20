import React, { useEffect } from "react";

export default function BreakModal({ show, onClose }) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="break-modal">
        <h2>Time for a Break! 🌟</h2>
        <p>
          Your eyes need rest. Take a moment to:
        </p>
        <ul>
          <li>Stand up and stretch</li>
          <li>Drink some water</li>
          <li>Look at something 20 feet away for 20 seconds</li>
          <li>Take deep breaths</li>
        </ul>
        <button
          className="button button-primary"
          onClick={onClose}
        >
          Ready to Continue!
        </button>
      </div>
    </>
  );
}
