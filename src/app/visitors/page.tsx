"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import qrcode from "qrcode";
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

// Type definitions
type VisitorUser = {
  username: string;
  email: string;
  whatsapp: string;
  department: string;
  foodList: string[];
  totalprice: number;
};

type Visitor = {
  _id: string;
  name: string;
  index: string;
  seats: string;
  imageURL: string;
  isApproves: boolean;
  users: VisitorUser[];
};

export default function VisitorsList() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch data
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/getVisitors");
        setVisitors(response.data.visitors);
      } catch (error) {
        console.error("Error fetching visitors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  const handleApprove = async (visitorId: string) => {
    try {
      setLoading(true);
      const response = await axios.patch("/api/approveVisitor", { visitorId });
      if (response.status === 200) {
        alert("User approved, email sent with QR code!");
        setVisitors((prevVisitors) =>
          prevVisitors.map((visitor) =>
            visitor._id === visitorId ? { ...visitor, isApproves: true } : visitor
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

  const handleDelete = async (index: string) => {
    try {
      const response = await axios.delete(`/api/getVisitors?index=${index}`);
      if (response.status === 200) {
        alert("Visitor deleted successfully!");
        setVisitors((prevVisitors) =>
          prevVisitors.filter((visitor) => visitor.index !== index)
        );
      } else {
        alert("Failed to delete the visitor.");
      }
    } catch (error) {
      console.error("Error deleting visitor:", error);
      alert("An error occurred while deleting the visitor.");
    }
  };

  // Table columns definition
  const columns: ColumnDef<Visitor>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "index", header: "Index" },
    { accessorKey: "seats", header: "Seats" },
    {
      accessorKey: "imageURL",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.imageURL}
          alt={row.original.name}
          style={{ width: "100px", height: "auto", borderRadius: "8px" }}
        />
      ),
    },
    {
      accessorKey: "isApproves",
      header: "Approval Status",
      cell: ({ row }) => (row.original.isApproves ? "Approved" : "Not Approved"),
    },
    {
      accessorKey: "users",
      header: "Users",
      cell: ({ row }) => (
        <ul>
          {row.original.users.map((user, index) => (
            <li key={index}>
              <p>
                <strong>{user.username}</strong> ({user.department}) - {user.email}
                <br />
                WhatsApp: {user.whatsapp}
                <br />
                Food: {user.foodList.join(", ")} | Price: $
                {user.totalprice.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => window.open(row.original.imageURL, "_blank")}
            className="bg-green-500 text-white px-2 py-1 rounded"
          >
            Preview Photo
          </button>
          {!row.original.isApproves && (
            <button
              onClick={() => handleApprove(row.original._id)}
              className="bg-blue-500 text-white px-2 py-1 rounded"
              disabled={loading}
            >
              {loading ?"Approve" : "Approve"}
            </button>
          )}
          <button
            onClick={() => handleDelete(row.original.index)}
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: visitors,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Visitors List</h1>
      {loading  }
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  <div className="flex flex-col items-center">
                  <span className="text-gray-500 mb-2">Loading...</span>
                  <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
