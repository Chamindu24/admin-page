"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import * as React from "react";
import qrcode from "qrcode";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

// QR Code Component
function QRCodeGenerator() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<Record<string, string>>({});

  const handleClick = () => {
    if (!text) {
      alert("Please enter some text to generate a QR code.");
      return;
    }

    setLoading(true);

    qrcode.toDataURL(text, function (err, url) {
      if (err) {
        console.error("Error generating QR code:", err);
        setLoading(false);
        return;
      }

      sendEmail(url);
    });
  };

  const sendEmail = (qrUrl: string) => {
    fetch("/api/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrCode: qrUrl }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResult(data);
        alert("QR code sent to the email!");
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        alert("Error sending email. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-4 border rounded-md shadow-md">
      <h2 className="text-lg font-bold mb-2">QR Code Generator</h2>
      <label htmlFor="qr-input" className="block mb-2">
        Enter text to generate a QR code:
      </label>
      <input
        id="qr-input"
        className="border p-2 rounded mb-4 w-full text-black"
        type="text"
        placeholder="Enter text..."
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {loading ? "Generating..." : "Generate & Send"}
      </button>

      {loading && <div className="my-4 text-gray-500">Processing...</div>}
      {result && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
          <strong>Server Response:</strong> {JSON.stringify(result)}
        </div>
      )}
    </div>
  );
}

// Main VisitorsTable Component
export default function VisitorsTable() {
  const [data, setData] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/getVisitors");
        setData(response.data.visitors);
      } catch (error) {
        console.error("Error fetching visitors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleApprove = (visitorId: string) => {
    alert(`Visitor ID ${visitorId} approved!`);
    // Add backend API call here if needed
  };

  const handlePreview = (imageURL: string) => {
    window.open(imageURL, "_blank");
  };

  const columns: ColumnDef<Visitor>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "index",
      header: "Index",
    },
    {
      accessorKey: "seats",
      header: "Seats",
    },
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
      cell: ({ row }) =>
        row.original.isApproves ? "Approved" : "Not Approved",
    },
    {
      accessorKey: "users",
      header: "Users",
      cell: ({ row }) => (
        <ul>
          {row.original.users.map((user, index) => (
            <li key={index}>
              <p>
                <strong>{user.username}</strong> ({user.department}) -{" "}
                {user.email}
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
            onClick={() => handlePreview(row.original.imageURL)}
            className="bg-green-500 text-white px-2 py-1 rounded"
          >
            Preview Photo
          </button>
          <button
            onClick={() => handleApprove(row.original._id)}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Approve
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Visitors List</h1>
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
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* QR Code Generator Section */}
      <div className="mt-8">
        <QRCodeGenerator />
      </div>
    </div>
  );
}
