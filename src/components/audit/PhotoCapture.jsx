import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, RotateCcw, Image } from 'lucide-react';
import Button from '../ui/Button';

export default function PhotoCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    onCapture(capturedImage);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 safe-top">
        <button onClick={onClose} className="p-2 text-white">
          <X size={24} />
        </button>
        <h3 className="text-white font-semibold">Capture Photo</h3>
        <button
          onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')}
          className="p-2 text-white"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {capturedImage ? (
            <motion.img
              key="captured"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={capturedImage}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
            >
              <Camera size={64} className="text-slate-500 mb-4" />
              <p className="text-white mb-4">{error}</p>
              <Button
                variant="secondary"
                icon={Image}
                onClick={() => fileInputRef.current?.click()}
              >
                Choose from Gallery
              </Button>
            </motion.div>
          ) : (
            <motion.video
              key="video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </AnimatePresence>

        {/* Grid Overlay */}
        {!capturedImage && !error && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 safe-bottom">
        {capturedImage ? (
          <div className="flex gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              icon={RotateCcw}
              onClick={retake}
            >
              Retake
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={Check}
              onClick={confirmPhoto}
            >
              Use Photo
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-full bg-white/10 text-white"
            >
              <Image size={24} />
            </button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center"
              disabled={!!error}
            >
              <div className="w-16 h-16 rounded-full border-4 border-slate-900" />
            </motion.button>
            <div className="w-14" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
