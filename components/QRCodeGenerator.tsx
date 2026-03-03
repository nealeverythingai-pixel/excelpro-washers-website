'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  url?: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ 
  url = 'https://excelprowashers.com',
  size = 256,
  className = ''
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });

      // Generate download URL
      QRCode.toDataURL(url, {
        width: size,
        margin: 2
      }).then(dataUrl => {
        setDownloadUrl(dataUrl);
      });
    }
  }, [url, size]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'excelpro-washers-qr-code.png';
    link.href = downloadUrl;
    link.click();
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
      <button
        onClick={handleDownload}
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
      >
        Download QR Code
      </button>
    </div>
  );
}
