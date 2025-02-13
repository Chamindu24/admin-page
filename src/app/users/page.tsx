"use client";
import React,{ useEffect, useState,useMemo } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import {
  flexRender,
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
 
  
} from "@tanstack/react-table";








// Define types for the user object
interface User {
  _id: string;
  username: string;
  email: string;
  whatsapp: string;
  department: string;
  batch: string;
  foodList: string[];
  totalPrice: number;
  seatNumber: string;
  imageURL: string;
  isApproved: boolean;
  index: string; // Add index from the parent order
  isRejected: boolean; // Add status property
}




export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterValue, setFilterValue] = useState<string>(""); // Add filter state
  const [modalFileURL, setModalFileURL] = useState<string | null>(null);
  const [modalFileType, setModalFileType] = useState<"image" | "pdf" | null>(null);



  // Modal component for image preview


function FileModal({
  isOpen,
  fileURL,
  fileType,
  onClose,
}: {
  isOpen: boolean;
  fileURL: string;
  fileType: "image" | "pdf" | null;
  onClose: () => void;
}) {
  if (!isOpen || !fileURL) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900 to-transparent opacity-75"></div>
      <div className="relative bg-gray-800 bg-opacity-80 rounded-lg shadow-2xl p-8 border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-1 right-1 bg-red-500 text-white px-2 py-0.5 rounded-full hover:bg-red-600 transition duration-300"
        >
          ✖
        </button>
        <div className="relative overflow-hidden">
          {fileType === "image" ? (
            <img
              src={fileURL}
              alt="Preview"
              className="w-[800px] h-[500px] object-fill rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
            />
          ) : fileType === "pdf" ? (
            <iframe
              src={fileURL}
              className="w-[800px] h-[500px] rounded-lg border border-gray-700"
              title="PDF Preview"
            ></iframe>
          ) : null}
        </div>
      </div>
    </div>
  );
}



  // Spinner component for loading state
function Spinner() {
  return (
    <div className="flex justify-center items-center py-10">
      <div
         className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-yellow-500 mx-auto"
       ></div>
    </div>
  );
}
  
  // Fetch data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/getUsers");
        // Reverse the users array to show newly added users at the top
        setUsers(response.data.users.reverse()); // Reverse the array here
        
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Attempting to approve user:', userId); // Debug log
  
      const response = await axios.patch("/api/approveUser", { userId });
      console.log('Approval response:', response); // Debug log
  
      if (response.status === 200) {
        alert("User approved, email sent with QR code!");
        
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isApproved: true } : user
          )
        );
      } else {
        console.error('Non-200 response:', response);
        alert(`Failed to approve the user. Status: ${response.status}`);
      }
    } catch (error: any) {
      // Enhanced error logging
      console.error("Error approving user:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      alert(`An error occurred: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  

  const handleReject = async (userId: string) => {
    try {
      setLoading(true);
  
      // Make API call to reject the user and update the seat booking status
      const response = await axios.patch("/api/rejectUser", { userId });
  
      if (response.status === 200) {
        alert("User rejected and seat is unbooked!");
  
        // Update the users state to reflect the rejection
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isRejected: true, isApproved: false } : user)
        );
      } else {
        alert("Failed to reject the user.");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("An error occurred while rejecting the user.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on the filter value (username and NIC number)
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.username.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.index.toLowerCase().includes(filterValue.toLowerCase())
      ),
    [users, filterValue]
  );
  
  

  // Table columns definition
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <span className="font-bold">{row.original.username}</span>,
    },
    { accessorKey: "index", header: "NIC Number" },
    { accessorKey: "seatNumber", header: "Seat Number" },
    {
      accessorKey: "fileURL",
      header: "Slip",
      cell: ({ row }) => {
        const fileURL = row.original.imageURL;
        if (!fileURL) return <span className="text-gray-400">No file</span>;
    
        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileURL);
        const isPDF = /\.pdf$/i.test(fileURL);
    
        return isImage ? (
          <img
            src={fileURL}
            alt="Uploaded File"
            style={{
              width: "150px",
              height: "100px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
            onClick={() => {
              setModalFileURL(fileURL);
              setModalFileType("image");
            }}
          />
        ) : isPDF ? (
          <div className="flex flex-col items-center">
            <iframe
              src={fileURL}
              className="max-w-xs w-full rounded-lg border border-gray-700"
              width="100px"
              height="120px"
              title="PDF Preview"
              onClick={() => {
                setModalFileURL(fileURL);
                setModalFileType("pdf");
              }}
            ></iframe>
            <button
            className="flex items-center gap-2 text-gray-400 font-semibold hover:text-gray-100 transition duration-200 mt-2"
            onClick={() => {
              setModalFileURL(fileURL);
              setModalFileType("pdf");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M12 2a1 1 0 0 1 1 1v8h8a1 1 0 0 1 0 2h-8v8a1 1 0 0 1-2 0v-8H3a1 1 0 0 1 0-2h8V3a1 1 0 0 1 1-1z"
                clipRule="evenodd"
              />
            </svg>
            Preview PDF
          </button>
          </div>
        ) : (
          <span className="text-gray-400">Unsupported file</span>
        );
      },
    },
    {
      accessorKey: "isApproved",
      header: "Approval Status",
      cell: ({ row }) => {
        const isApproved = row.original.isApproved;
        const isRejected = row.original.isRejected;
        
        if (isApproved) {
          return (
            <span className="flex items-center text-green-500 font-extrabold hover:text-green-400 transition-all duration-300">
              
              Approved
            </span>
          );
        } else if (isRejected) {
          return (
            <span className="flex items-center text-red-500 font-extrabold hover:text-red-400 transition-all duration-300">
              
              Rejected
            </span>
          );
        } else {
          return (
            <span className="flex items-center text-blue-500 font-extrabold hover:text-blue-400 transition-all duration-300">
              
              Pending
            </span>
          );
        }
      },
    },
    {
      accessorKey: "otherDetails",
      header: "Other Details",
      cell: ({ row }) => (
        <div>
          <p>Email: {row.original.email}</p>
          <p>WhatsApp: {row.original.whatsapp}</p>
          <p>Membership Status: {row.original.department}</p>
          
          <p>Food List: {row.original.foodList.join(", ") || "N/A"}</p>
          <p>Total Price: ${row.original.totalPrice}</p>
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const { _id, isApproved, isRejected } = row.original;
    
        return (
          <div className="flex flex-col gap-2">
            {!isApproved && !isRejected && (
              <>
                <button
                  onClick={() => handleApprove(_id)}
                  className={`bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-3 py-1 text-sm font-semibold rounded shadow-lg hover:from-blue-600 hover:to-blue-800 hover:shadow-xl transition-all duration-300 ease-in-out`}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleReject(_id)}
                  className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-3 py-1 text-sm font-semibold rounded shadow-lg hover:from-red-600 hover:to-red-800 hover:shadow-xl transition-all duration-300 ease-in-out"
                >
                  ❌ Reject
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];
  

  const table = useReactTable({
    data: filteredUsers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    
  });

  



  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-gray-100 p-6 transition-all duration-300 ">
      <h1 className="text-3xl  font-semibold mb-6 text-center ">
        <p className="text-gray-100 mb-2 tracking-widest bg-gradient-to-r from-yellow-100 via-yellow-500 to-yellow-100 text-transparent bg-clip-text">Leo Candle Night Celestia 2025</p>
        <p className="text-2xl font-medium text-gray-300 tracking-wider" >The Guest List of Our Grand Dinner Party </p>
      </h1>
      <div className="flex items-center py-5 relative">
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
      <div className="rounded-md overflow-hidden border border-gray-600 shadow-lg">
        <Table>
          <TableHeader className="bg-gray-800 text-gray-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}className= "font-bold text-lg text-gray-100 bg-gray-800 p-4">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}  className="hover:bg-gray-800 transition-colors duration-200 ease-in-out">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-base text-gray-300 p-4" style={{ width: `${cell.column.columnDef.size || 100}px` }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4 text-gray-400">
                  
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <FileModal
        isOpen={!!modalFileURL}
        fileURL={modalFileURL || ""}
        fileType={modalFileType}
        onClose={() => {
          setModalFileURL(null);
          setModalFileType(null);
        }}
      />
    </div>
  );
}
