import { useEffect, useState, useCallback, useMemo } from "react";
import { useGetData } from "@/Components/HTTP/GET";
import Dashboard from "./Dashboardreuse";
import userAvatar from "@/images/Profile.jpg";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Company {
  id: string;
  company_name: string;
  contact_email: string;
  contact_mobile: string;
  role: string;
  status: string;
  type_of_company?: string;
  services?: { serviceId?: { price?: number } }[];
  paymentMode?: { paidAmount?: number };
  created_at: string;
}

export default function Dashboardholiday() {
  const user = localStorage.getItem("user");
  const User = JSON.parse(user);
  const [config, setConfig] = useState(null);
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const typeofschema = {
    profile_name: "String",
    institute_id: "String",
    email: "String",
    name: "String",
    is_teaching: "Boolean",
    data_of_birth: "String",
    address: "String",
    mobile: "String",
    alternate_mobile: "String",
    password: "String",
  };

  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    total: 0,
  });
  const routeSearch: any = useSearch({ from: "/company/" });
  const [searchQuery, setSearchQuery] = useState(routeSearch?.search ?? "");
  const [filter, setFilter] = useState<{dateFilter?: string, companyType?: string, city?: string, status?: string, createdAt?: string, day?: string, month?: string, year?: string}>({});
  const [showTodayFollowupPopup, setShowTodayFollowupPopup] = useState(false);
  const [todayFollowups, setTodayFollowups] = useState<any[]>([]);
  const [statusOptions] = useState([
    { value: "interested", label: "Interested" },
    { value: "not_interested", label: "Not interested" },
    { value: "not_answering", label: "Not answering the call" },
    { value: "wrong_number", label: "Wrong number" },
    { value: "busy_on_call", label: "Busy on another call" },
  ]);

  // Memoized callback functions to prevent infinite re-renders
  const onSuccess = useCallback((response: any) => {
    if (!response?.data) return;

    // Avoid updating state if data hasn't changed to prevent extra re-renders
    setData((prev) => {
      const newData = response.data.Company || [];
      return JSON.stringify(prev) !== JSON.stringify(newData) ? newData : prev;
    });

    const pagination = response.data.Pagination || {};
    const newPaginationState = {
      currentPage: Number(pagination.current_page),
      totalPages: Number(pagination.last_page),
      perPage: Number(pagination.per_page),
      total: Number(pagination.total),
    };

    // Only update pagination when something actually changed
    setPaginationState((prev) => {
      const isSame =
        prev.currentPage === newPaginationState.currentPage &&
        prev.totalPages === newPaginationState.totalPages &&
        prev.perPage === newPaginationState.perPage &&
        prev.total === newPaginationState.total;
      return isSame ? prev : newPaginationState;
    });
  }, []);

  const onError = useCallback((err: any) => {
    console.error("Error fetching data:", err);
    setError(err);
  }, []);

  // Memoized endpoint to prevent recreation on every render
  const endpoint = useMemo(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (filter.dateFilter) params.set('date_filter', filter.dateFilter)
    if (filter.companyType) params.set('company_type', filter.companyType)
    if (filter.city) params.set('city', filter.city)
    if (filter.status) params.set('status', filter.status)
    if (filter.createdAt) params.set('created_at', filter.createdAt)
    if (filter.day) params.set('day', filter.day)
    if (filter.month) params.set('month', filter.month)
    if (filter.year) params.set('year', filter.year)
    params.set('page', paginationState.currentPage.toString())
    return `/api/companies?${params.toString()}`
  }, [searchQuery, filter.dateFilter, filter.companyType, filter.city, filter.status, filter.createdAt, filter.day, filter.month, filter.year, paginationState.currentPage]);

  // Memoized params object to prevent recreation on every render
  const queryParams = useMemo(() => ({
    queryKey: ["companies", searchQuery, filter, paginationState.currentPage],
    onSuccess,
    onError,
  }), [searchQuery, filter, paginationState.currentPage, onSuccess, onError]);

  // Data fetching using shared GET hook
  const {
    data: apiResponse,
    isLoading: queryLoading,
    isError: queryError,
    refetch,
  } = useGetData({
    endpoint,
    params: queryParams,
  });

  useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError as any);
    }
  }, [queryError]);

  // Update local state when route search param changes (e.g., from dashboard row click)
  useEffect(() => {
    if ((routeSearch?.search ?? "") !== searchQuery) {
      setSearchQuery(routeSearch?.search ?? "");
      setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [routeSearch?.search]);

  // Fetch today's follow-ups and show popup only after login
  useEffect(() => {
    const shouldShowPopup = sessionStorage.getItem("showFollowupPopup");
    
    if (shouldShowPopup === "true") {
      const fetchTodayFollowups = async () => {
        try {
          const today = new Date().toISOString().split("T")[0];
          const response = await axios.get(`/api/dashboard?next_follow_up_date=${today}`, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          });

          if (response.data?.status && response.data?.data?.follow_ups?.data) {
            const followups = response.data.data.follow_ups.data;
            if (followups.length > 0) {
              setTodayFollowups(followups);
              setShowTodayFollowupPopup(true);
            }
          }
        } catch (error) {
          console.error("Error fetching today's follow-ups:", error);
        }
      };

      fetchTodayFollowups();
      // Clear the flag after showing popup
      sessionStorage.removeItem("showFollowupPopup");
    }
  }, []);

  // Wrapper function – we now rely on the shared GET hook for actual fetching
  const fetchData = (query: string = "", page: number = 1) => {
    setSearchQuery(query);
    setPaginationState((prev) => ({ ...prev, currentPage: page }));
  };

  // The useGetData hook will automatically refetch when queryParams change
  // No need for manual refetch

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
    // The useGetData hook will automatically refetch when queryParams change
  };

  const handleDateFilter = (dateValue: string) => {
    setFilter((prev) => ({ ...prev, dateFilter: dateValue }));
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleCompanyTypeFilter = (companyType: string) => {
    setFilter((prev) => ({ ...prev, companyType: companyType }));
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleCityFilter = (city: string) => {
    setFilter((prev) => ({ ...prev, city: city }));
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilter((prev) => ({ ...prev, status: status }));
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleCreatedAtFilter = (createdAt: string) => {
    setFilter((prev) => ({ ...prev, createdAt: createdAt }));
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleDayFilter = (day: string) => {
    setFilter((prev) => ({ ...prev, day: day }));
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleMonthFilter = (month: string) => {
    setFilter((prev) => ({ ...prev, month: month }));
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleYearFilter = (year: string) => {
    setFilter((prev) => ({ ...prev, year: year }));
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Handle status update for companies
  const handleStatusUpdate = async (companyId: string, newStatus: string) => {
    try {
      const response = await axios.put(`/api/companies/${companyId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (response.data.status) {
        // Update the local state
        setData(prev => 
          prev.map(company => 
            company.id === companyId 
              ? { ...company, status: newStatus }
              : company
          )
        );
        toast.success("Status updated successfully");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleNextPage = () => {
    if (paginationState.currentPage < paginationState.totalPages) {
      handlePageChange(paginationState.currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (paginationState.currentPage > 1) {
      handlePageChange(paginationState.currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationState.totalPages) {
      setPaginationState((prev) => ({ ...prev, currentPage: page }));
      // No need to call fetchData here as the useGetData hook will automatically refetch when the page changes
    }
  };

  useEffect(() => {
    setConfig({
      breadcrumbs: [
        { label: "Home", href: "/dashboards" },
        { label: "/", href: "" },
        { label: "Company" },
      ],
      searchPlaceholder: "Search Company...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: `Company`,
        description: "Manage Company  and view their details.",
        headers: [
          { label: "Created At", key: "one" },
          { label: "Company Name", key: "two" },
          { label: "Company Type", key: "three" },
          { label: "Street Address", key: "four" },
          { label: "City", key: "five" },
          { label: "Email", key: "six" },
          { label: "Contact Person", key: "seven" },
          { label: "Mobile", key: "eight" },
          { label: "Remark", key: "remark" },
          { label: "Send Brochure", key: "send_brochure" },
          { label: "Status", key: "nine" },
          { label: "Last Calling", key: "last_calling" },
          { label: "Action", key: "action" },
        ],
        actions: [
          { label: "Edit", value: "edit" },
          { label: "Delete", value: "delete" },
        ],
        pagination: {
          currentPage: paginationState.currentPage,
          lastPage: paginationState.totalPages,
          perPage: paginationState.perPage,
          total: paginationState.total,
          from: (paginationState.currentPage - 1) * paginationState.perPage + 1,
          to: Math.min(
            paginationState.currentPage * paginationState.perPage,
            paginationState.total
          ),
        },
      },
    });
  }, [data, paginationState]); // Update dependencies to include data

  const navigate = useNavigate();

  // Handlers for actions
  const handleAddProduct = () => {
    console.log("Add Registration clicked");
    console.log("AS");
    navigate({ to: "/company/add" });
    // For example, navigate to an add registration page or open a modal
  };

  const handleExport = () => {
    console.log("Export clicked");
    // Implement export functionality such as exporting data as CSV or PDF
  };

  const handleFilterChange = (filterValue) => {
    console.log(`Filter changed: ${filterValue}`);
    // You can implement filtering logic here, possibly refetching data with filters applied
  };

  const handleProductAction = (action, product) => {
    console.log(`Action: ${action} on registration:`, product);
    if (action === "edit") {
      // Navigate to edit page or open edit modal
    } else if (action === "delete") {
      // Implement delete functionality, possibly with confirmation
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Table skeleton */}
        <div className="border rounded-md divide-y">
          {[...Array(10)].map((_, idx) => (
            <div key={idx} className="flex items-center p-4 space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-8 w-16 ml-auto" />
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex justify-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    );
  }
  if (error)
    return <div className="p-4 text-red-500">Error loading registrations.</div>;
  if (!config) return <div className="p-4">Loading configuration...</div>;

  // Map the API data to match the Dashboard component's expected tableData format
    const mappedTableData = (Array.isArray(data) ? data : []).map((item) => {
    const services = item?.services || [];
    const paidAmount = item?.paymentMode?.paidAmount || 0;

    // Calculate the total service price based on each service's populated details.
    const totalServicePrice = services.reduce((acc, service) => {
      const servicePrice = service?.serviceId?.price || 0; // Replace 'price' with the actual field name for service price
      return acc + servicePrice;
    }, 0);

    // Calculate balance amount based on total service price and paid amount.
    const balanceAmount =
      totalServicePrice - paidAmount > 0 ? totalServicePrice - paidAmount : 0;

    const capital = (str) =>
      typeof str === "string"
        ? str.charAt(0).toUpperCase() + str.slice(1)
        : str;

    const formatDate = (dateString: string | undefined) => {
      if (!dateString) return "NA";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "NA";
      }
      // Format as "MONTH YEAR" i.e. "JULY 2025"
      const month = date.toLocaleString("en-US", { month: "long" }).toUpperCase();
      const year = date.getFullYear();
      return `${date.getDate()} ${month} ${year}`;
    };

    const formatDateDDMMYYYY = (dateString: string | undefined) => {
      if (!dateString || dateString === "-") return "-";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "-";
      }
      // Format as DD/MM/YYYY
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const mobileNumber = item?.contact_mobile;

    return {
      id: item?.id,
      one: formatDate(item?.created_at),
      two: capital(item?.company_name || "NA"),
      three: capital(item?.type_of_company || "NA"),
      four: capital(item?.street_address || "NA"),
      five: capital(item?.city || "NA"),
      six: capital(item?.contact_email || "NA"),
      seven: capital(item?.contact_person || "NA"),
      eight: mobileNumber ? (
        <a
          href={`tel:${mobileNumber}`}
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {mobileNumber}
        </a>
      ) : (
        "NA"
      ),
      nine: (
        <Select
          value={item?.status || "interested"}
          onValueChange={(value) => handleStatusUpdate(item?.id, value)}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
      last_calling: formatDateDDMMYYYY(item?.last_calling_date),
      delete:
        item?.role?.toLowerCase() !== "admin" ? "/companies/" + item?.id : null,
    };
  });

  return (
    <>
      {/* Today's Follow-up Popup */}
      <Dialog open={showTodayFollowupPopup} onOpenChange={setShowTodayFollowupPopup}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <CalendarClock className="h-6 w-6" />
              Today's Follow-ups ({todayFollowups.length})
            </DialogTitle>
            <DialogDescription>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayFollowups.slice(0, 7).map((followUp) => (
                  <TableRow key={followUp.id}>
                    <TableCell className="font-medium">{followUp.company_name}</TableCell>
                    <TableCell>{followUp.remarks}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {followUp.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowTodayFollowupPopup(false);
                          setSearchQuery(followUp.company_name || "");
                          setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {todayFollowups.length > 7 && (
              <div className="mt-3 text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setShowTodayFollowupPopup(false);
                    navigate({ to: "/today-followup" });
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  See more ({todayFollowups.length - 7} more follow-ups)
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setShowTodayFollowupPopup(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-4">
        <Dashboard
        breadcrumbs={config.breadcrumbs}
        searchPlaceholder={config.searchPlaceholder}
        userAvatar={userAvatar}
        tableColumns={config.tableColumns}
        tableData={mappedTableData}
        onAddProduct={handleAddProduct}
        onExport={handleExport}
        onFilterChange={handleFilterChange}
        onProductAction={handleProductAction}
        onSearch={handleSearch}
        onDateFilter={handleDateFilter}
        onCompanyTypeFilter={handleCompanyTypeFilter}
        onCityFilter={handleCityFilter}
        onStatusFilter={handleStatusFilter}
        onCreatedAtFilter={handleCreatedAtFilter}
        onDayFilter={handleDayFilter}
        onMonthFilter={handleMonthFilter}
        onYearFilter={handleYearFilter}
        dateFilter={filter.dateFilter}
        companyType={filter.companyType}
        city={filter.city}
        status={filter.status}
        createdAt={filter.createdAt}
        day={filter.day}
        month={filter.month}
        year={filter.year}
        currentPage={paginationState.currentPage}
        totalPages={paginationState.totalPages}
        handleNextPage={handleNextPage}
        handlePrevPage={handlePrevPage}
        setCurrentPage={(page) => handlePageChange(page)}
        handlePageChange={handlePageChange}
        typeofschema={typeofschema}
        fetchData={fetchData}
      />
      </div>
    </>
  );
}
