"use client";
import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { motion, AnimatePresence } from "framer-motion";

// Register necessary chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

export default function checkCount() {
  const [checkInData, setCheckInData] = useState({
    checkedInPercentage: 0,
    checkedInCount: 0,
    totalCount: 0,
    checkedInUsers: [] as Array<{ username: string; nic: string; checkInTime: string }>,
  });
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCheckInData() {
      try {
        const res = await fetch("/api/getCheckCount");
        const data = await res.json();

        if (res.ok) {
          setCheckInData({
            checkedInPercentage: data.checkedInPercentage,
            checkedInCount: data.checkedInCount,
            totalCount: data.totalCount,
            checkedInUsers: data.checkedInUsers,
          });
        } else {
          setMessage("Error fetching check-in data");
        }
      } catch (error) {
        setMessage("Failed to fetch check-in data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCheckInData();
  }, []);

  const pieChartData = {
    labels: ["Checked In", "Not Checked In"],
    datasets: [
      {
        data: [
          checkInData.checkedInCount,
          checkInData.totalCount - checkInData.checkedInCount,
        ],
        backgroundColor: ["#4CAF50", "#F44336"],
      },
    ],
  };

  const getDynamicText = () => {
    if (checkInData.checkedInPercentage >= 90) {
      return "A truly enchanting evening! ✨ Most of our guests have arrived. Let the night shine! 🕯️🍷";
    } else if (checkInData.checkedInPercentage >= 50) {
      return "The ambiance is set, and more guests are joining! 🌹 Let's make it a night to remember. 🍽️";
    } else {
      return "The night is young, and the magic awaits! 🌙 Encourage more guests to check in and enjoy the evening. 🍷";
    }
  };

   return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {message && <p className="text-red-500">{message}</p>}

      {isLoading && (
        <div className="flex justify-center  items-center py-10">
          <div className="w-10 h-10 border-4 border-dashed  rounded-full animate-spin border-yellow-500"></div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full max-w-4xl"
      >
        <h2 className="text-6xl font-bold text-center mb-6 tracking-wider bg-gradient-to-r from-yellow-300 via-red-400 to-purple-200 text-transparent bg-clip-text drop-shadow-lg">
  Live Check-in Status 
</h2>

        <div className="flex items-center justify-between w-full mt-4">
          {/* Left Side: Check-in Percentage & Button */}
          <motion.div
            initial={{ x: -150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.8 }}
            className="text-left"
          >
            <p className="text-7xl tracking-wider hover:scale-105 transition duration-1000 font-bold text-green-400">
              {checkInData.checkedInPercentage.toFixed(2)}%
            </p>
            <p className="text-xl text-gray-200 hover:scale-105 transition duration-500 mt-2">
              {checkInData.checkedInCount} out of {checkInData.totalCount} guests checked in
            </p>

            {/* Button to show popup */}
            <button
              onClick={() => setShowPopup(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 text-xl rounded-xl mt-12 hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-105 duration-1000"
            >
              View Check-in List
            </button>
          </motion.div>

          {/* Right Side: Pie Chart with Animation */}
          <motion.div
            initial={{ x: 150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.8 }}
            className="w-1/3"
          >
            <div className="w-96 h-96 mx-auto">
              <Pie
                data={pieChartData}
                options={{
                  plugins: {
                    tooltip: {
                      enabled: true,
                      callbacks: {
                        label: (context) => {
                          const label = context.label || "";
                          const value = context.raw || 0;
                          return `${label}: ${value}%`;
                        },
                      },
                      bodyFont: {
                        size: 18,
                      },
                    },
                    legend: {
                      position: "bottom",
                      labels: {
                        color: "#fff",
                        font: { size: 16 },
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Progress Bar with Bottom Animation */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="w-full bg-gray-700 rounded-full h-6 mb-4 mt-12 overflow-hidden"
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${checkInData.checkedInPercentage}%` }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
          />
        </motion.div>

        <p className="text-center text-lg text-yellow-200 mb-4 mt-4">{getDynamicText()}</p>
      </motion.div>

      {/* Popup for showing checked-in users */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-800 text-white p-8 rounded-lg w-[800px] max-h-[400px] overflow-y-auto relative"
            >
              <h3 className="text-xl text-center font-semibold mb-4">Checked-in Users</h3>
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-3 text-2xl font-semibold hover:text-red-600"
              >
                X
              </button>
              <ul className="space-y-4">
                {checkInData.checkedInUsers
                  .slice()
                  .sort((a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()) // Sort by check-in time
                  .map((user, index) => (
                    <li key={index} className="flex justify-between border-b pb-2">
                      <span>{user.username}</span>
                      <span className="flex flex-col justify-end">{user.nic}</span>
                      <span>{new Date(user.checkInTime).toLocaleString()}</span>
                    </li>
                  ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}