import { useEffect, useState } from "react";
import { useGetData } from "@/Components/HTTP/GET";
import Dashboard from "./Dashboardreuse";
import userAvatar from "@/images/Profile.jpg";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<{dateFilter?: string, companyType?: string}>({});

  // Data fetching using shared GET hook
  const {
    data: apiResponse,
    isLoading: queryLoading,
    isError: queryError,
    refetch,
  } = useGetData({
    endpoint: (() => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (filter.dateFilter) params.set('date_filter', filter.dateFilter)
      if (filter.companyType) params.set('company_type', filter.companyType)
      params.set('page', paginationState.currentPage.toString())
      return `/api/companies?${params.toString()}`
    })(),
    params: {
      queryKey: ["companies", searchQuery, filter, paginationState.currentPage],
      onSuccess: (response: any) => {
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
        } as typeof paginationState;

        // Only update pagination when something actually changed
        setPaginationState((prev) => {
          const isSame =
            prev.currentPage === newPaginationState.currentPage &&
            prev.totalPages === newPaginationState.totalPages &&
            prev.perPage === newPaginationState.perPage &&
            prev.total === newPaginationState.total;
          return isSame ? prev : newPaginationState;
        });
      },
      onError: (err: any) => {
        console.error("Error fetching data:", err);
        setError(err);
      },
    },
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

  // Refetch whenever search query, filters, or page changes
  useEffect(() => {
    refetch();
  }, [searchQuery, filter.dateFilter, filter.companyType, paginationState.currentPage]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
    await fetchData(query, 1);
  };

  const handleDateFilter = (dateValue: string) => {
    setFilter((prev) => ({ ...prev, dateFilter: dateValue }));
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleCompanyTypeFilter = (companyType: string) => {
    setFilter((prev) => ({ ...prev, companyType: companyType }));
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
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
      fetchData(searchQuery, page);
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
          { label: "Send Brochure", key: "send_brochure" },
          { label: "Status", key: "nine" },
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
      return `${month} ${year}`;
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
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            item?.status === "interested"
              ? "bg-green-100 text-green-800"
              : item?.status === "waiting"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}>
          {capital(item?.status)}
        </span>
      ),
      delete:
        item?.role?.toLowerCase() !== "admin" ? "/companies/" + item?.id : null,
    };
  });

  return (
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
        dateFilter={filter.dateFilter}
        companyType={filter.companyType}
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
  );
}
