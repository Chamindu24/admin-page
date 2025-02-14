import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRCodeReaderProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

const QRCodeReader: React.FC<QRCodeReaderProps> = ({ onScanSuccess, onScanFailure }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null); // Store scanner instance

  useEffect(() => {
    if (!qrCodeRef.current) return;

    const html5QrCode = new Html5Qrcode('qr-code-reader');
    html5QrCodeRef.current = html5QrCode; // Save reference

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        console.log('QR Code scanned successfully:', decodedText);
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        console.error('QR Code scan failed:', errorMessage);
        onScanFailure?.(errorMessage);
      }
    ).catch((err) => {
      console.error('Error starting QR code scanner:', err);
    });

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          console.log('QR Code scanning stopped.');
        }).catch((err) => {
          console.error('Error stopping QR code scanner:', err);
        });
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id="qr-code-reader" ref={qrCodeRef} style={{ width: '100%', height: 'auto' }} />;
};

export default QRCodeReader;
