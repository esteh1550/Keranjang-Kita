import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Zap, ZapOff } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  useEffect(() => {
    const elementId = "reader";
    let isMounted = true;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          if (!isMounted) return;
          setHasCamera(true);
          
          const html5QrCode = new Html5Qrcode(elementId, {
            formatsToSupport: [
               Html5QrcodeSupportedFormats.EAN_13,
               Html5QrcodeSupportedFormats.EAN_8,
               Html5QrcodeSupportedFormats.UPC_A,
               Html5QrcodeSupportedFormats.UPC_E,
               Html5QrcodeSupportedFormats.CODE_128,
               Html5QrcodeSupportedFormats.QR_CODE
            ],
            verbose: false
          });
          scannerRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
               // Play vibration
               if (navigator.vibrate) {
                 navigator.vibrate(200);
               }
               onScanSuccess(decodedText);
            },
            (errorMessage) => {
              // Ignore parse errors, they flood the console
            }
          );
        } else {
          setHasCamera(false);
        }
      } catch (err) {
        console.error("Error starting scanner", err);
        setHasCamera(false);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(err => console.error("Failed to stop scanner", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTorch = () => {
    if (scannerRef.current) {
      scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn }] as any
      })
      .then(() => setTorchOn(!torchOn))
      .catch(err => console.error("Torch not supported", err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
          <X size={24} />
        </button>
        <div className="text-white font-semibold">Scan Barcode</div>
        <button onClick={toggleTorch} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
          {torchOn ? <Zap size={24} className="fill-yellow-400 text-yellow-400" /> : <ZapOff size={24} />}
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <div id="reader" className="w-full max-w-md overflow-hidden rounded-lg"></div>
        {/* Overlay Guide */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           <div className="w-64 h-64 border-2 border-green-500 rounded-lg opacity-50 relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-400 -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-400 -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-400 -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-400 -mb-1 -mr-1"></div>
           </div>
        </div>
      </div>

      <div className="p-6 bg-black text-center">
        <p className="text-gray-300 text-sm">Arahkan kamera ke barcode produk.</p>
        {hasCamera === false && (
          <p className="text-red-400 mt-2">Kamera tidak ditemukan atau izin ditolak.</p>
        )}
      </div>
    </div>
  );
};

export default Scanner;