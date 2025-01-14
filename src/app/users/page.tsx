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
    <div className="flex justify-center items-center py-4">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
}


export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
      const response = await axios.patch("/api/approveUser", { userId });
      if (response.status === 200) {
        alert("User approved, email sent with QR code!");
        
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isApproved: true } : user
          )
        );
      } else {
        alert("Failed to approve the user.");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      alert("An error occurred while approving the user.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error("No ID provided for deletion");
      return;
    }
    console.log("Attempting to delete user with ID:", id); // Log the user ID
    try {
      const response = await axios.delete(`/api/getUsers?id=${id}`);
      console.log("Response from delete API:", response);
      
      if (response.status === 200) {
        alert("User deleted successfully!");
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      } else {
        alert("Failed to delete the user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user.");
    }
  };
  

  // Table columns definition
  const columns: ColumnDef<User>[] = [
    { accessorKey: "username", header: "Username" },
    { accessorKey: "index", header: "IndexNum " },
    { accessorKey: "seatNumber", header: "Seat Number" },
    {
      accessorKey: "imageURL",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.imageURL}
          alt={row.original.username}
          style={{ width: "100px", height: "auto", borderRadius: "8px" }}
        />
      ),
    },
    {
      accessorKey: "isApproved",
      header: "Approval Status",
      cell: ({ row }) => (row.original.isApproved ? "Approved" : "Not Approved"),
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
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => window.open(row.original.imageURL, "_blank")}
            className="bg-gradient-to-r from-green-400 to-green-600 text-white px-1 py-1 text-sm rounded shadow hover:from-green-500 hover:to-green-700 hover:shadow-lg transition-all duration-300 ease-in-out"

          >
            🌟 Preview Photo
          </button>
          {!row.original.isApproved && (
            <button
              onClick={() => handleApprove(row.original._id)}
              className={`${
                loading ? "cursor-not-allowed bg-gray-400" : "bg-gradient-to-r from-blue-400 to-blue-600"
              } text-white px-1 py-1 text-sm rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 hover:shadow-xl transition-all duration-300 ease-in-out`}
              disabled={loading}
            >
              {loading ? "Approving..." : "✅ Approve"}
            </button>
          )}
          <button
            onClick={() => handleDelete(row.original._id)}
            className="bg-gradient-to-r from-red-400 to-red-600 text-white px-1 py-1 text-sm rounded-lg shadow-lg hover:from-red-500 hover:to-red-700 hover:shadow-xl transition-all duration-300 ease-in-out"
          >
            ❌ Delete
          </button>

        </div>
      ),
    },
  ];
  

  const table = useReactTable({
    data: users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Visitors List</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}className=" font-bold text-lg" >
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
                <TableCell colSpan={columns.length} className="text-center py-4">
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}  className="hover:bg-gray-100 ">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-base" style={{ width: `${cell.column.columnDef.size || 100}px` }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
