"use client";

import { useState, useEffect } from "react";
import QRCodeReader from "@/components/QRCodeReader";

const CheckInPage = () => {
  const [message, setMessage] = useState<string>("");
  const [userData, setUserData] = useState<{ username: string; whatsapp: string; department: string } | null>(null);

  useEffect(() => {
    const checkCameraPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop()); // Stop the stream immediately
        console.log("Camera access granted");
      } catch (error) {
        console.error("Camera access denied:", error);
        setMessage("Camera access is required to scan QR codes.");
      }
    };

    checkCameraPermissions();
  }, []);

  const handleScanSuccess = async (decodedText: string) => {
    console.log("QR Code scanned successfully:", decodedText);
    try {
      const userData = JSON.parse(decodedText);
      console.log("Parsed user data:", userData);
      const { username, whatsapp, department } = userData;

      // ✅ Store the scanned user data to display it in UI
      setUserData({ username, whatsapp, department });

      // Call the backend API to update the user's check-in status
      const response = await fetch("/api/setCheckIn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, whatsapp, department }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message || `User ${username} checked in successfully!`);
      } else {
        setMessage(result.error || "Failed to check in user.");
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      setMessage("Invalid QR code data. Please try again.");
    }
  };

  const handleScanFailure = (error: string) => {
    console.error("QR Code scan failed:", error);
    if (error.includes("NotFoundException")) {
      setMessage("No QR code detected. Please ensure the QR code is clear and properly aligned.");
    } else {
      setMessage("Scan failed. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Check-In with QR Code</h1>
      <QRCodeReader onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} />
      
      {/* ✅ Display scanned user data */}
      {userData && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
          <h3>Scanned User Details</h3>
          <p><strong>Username:</strong> {userData.username}</p>
          <p><strong>WhatsApp:</strong> {userData.whatsapp}</p>
          <p><strong>Department:</strong> {userData.department}</p>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default CheckInPage;
