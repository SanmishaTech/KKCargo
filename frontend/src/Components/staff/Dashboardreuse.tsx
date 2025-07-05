import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  PlusCircle,
  Search,
  Pencil,
  Trash,
  MoreHorizontal,
  ChevronDown,
  Ellipsis,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import AlertDialogbox from "./AlertBox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MultiSelectorComponent from "./profile";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router"; 
import { EmptyState } from "@/components/ui/empty-state";
import {
  MessageSquare,
  Mail,
  Image,
  Files,
  FileQuestion,
  FileSymlink,
  Settings,
} from "lucide-react";

import {
  Dropdown,
  DropdownSection,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  cn,
  Avatar,
  Tooltip,
  useDisclosure,
} from "@heroui/react";

export const description =
  "A reusable registrations dashboard with customizable header and table. Configure breadcrumbs, search, tabs, and table data through props.";

export default function Dashboard({
  breadcrumbs = [],
  searchPlaceholder = "Search...",
  fetchData,
  userAvatar = "/placeholder-user.jpg",
  tableColumns = {},
  AddItem,
  Edititem,
  filterValue,
  typeofschema,
  handleNextPage,
  totalPages,
  setSearch,
  setCurrentPage,
  Searchitem,
  currentPage,
  handlePrevPage,
  tableData = [],
  onAddProduct = () => {},
  onExport = () => {},
  onFilterChange = () => {},
  onProductAction = () => {},
  onSearch,
  onKeyPress,
  searchQuery,
}) {
   const navigate = useNavigate();
  const [toggleedit, setToggleedit] = useState(false);
  const [editid, setEditid] = useState();
  const [toggledelete, setToggledelete] = useState();
  const [searchTerm, setsearchTerm] = useState("");
  const [handleopen, setHandleopen] = useState(false);
  const [toggleopen, setToggleopen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const iconClasses =
    "text-xl text-default-500 pointer-events-none flex-shrink-0";

  // State to manage expanded rows (array of id)
  const [expandedRows, setExpandedRows] = useState([]);
  
  // Helper function to check if a row has admin role
  const hasAdminRole = (row: any) => {
    // Check various possible ways the role might be stored
    if (!row) return false;
    
    // Check common properties that might contain role information
    if (row.role === 'admin') return true;
    if (row.userRole === 'admin') return true;
    if (row.type === 'admin') return true;
    if (row.user_role === 'admin') return true;
    
    // If there's a specific column for role in the data
    for (const key in row) {
      if (typeof row[key] === 'string' && 
          (row[key].toLowerCase() === 'admin' || 
           key.toLowerCase().includes('role') && row[key] === 'admin')) {
        return true;
      }
    }
    
    return false;
  };

  // Handler to toggle row expansion with debug logs
  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((id) => id !== rowId);
      } else {
        return [...prev, rowId];
      }
    });
  };

  const handleEdit = async (id, url) => {
     setToggleedit(true);
    setEditid({
      id: id,
      url: url,
    });
    // Implement edit functionality here
  };

  const handleDelete = (id) => {
     // Implement delete functionality here
  };

  const handleSearchClick = () => {
    onSearch(localSearchTerm);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleSearchClick();
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background/30">
      <div className="flex flex-col gap-6 py-6 px-8">
        {/* Header */}

        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Breadcrumb className="flex md:flex">
            <BreadcrumbList className="flex items-center space-x-2">
              {breadcrumbs?.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {breadcrumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link
                          to={breadcrumb.href}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {breadcrumb.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-muted-foreground">
                        {breadcrumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="grid flex-1 items-start gap-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {tableColumns.title || "staff Dashboard"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {tableColumns.description || "Manage staff data efficiently"}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end">
                <div className="flex items-center gap-3 ml-auto">
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1 md:w-[300px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder={searchPlaceholder}
                        className="w-full rounded-l-full bg-background pl-10 border-muted focus-visible:ring-primary"
                        value={localSearchTerm}
                        onChange={handleSearchInput}
                        onKeyDown={handleKeyDown} // Replace onKeyPress with onKeyDown
                      />
                      {localSearchTerm && (
                        <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setLocalSearchTerm("");
                            onSearch("");
                          }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <Button
                      color="primary"
                      variant="solid"
                      className="h-10 rounded-r-full"
                      onPress={handleSearchClick}
                    >
                      Search
                    </Button>
                  </div>
                </div>
                <Button
                  color="primary"
                  variant="solid"
                  startContent={<PlusCircle size={16} />}
                  onPress={() => navigate({ to: "/staff/add" })}
                  className="h-9"
                >
                  Add New Staff
                </Button>
              </div>
            </div>
            <TabsContent value="all" className="mt-0">
              {/* <Edititem
                isOpen={isOpen}
                onClose={onClose}
                onOpen={onOpen}
                onOpenChange={onOpenChange}
                editid={editid}
                typeofschema={typeofschema}
              /> */}

              <AlertDialogbox
                backdrop="blur"
                url={editid}
                isOpen={toggleopen}
                fetchData={fetchData}
                onOpen={setToggleopen}
              />

              {/* <Additem
                typeofschema={typeofschema}
                add={tableData?.add}
                onAddProduct={onAddProduct}
                setHandleopen={setHandleopen}
                handleopen={handleopen}
              /> */}

              {!tableData || tableData.length <= 0 ? (
                <EmptyState
                  className="bg-accent/20 border border-border rounded-lg shadow-sm min-w-full min-h-[500px] justify-center items-center"
                  title="No staff Available"
                  description="You can add a new staff to get started."
                  icons={[FileText, FileSymlink, Files]}
                  typeofschema={typeofschema}
                />
              ) : (
                <Card className="bg-card border border-border shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          {tableColumns?.headers?.map((header, index) => (
                            <TableHead
                              key={index}
                              className={cn(
                                "text-xs font-medium text-muted-foreground py-3",
                                header.hiddenOn
                              )}
                            >
                              <div className="flex items-center gap-1">
                                {header.label}
                                {header.sortable && (
                                  <ChevronDown
                                    size={14}
                                    className="text-muted-foreground/70"
                                  />
                                )}
                              </div>
                            </TableHead>
                          ))}

                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData?.map((row) => (
                          <React.Fragment key={row.id}>
                            <TableRow>
                              {tableColumns?.headers?.map((header, index) => (
                                <TableCell
                                  key={index}
                                  className={
                                    header.hiddenOn ? header.hiddenOn : ""
                                  }
                                >
                                  {header.key === "one" ? (
                                    row.one
                                  ) : header.key === "action" ? (
                                    // Only show action button if the row doesn't have admin role
                                    !hasAdminRole(row) ? (
                                      <Dropdown backdrop="blur" showArrow>
                                        <DropdownTrigger>
                                          <button className="p-1 rounded-full opacity-100 group-hover:opacity-100 transition-opacity hover:bg-muted">
                                            <Ellipsis className="w-5 h-5 text-muted-foreground" />
                                          </button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                          aria-label="Actions"
                                          variant="faded"
                                          className="w-56"
                                        >
                                          <DropdownSection title="Actions">
                                            <DropdownItem
                                              key="edit"
                                              description="Edit staff details"
                                              onPress={() =>
                                                navigate({
                                                  to: "/staff/edit/" + row?.id,
                                                })
                                              }
                                              startContent={
                                                <EditDocumentIcon
                                                  className={iconClasses}
                                                />
                                              }
                                            >
                                              Edit
                                            </DropdownItem>
                                          </DropdownSection>
                                          <DropdownSection title="Danger zone">
                                            <DropdownItem
                                              key="delete"
                                              className="text-danger"
                                              color="danger"
                                              description="This action cannot be undone"
                                              onPress={() => {
                                                setEditid(row?.id);
                                                setToggleopen(true);
                                              }}
                                              startContent={
                                                <DeleteDocumentIcon
                                                  className={cn(
                                                    iconClasses,
                                                    "text-danger"
                                                  )}
                                                />
                                              }
                                            >
                                              Delete
                                            </DropdownItem>
                                          </DropdownSection>
                                        </DropdownMenu>
                                      </Dropdown>
                                    ) : null
                                  ) : header.key === "two" ? (
                                    row.two
                                  ) : header.key === "three" ? (
                                    row.three
                                  ) : header.key === "four" ? (
                                    row.four
                                  ) : header.key === "five" ? (
                                    row.five
                                  ) : header.key === "six" ? (
                                    `₹${row.six}`
                                  ) : (
                                    row[header.key]
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-xs text-muted-foreground">
                      {tableData && (
                        <>
                          Showing page <strong>{currentPage}</strong> of{" "}
                          <strong>{totalPages}</strong>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onPress={() => handlePrevPage()}
                        size="sm"
                        variant="flat"
                        isDisabled={currentPage <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        onPress={() => handleNextPage()}
                        size="sm"
                        variant="flat"
                        isDisabled={currentPage >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
            {/* Add more TabsContent as needed */}
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// Icon components
export const EditDocumentIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M15.48 3H7.52C4.07 3 2 5.06 2 8.52v7.95C2 19.94 4.07 22 7.52 22h7.95c3.46 0 5.52-2.06 5.52-5.52V8.52C21 5.06 18.93 3 15.48 3Z"
      fill="currentColor"
      opacity={0.4}
    />
    <path
      d="M21.02 2.98c-1.79-1.8-3.54-1.84-5.38 0L14.51 4.1c-.1.1-.13.24-.09.37.7 2.45 2.66 4.41 5.11 5.11.03.01.08.01.11.01.1 0 .2-.04.27-.11l1.11-1.12c.91-.91 1.36-1.78 1.36-2.67 0-.9-.45-1.79-1.36-2.71ZM17.86 10.42c-.27-.13-.53-.26-.77-.41-.2-.12-.4-.25-.59-.39-.16-.1-.34-.25-.52-.4-.02-.01-.08-.06-.16-.14-.31-.25-.64-.59-.95-.96-.02-.02-.08-.08-.13-.17-.1-.11-.25-.3-.38-.51-.11-.14-.24-.34-.36-.55-.15-.25-.28-.5-.4-.76-.13-.28-.23-.54-.32-.79L7.9 10.72c-.35.35-.69 1.01-.76 1.5l-.43 2.98c-.09.63.08 1.22.47 1.61.33.33.78.5 1.28.5.11 0 .22-.01.33-.02l2.97-.42c.49-.07 1.15-.4 1.5-.76l5.38-5.38c-.25-.08-.5-.19-.78-.31Z"
      fill="currentColor"
    />
  </svg>
);

export const DeleteDocumentIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M21.07 5.23c-1.61-.16-3.22-.28-4.84-.37v-.01l-.22-1.3c-.15-.92-.37-2.3-2.71-2.3h-2.62c-2.33 0-2.55 1.32-2.71 2.29l-.21 1.28c-.93.06-1.86.12-2.79.21l-2.04.2c-.42.04-.72.41-.68.82.04.41.4.71.82.67l2.04-.2c5.24-.52 10.52-.32 15.82.21h.08c.38 0 .71-.29.75-.68a.766.766 0 0 0-.69-.82Z"
      fill="currentColor"
    />
    <path
      d="M19.23 8.14c-.24-.25-.57-.39-.91-.39H5.68c-.34 0-.68.14-.91.39-.23.25-.36.59-.34.94l.62 10.26c.11 1.52.25 3.42 3.74 3.42h6.42c3.49 0 3.63-1.89 3.74-3.42l.62-10.25c.02-.36-.11-.7-.34-.95Z"
      fill="currentColor"
      opacity={0.399}
    />
    <path
      clipRule="evenodd"
      d="M9.58 17a.75.75 0 0 1 .75-.75h3.33a.75.75 0 0 1 0 1.5h-3.33a.75.75 0 0 1-.75-.75ZM8.75 13a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
