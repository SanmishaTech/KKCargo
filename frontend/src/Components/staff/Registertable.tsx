import { useEffect, useState, useCallback, useMemo } from "react";
import { useGetData } from "@/Components/HTTP/GET";
import Dashboard from "./Dashboardreuse";
import userAvatar from "@/images/Profile.jpg";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface TableColumnHeader {
  label: string;
  key: string;
}

interface TableColumns {
  title: string;
  description: string;
  headers: TableColumnHeader[];
  actions: { label: string; value: string }[];
  pagination: any;
}

// Server item shape (subset of StaffResource)
interface StaffItem {
  id: number | string;
  name?: string;
  staff_name?: string;
  email?: string;
  role?: string;
}

interface DashboardConfig {
  breadcrumbs: Breadcrumb[];
  searchPlaceholder: string;
  userAvatar: string;
  tableColumns: TableColumns;
}

export default function Dashboardholiday() {
  const user = localStorage.getItem("user");
  const User = JSON.parse(user || "{}");
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [data, setData] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const typeofschema = {
    profile_name: "String",
    institute_id: "String",
    email: "String",
    name: "String",
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
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized callback functions to prevent infinite re-renders
  const onSuccess = useCallback((response: any) => {
    if (!response?.data) return;

    // Normalize Staff payload: can be an array or an object with a `data` array (Laravel resource pagination)
    const staffPayload = response?.data?.Staff;
    const normalized = Array.isArray(staffPayload)
      ? staffPayload
      : Array.isArray(staffPayload?.data)
      ? staffPayload.data
      : [];

    // Avoid updating state if data hasn't changed to prevent extra re-renders
    setData((prev) => {
      return JSON.stringify(prev) !== JSON.stringify(normalized) ? normalized : prev;
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

  // Memoized params object to prevent recreation on every render
  const queryParams = useMemo(() => ({
    queryKey: ["staff", String(searchQuery), String(paginationState.currentPage)],
    onSuccess,
    onError,
  }), [searchQuery, paginationState.currentPage, onSuccess, onError]);

  // Data fetching using shared GET hook
  const { isLoading: queryLoading, isError: queryError } = useGetData({
    endpoint: `/api/staff${searchQuery ? `?search=${searchQuery}&` : "?"}page=${paginationState.currentPage}`,
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
    // Build table headers and row actions dynamically based on the logged-in user's role
    const tableHeaders: TableColumnHeader[] = [
      { label: "Name", key: "one" },
      { label: "Email", key: "two" },
      { label: "Role", key: "four" },
    ];

    // Show the Action column only for non-staff users
    if (User?.role?.toLowerCase() !== "staff") {
      tableHeaders.push({ label: "Action", key: "action" });
    }

    // Define available row actions (Edit/Delete) only if the user is not staff
    const rowActions =
      User?.role?.toLowerCase() !== "staff"
        ? [
            { label: "Edit", value: "edit" },
            { label: "Delete", value: "delete" },
          ]
        : [];

    setConfig({
      breadcrumbs: [
        { label: "Home", href: "/dashboards" },
        { label: "/", href: "" },
        { label: "Staff" },
      ],
      searchPlaceholder: "Search staff...",
      userAvatar: "/path-to-avatar.jpg",
      tableColumns: {
        title: `Staff`,
        description: "Manage staff  and view their details.",
        headers: tableHeaders,
        actions: rowActions,
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
    navigate({ to: "/staff/add" });
    // For example, navigate to an add registration page or open a modal
  };



  const handleFilterChange = (filterValue: any) => {
    console.log(`Filter changed: ${filterValue}`);
    // You can implement filtering logic here, possibly refetching data with filters applied
  };

  const handleProductAction = (action: string, product: any) => {
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
  const mappedTableData = (Array.isArray(data) ? data : []).map((item: StaffItem) => {
    const capital = (str: any) =>
      typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : str;

    const name = item?.name ?? item?.staff_name ?? "NA";
    const role = item?.role ?? "Unknown";

    return {
      id: item?.id,
      one: capital(name),
      two: item?.email ?? "NA",
      four: capital(role),
      delete: role?.toLowerCase?.() !== "admin" ? "/staff/" + item?.id : null,
    };
  });

  return (
    <div className="p-4">
      <Dashboard
        breadcrumbs={config.breadcrumbs as any}
        searchPlaceholder={config.searchPlaceholder}
        userAvatar={userAvatar}
        tableColumns={config.tableColumns}
        tableData={mappedTableData as any}
        onAddProduct={handleAddProduct}
        onFilterChange={handleFilterChange as unknown as () => void}
        onProductAction={handleProductAction as unknown as () => void}
        onSearch={handleSearch}
        currentPage={paginationState.currentPage}
        totalPages={paginationState.totalPages}
        handleNextPage={handleNextPage}
        handlePrevPage={handlePrevPage}
        setCurrentPage={(page: number) => handlePageChange(page)}
        handlePageChange={handlePageChange}
        typeofschema={typeofschema}
        fetchData={fetchData}
      />
    </div>
  );
}
