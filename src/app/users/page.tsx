"use client";
import { useEffect, useState } from "react";
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
import {
  flexRender,
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

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

// Modal component for image preview
// Modal component for image preview
function ImageModal({
  isOpen,
  imageURL,
  onClose,
}: {
  isOpen: boolean;
  imageURL: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black bg-opacity-50">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-center bg-cover blur-3xl animate-pulse"

      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900 to-transparent opacity-75"></div>
      {/* Modal content */}
      <div className="relative bg-gray-800 bg-opacity-80 rounded-lg shadow-2xl p-8 border border-gray-700">
        <button
          onClick={onClose}
           className="absolute top-1 right-1 bg-red-500 text-white px-2 py-0.5 rounded-full hover:bg-red-600 transition duration-300"
        >
          ✖
        </button>
        <div className="relative overflow-hidden">
          <img
            src={imageURL}
            alt="Preview"
            className="w-[800px] h-[500px] object-fill rounded-lg  shadow-md transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
}



export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalImageURL, setModalImageURL] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/getUsers");
        setUsers(response.data.users); // Access the "users" array from the response
        
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
  
  

  // Table columns definition
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <span className="font-bold">{row.original.username}</span>,
    },
    { accessorKey: "index", header: "IndexNum " },
    { accessorKey: "seatNumber", header: "Seat Number" },
    {
      accessorKey: "imageURL",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.imageURL}
          alt={row.original.username}
          style={{
            width: "150px",
            height: "100px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
          onClick={() => setModalImageURL(row.original.imageURL)}
        />
      ),
    },
    {
      accessorKey: "isApproved",
      header: "Approval Status",
      cell: ({ row }) => {
        if (row.original.isApproved) {
          return <span className="text-green-400 font-extrabold">Approved</span>;
        } else if (row.original.isRejected) {
          return <span className="text-red-400 font-extrabold">Rejected</span>;
        } else {
          return <span className="text-blue-500 font-extrabold">Pending</span>;
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
          <p>Department: {row.original.department}</p>
          <p>Batch: {row.original.batch}</p>
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
    data: users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    
  });

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-gray-100 p-6 transition-all duration-300 ">
      <h1 className="text-2xl font-bold mb-4 text-center">Users List</h1>
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
      <ImageModal
        isOpen={!!modalImageURL}
        imageURL={modalImageURL || ""}
        onClose={() => setModalImageURL(null)}
      />
    </div>
  );
}
