import React, { useRef, useState, useEffect } from "react";
import { Modal, Button } from "antd";
import toast from "react-hot-toast";

interface CameraCaptureProps {
  visible: boolean;
  onCancel: () => void;
  onCapture: (file: File) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ visible, onCancel, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [visible]);

  const startCamera = async () => {
    try {
      // 1. Check if the browser supports media devices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        toast.error("Camera not supported on this device/browser.");
        return;
      }

      // 2. Check if any camera is connected (optional, but good for desktop)
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      if (videoDevices.length === 0) {
        setHasCamera(false);
        toast.error("No camera connected.");
        return;
      }

      // 3. Request permissions and get stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      setStream(mediaStream);
      setHasCamera(true);
      setPermissionDenied(false);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        toast.error("Camera permission denied. Please allow camera access.");
      } else {
        setHasCamera(false);
        toast.error("Failed to access camera: " + err.message);
      }
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to Blob (JPG format)
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a File object from the blob
            const file = new File([blob], `captured_image_${Date.now()}.jpg`, { type: "image/jpeg" });
            
            // Check size (4MB = 4 * 1024 * 1024 bytes)
            if (file.size > 4 * 1024 * 1024) {
              toast.error("Captured image exceeds 4MB limit.");
            } else {
              onCapture(file);
              onCancel(); // Close modal
            }
          } else {
            toast.error("Failed to capture image.");
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  return (
    <Modal
      title="Capture Profile Picture"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="capture" 
          type="primary" 
          onClick={handleCapture}
          disabled={!stream || !hasCamera || permissionDenied}
        >
          Capture
        </Button>
      ]}
      destroyOnClose
      centered
      width={600}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, backgroundColor: "#f0f2f5", borderRadius: 8 }}>
        {!hasCamera && !permissionDenied && (
          <p className="text-danger">No camera detected or supported.</p>
        )}
        {permissionDenied && (
          <p className="text-danger">Camera permission denied. Please allow access in your browser settings.</p>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          style={{ width: "100%", maxWidth: 500, borderRadius: 8, display: stream ? "block" : "none" }}
        />
        
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </Modal>
  );
};

export default CameraCapture;
