"use client";
import { useState, useEffect,useMemo,useRef } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Input } from "@/components/ui/input"

// Register necessary chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

// Define types for the user object
interface CheckedInUser {
  username: string;
  nic: string;
  checkInTime: string;
}

export default function CheckCount() {
  const [checkInData, setCheckInData] = useState({
    checkedInPercentage: 0,
    checkedInCount: 0,
    totalCount: 0,
    totalUsers: 0,
    totalApprovedUsers: 0,
    totalApprovedPrice: 0,
    checkedInUsers: [] as Array<{ username: string; nic: string; checkInTime: string }>,
  });
  const [message, setMessage] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [filterValue, setFilterValue] = useState<string>(""); // Add filter state
  const formatDate = (date: Date | string) => {
    // If the date is a string, convert it to a Date object
    const parsedDate = typeof date === "string" ? new Date(date) : date;
  
    // Check if the parsed date is valid
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      return "Invalid Date"; // Fallback for invalid dates
    }
  
    // Format the date
    return parsedDate.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long", // Adds the weekday for a more natural feel
      hour: "2-digit",
      minute: "2-digit",
      
      hour12: true, // Ensures AM/PM format
    });
  };

  // Filter users based on the filter value (username and NIC number)
  const filteredUsers = useMemo(
    () =>
      checkInData.checkedInUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.nic.toLowerCase().includes(filterValue.toLowerCase())
      ),
    [checkInData.checkedInUsers, filterValue]
  );
  const tableSectionRef = useRef<HTMLDivElement>(null);

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
            totalUsers: data.totalUsers,
            totalApprovedUsers: data.totalApprovedUsers,
            totalApprovedPrice: data.totalApprovedPrice,
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

  const scrollToTableSection = () => {
    if (tableSectionRef.current) {
      tableSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Define columns for the table
  const columns: ColumnDef<CheckedInUser>[] = [
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "nic",
      header: "NIC",
    },
    {
      accessorKey: "checkInTime",
      header: "Checked-in Time",
      cell: ({ row }) => formatDate(row.original.checkInTime),
    },
  ];

  // Create the table instance
const table = useReactTable({
  data: filteredUsers, // Use filteredUsers instead of checkInData.checkedInUsers
  columns,
  getCoreRowModel: getCoreRowModel(),
});

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {message && <p className="text-red-500">{message}</p>}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full max-w-4xl"
      >
        <h2 className="text-6xl font-bold text-center mt-6 tracking-wider bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 text-transparent bg-clip-text drop-shadow-lg">
          Live Check-in Status
        </h2>

        <div className="flex items-center justify-between w-full mt-8">
          {/* Left Side: Check-in Percentage & Button */}
          <motion.div
            initial={{ x: -150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.8 }}
            className="text-left mt-8"
          >
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-16 w-40 bg-gray-700 rounded-md"></div>
                <div className="h-6 w-72 bg-gray-700 rounded-md mt-2"></div>
                <div className="h-12 w-48 bg-gray-800 rounded-md mt-6"></div>
              </div>
            ) : (
              <>
                <p className="text-7xl tracking-wider hover:scale-105 transition duration-1000 font-bold text-green-400">
                  {checkInData.checkedInPercentage.toFixed(2)}%
                </p>
                <p className="text-xl text-gray-200 hover:scale-105 transition duration-500 mt-2">
                  {checkInData.checkedInCount} out of {checkInData.totalCount} guests checked in
                </p>

                <button
                   onClick={scrollToTableSection}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 text-xl rounded-xl mt-6 hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-105 duration-1000"
                >
                  View Check-In List
                </button>
              </>
            )}
          </motion.div>

          {/* Right Side: Pie Chart with Animation */}
          <motion.div
            initial={{ x: 150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.8 }}
            className="w-1/3"
          >
            {isLoading ? (
              <div className="w-96 h-96 bg-gray-800 animate-pulse rounded-full"></div>
            ) : (
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
            )}
          </motion.div>
        </div>

        {/* Progress Bar with Bottom Animation */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="w-full bg-gray-700 rounded-full h-4  mt-12  overflow-hidden"
        >
          {isLoading ? (
            <div className="h-full w-full bg-gray-800 animate-pulse rounded-full"></div>
          ) : (
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${checkInData.checkedInPercentage}%` }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-300 to-green-600 rounded-full"
            />
          )}
        </motion.div>

        <p className="text-center text-lg text-yellow-100  mt-4">{getDynamicText()}</p>
      </motion.div>

          {/* Table Below Progress Bar */}
          <motion.div
          ref={tableSectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full mt-12"
        >
        <div className="py-2 flex justify-center">
  {/* Display stats for total users, approved users, and approved price */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-10"
  >
    {/* Total Users Stat */}
    {/*<div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <h3 className="text-2xl font-bold text-white">Total Users</h3>
            <p className="text-sm text-gray-300">Registered on the platform</p>
          </div>
        </div>
      </div>
      <p className="text-4xl font-bold text-blue-400">{checkInData.totalUsers}</p>
    </div>*/}

    {/* Total Approved Price Stat */}
    <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-600 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
          <div className="flex flex-col items-start">
            <h3 className="text-2xl font-bold text-white">Confirmed Revenue</h3>
            <p className="text-sm text-gray-300">Total approved amount</p>
          </div>
          </div>
        </div>
      </div>
      {/*<p className="text-4xl font-bold text-purple-400">Rs. {checkInData.totalApprovedPrice.toFixed(2)}</p>*/}
      <p className="text-4xl font-bold text-purple-400">Rs. 62,710.00</p>
    </div>

    {/* Total Approved Users Stat */}
    <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-600 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <h3 className="text-2xl font-bold text-white">Approved Users</h3>
            <p className="text-sm  text-gray-300">Verified and approved</p>
          </div>
        </div>
      </div>
      {/*<p className="text-4xl font-bold text-green-400">{checkInData.totalApprovedUsers}</p>*/}
      <p className="text-4xl font-bold text-green-400">72</p>
    </div>
  </motion.div>
</div>


          <h3 className="text-3xl font-bold mt-10 tracking-wider text-center ">Checked-In Users</h3>
          <div className="flex items-center py-5 px-32 relative">
              <div className="relative max-w-sm w-full">
                {/* Search icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                    clipRule="evenodd"
                  />
                </svg>

                {/* Input field */}
                <Input
                  placeholder="Filter by username and NIC number"
                  value={filterValue}
                  onChange={(event) => setFilterValue(event.target.value)}
                  className="pl-10 pr-10 w-full rounded-lg border border-gray-400 bg-gray-800 text-gray-100 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
                />

                {/* Clear button (visible only when there's input) */}
                {filterValue && (
                  <button
                    onClick={() => setFilterValue("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          <div className="rounded-2xl overflow-hidden border border-gray-600 shadow-lg mx-auto max-w-7xl">
            <Table>
              <TableHeader className="bg-gray-800 text-gray-300">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-bold text-lg text-gray-100 bg-gray-800 p-4"
                        style={{ width: header.column.getSize() }} // Set column width
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-800 transition-colors duration-200 ease-in-out">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-base text-gray-300 p-4"
                        style={{ width: cell.column.getSize() }} // Set column width
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      
       

      <footer className="w-full text-center text-black tracking-widest font-mono bg-yellow-400 to-yellow-400 py-2 mt-14 relative overflow-hidden text-base md:text-base">
        &copy; UoMLeos 2025, All rights reserved.
      </footer>
    </div>
  );
}