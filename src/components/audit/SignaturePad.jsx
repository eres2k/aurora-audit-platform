import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SignaturePadLib from 'signature_pad';
import { Eraser, Check } from 'lucide-react';
import Button from '../ui/Button';

export default function SignaturePad({ onSave, onCancel }) {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up high DPI canvas
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);

    signaturePadRef.current = new SignaturePadLib(canvas, {
      backgroundColor: 'rgb(248, 250, 252)',
      penColor: 'rgb(15, 23, 42)',
    });

    signaturePadRef.current.addEventListener('beginStroke', () => {
      setIsEmpty(false);
    });

    return () => {
      signaturePadRef.current?.off();
    };
  }, []);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (signaturePadRef.current?.isEmpty()) {
      return;
    }
    const dataUrl = signaturePadRef.current?.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-48 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 touch-none bg-slate-50"
          style={{ touchAction: 'none' }}
        />
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-sm text-slate-400 pointer-events-none">
          Sign above
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          icon={Eraser}
          onClick={handleClear}
          className="flex-1"
        >
          Clear
        </Button>
        <Button
          variant="primary"
          icon={Check}
          onClick={handleSave}
          disabled={isEmpty}
          className="flex-1"
        >
          Save Signature
        </Button>
      </div>
    </motion.div>
  );
}
