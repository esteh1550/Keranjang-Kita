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
               // Play vibration - Short pulse (100ms)
               if (navigator.vibrate) {
                 navigator.vibrate(100);
               }
               onScanSuccess(decodedText);
            },
            (errorMessage) => {
              // Ignore parse errors
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
        <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-colors">
          <X size={24} />
        </button>
        <div className="text-white font-semibold tracking-wide">Scan Barcode</div>
        <button onClick={toggleTorch} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-colors">
          {torchOn ? <Zap size={24} className="fill-yellow-400 text-yellow-400" /> : <ZapOff size={24} />}
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <div id="reader" className="w-full max-w-md overflow-hidden rounded-lg"></div>
        {/* Overlay Guide */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           {/* Yellow themed guide box with shadow to dim outside area */}
           <div className="w-64 h-64 border-2 border-yellow-400/50 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              {/* Corner Markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-400 -mt-1 -ml-1 rounded-tl-sm"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-400 -mt-1 -mr-1 rounded-tr-sm"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-400 -mb-1 -ml-1 rounded-bl-sm"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-400 -mb-1 -mr-1 rounded-br-sm"></div>
              
              {/* Scan Line Animation */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-yellow-400/80 shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
           </div>
        </div>
      </div>

      <div className="p-8 bg-black text-center z-10">
        <p className="text-yellow-100/90 text-sm font-medium">Arahkan kamera ke barcode produk</p>
        {hasCamera === false && (
          <p className="text-red-400 mt-2 text-sm">Kamera tidak ditemukan atau izin ditolak.</p>
        )}
      </div>

      {/* Styles for scan animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;