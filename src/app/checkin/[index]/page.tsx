"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Check, LogOut, Loader2, X } from "lucide-react";

interface User {
  username: string;
  email: string;
  seatNumber: string;
  index: string;
  isCheckedIn: boolean;
  seats: string[];
  department: string;
  imageURL: string;
  totalPrice: number;
  checkInTime: string | null;
}

export default function CheckInPage() {
  const { index } = useParams<{ index: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch(`/api/checkin?index=${index}`);
        const data = await res.json();

        if (res.ok && data.users && data.users.length > 0) {
          setUser({
            ...data.users[0],
            seats: data.seats,
            department: data.department,
            imageURL: data.imageURL,
            totalPrice: data.totalPrice,
            checkInTime: data.users[0].checkInTime || null,
          });
        } else {
          setMessage(data.error || "User not found");
        }
      } catch (error) {
        setMessage("Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserData();
  }, [index]);

  async function handleCheckInCheckOut() {
    if (!user || !user.seats.length) return;

    setIsProcessing(true);
    setShowModal(false);

    try {
      const res = await fetch(`/api/checkin?index=${index}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatNumber: user.seats[0], nic: index }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);

      if (!res.ok) {
        setIsError(true);
        setMessage(data.error);
      } else {
        setIsError(false);
        setMessage(data.message);

        setUser((prevUser) =>
          prevUser
            ? {
                ...prevUser,
                isCheckedIn: !prevUser.isCheckedIn,
                checkInTime: data.checkInTime,
              }
            : null
        );
      }
    } catch (error) {
      setIsError(true);
      setMessage("Failed to perform action");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex flex-col items-center p-10 justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <h1 className="text-3xl md:text-5xl tracking-wider font-semibold mb-8 text-yellow-400 animate-bounce">
        Check-In System
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : user ? (
        <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center shadow-2xl w-full max-w-xs sm:max-w-md transform transition-transform hover:scale-105 duration-300">
          {/* User Details */}
          <div className="text-center">
            <p className="text-2xl tracking-widest font-semibold">{user.username}</p>
          </div>

          <div className="mt-6 space-y-2 text-center">
            <p>
              <strong>Seat Number:</strong> {user.seats[0]}
            </p>
            <p>
              <strong>NIC:</strong> {index}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`font-bold ${
                  user.isCheckedIn ? "text-green-400" : "text-red-400"
                }`}
              >
                {user.isCheckedIn ? "Checked In" : "Not Checked In"}
              </span>
            </p>
            {user.isCheckedIn && user.checkInTime && (
              <p>
                <strong>Check-in Time:</strong>{" "}
                {new Date(user.checkInTime).toLocaleString()}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="w-full bg-gray-700 rounded-full h-1 mt-4">
              <div className="bg-yellow-500 h-2 rounded-full animate-progress"></div>
            </div>
          )}

          {/* Check-In/Check-Out Button */}
          <button
            onClick={() => setShowModal(true)}
            className={`mt-6 flex flex-col items-center justify-center px-8 py-8 rounded-full text-lg font-bold text-white transition-all hover:scale-105 duration-300 shadow-md ${
              user.isCheckedIn
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!user || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin h-16 w-16" />
            ) : user.isCheckedIn ? (
              <>
                <LogOut className="h-14 w-16" /> Check-Out
              </>
            ) : (
              <>
                <Check className="h-14 w-16 font-extrabold" />
                <p className="text-xl font-semibold">Check-In</p>
              </>
            )}
          </button>
        </div>
      ) : (
        <p className="text-red-500">{message}</p>
      )}

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg font-semibold text-center text-white ${
            isError ? "bg-red-500" : "bg-gray-700"
          }`}
        >
          <p>{message}</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl text-white w-full max-w-xs sm:max-w-sm transform animate-slideUp">
            <h2 className="text-xl sm:text-2xl text-center font-bold mb-4">Confirm Action</h2>
            <p className="text-center text-lg">
              Are you sure you want to{" "}
              <span className={`font-bold ${user?.isCheckedIn ? "text-red-400" : "text-green-400"}`}>
                {user?.isCheckedIn ? "Check-Out" : "Check-In"}
              </span>
              ?
            </p>
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={handleCheckInCheckOut}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 shadow-md ${
                  user?.isCheckedIn
                    ? "bg-red-500 hover:bg-red-600 hover:scale-105"
                    : "bg-green-500 hover:bg-green-600 hover:scale-105"
                }`}
              >
                Yes, {user?.isCheckedIn ? "Check-Out" : "Check-In"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-all hover:scale-105 duration-300 shadow-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}