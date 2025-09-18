import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import axios from "axios";
import {
  File,
  PlusCircle,
  Search,
  Pencil,
  Trash,
  MoreHorizontal,
  ListFilter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/Components/ui/pagination";

import { useQuery } from "@tanstack/react-query";
import { TbH1 } from "react-icons/tb";
import { useNavigate } from "@tanstack/react-router";

const Index = () => {
  // Get token directly from localStorage
  const token = localStorage.getItem("token");
  console.log("Token being used:", token);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const {
    data: RolesData,
    isLoading: isRolesDataLoading,
    isError: isRolesDataError,
  } = useQuery({
    queryKey: ["roles", currentPage, search], 
    queryFn: async () => {
      try {
        const response = await axios.get("/api/roles", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage,
            search: search, 
          },
        });
        return response.data?.data; 
      } catch (error: any) {
        throw new Error(error.message); 
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const { Roles, Pagination: paginationData } = RolesData || {}; 
  const { current_page, last_page, total, per_page } = paginationData || {}; 

  if (isRolesDataError) {
    return <p>Error fetching data</p>;
  }
  
  return (
    <>
      <div className="w-full p-5">
        <div className="px-5 mt-17 dark:bg-background pt-1 w-full bg-white shadow-xl border rounded-md">
          <div className="w-full py-3 flex flex-col gap-2 md:flex-row justify-between items-center">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              Roles
            </h2>
            {/* search field here */}
            <div className="relative p-0.5 ">
              <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                id="search"
                className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search for Roles"
              />
            </div>
            {/* end */}
          </div>
          <Table className="mb-2">
            <TableCaption className="mb-2">
              <div className="flex justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {/* First Page */}
                    {current_page > 2 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
                          1
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Ellipsis */}
                    {current_page > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    {/* Previous Page */}
                    {current_page > 1 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(current_page - 1)} className="cursor-pointer">
                          {current_page - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Current Page */}
                    <PaginationItem>
                      <PaginationLink isActive>{current_page}</PaginationLink>
                    </PaginationItem>
                    
                    {/* Next Page */}
                    {current_page < last_page && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(current_page + 1)} className="cursor-pointer">
                          {current_page + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Ellipsis */}
                    {current_page < last_page - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    {/* Last Page */}
                    {current_page < last_page - 1 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(last_page)} className="cursor-pointer">
                          {last_page}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < last_page && setCurrentPage(currentPage + 1)}
                        className={currentPage >= last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Role Name</TableHead>
                <TableHead>Guard Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isRolesDataLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : Roles && Roles.length > 0 ? (
                Roles.map((role: any) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.id}</TableCell>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.guard_name}</TableCell>
                    <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => navigate({ to: `/roles/${role.id}` })}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Permissions
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No roles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default Index;