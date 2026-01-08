import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useGetData } from "../../Components/HTTP/GET";
import axios from "axios";
import { toast } from "sonner";

interface LogItem {
  id: number;
  created_at: string;
  company_created_at?: string | null;
  company_grade?: string | null;
  user_id: number | null;
  user_name?: string | null;
  action: string;
  subject_type?: string | null;
  subject_id?: number | null;
  description?: string | null;
  properties?: any;
  ip_address?: string | null;
}

export const Route = createFileRoute("/activity-log/")({
  component: ActivityLogPage,
});

function formatDate(dt: string) {
  try {
    const d = new Date(dt);
    return d.toLocaleDateString();
  } catch {
    return dt;
  }
}

function formatTime(dt: string) {
  try {
    const d = new Date(dt);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dt;
  }
}

function ActivityLogPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "admin") {
      navigate({ to: "/dashboards" });
    }
  }, [role]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryParams = useMemo(
    () => ({
      queryKey: [
        "activity-logs",
        String(page),
        search,
        action,
        dateFrom,
        dateTo,
      ],
      refetchOnWindowFocus: false,
    }),
    [page, search, action, dateFrom, dateTo]
  );

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (action) qs.set("action", action);
  if (dateFrom) qs.set("date_from", dateFrom);
  if (dateTo) qs.set("date_to", dateTo);
  qs.set("page", String(page));

  const { data, isLoading, isError } = useGetData({
    endpoint: `/api/activity-logs?${qs.toString()}`,
    params: queryParams,
  });

  const logs: LogItem[] = (data as any)?.data?.ActivityLogs?.data || [];
  const pagination = (data as any)?.data?.Pagination || {};

  const [sending, setSending] = useState(false);

  const handleSendReport = async () => {
    try {
      setSending(true);
      const token = localStorage.getItem("token");
      // Default to today; backend will compute daily summary
      const today = new Date().toISOString().slice(0, 10);
      await axios.post(
        "/api/activity-logs/send-report",
        { date: today },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      toast.success("Activity report sent");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send report");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6" style={{overflow: 'visible'}}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Log</h1>
          <p className="text-gray-600">Monitor and track all system activities</p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-end gap-4 flex-wrap justify-between">
            <div className="flex items-end gap-4 flex-wrap">
              <div className="flex flex-col min-w-0">
                <label className="text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search description, properties, IP..."
                />
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-sm font-medium text-gray-700 mb-1">Action</label>
                <input
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                  value={action}
                  onChange={(e) => {
                    setPage(1);
                    setAction(e.target.value);
                  }}
                  placeholder="e.g. login, company.created"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={dateFrom}
                  onChange={(e) => {
                    setPage(1);
                    setDateFrom(e.target.value);
                  }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={dateTo}
                  onChange={(e) => {
                    setPage(1);
                    setDateTo(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSendReport}
                disabled={sending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "📄 Send Report"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Activity Log Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div style={{overflowX: 'auto', overflowY: 'visible', paddingTop: '150px', marginTop: '-150px'}}>
            <table className="min-w-full divide-y divide-gray-200" style={{overflow: 'visible'}}>
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700 border-b" style={{width: '130px'}}>Created at</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b" style={{width: '180px'}}>Company Name</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b" style={{width: '140px'}}>Company Type</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b" style={{width: '90px'}}>Grade</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b" style={{width: '110px'}}>Time</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b" style={{width: '120px'}}>User</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b" style={{width: '150px'}}>Action</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b" style={{width: '120px'}}>Status</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b" style={{width: '250px'}}>Remark</th>
            </tr>
          </thead>
          <tbody style={{overflow: 'visible'}}>
            {isLoading && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={9}>Loading activity logs...</td>
              </tr>
            )}
            {isError && (
              <tr>
                <td className="p-4 text-center text-red-600" colSpan={9}>Error loading activity logs</td>
              </tr>
            )}
            {!isLoading && !isError && logs.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={9}>No activity found</td>
              </tr>
            )}
            {logs.map((log, index) => {
              const companyName = log.properties?.company_name || '-';
              const companyNameTruncated = log.properties?.company_name && log.properties.company_name.length > 30 ? log.properties.company_name.substring(0, 30) + '...' : companyName;
              const companyType = log.properties?.company_type || '-';
              const grade = log.company_grade || log.properties?.new_grade || log.properties?.grade || '-';
              const remarks = log.properties?.remarks ? (log.properties.remarks.length > 50 ? log.properties.remarks.substring(0, 50) + '...' : log.properties.remarks) : '-';
              const status = log.properties?.status || log.properties?.new_status || '-';
              const createdAtDate = log.company_created_at || log.created_at;
              
              return (
                <tr key={log.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`} style={{overflow: 'visible'}}>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-900" style={{width: '130px'}}>{formatDate(createdAtDate)}</td>
                  <td className="p-4 text-sm text-gray-900" style={{width: '180px'}}>
                    {companyName !== '-' ? (
                      <div className="relative group">
                        <div 
                          className="font-medium break-words cursor-help" 
                          style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}
                        >
                          {companyNameTruncated}
                        </div>
                        {log.properties?.company_name && log.properties.company_name.length > 30 && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 hidden group-hover:block z-[9999] w-64 pointer-events-none">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl pointer-events-auto">
                              <div className="break-words">
                                {log.properties.company_name}
                              </div>
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                <div className="border-8 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600" style={{width: '140px', wordBreak: 'break-word'}}>{companyType}</td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-900" style={{width: '90px'}}>{grade}</td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-900" style={{width: '110px'}}>{formatTime(log.created_at)}</td>
                  <td className="p-4 text-sm" style={{width: '120px'}}>
                    <span className="font-medium text-gray-900">{log.user_name || 'System'}</span>
                  </td>
                  <td className="p-4 text-sm" style={{width: '150px'}}>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-sm" style={{width: '120px'}}>
                    {status !== '-' ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        status === 'interested' ? 'bg-green-100 text-green-800' :
                        status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        status === 'not_interested' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600" style={{width: '250px'}}>
                    {remarks !== '-' ? (
                      <div className="relative group">
                        <div 
                          className="break-words overflow-hidden cursor-help" 
                          style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}
                        >
                          {remarks}
                        </div>
                        {log.properties?.remarks && log.properties.remarks.length > 50 && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 hidden group-hover:block z-[9999] w-72 pointer-events-none">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl pointer-events-auto">
                              <div className="max-h-32 overflow-y-auto break-words">
                                {log.properties.remarks}
                              </div>
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                <div className="border-8 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 rounded-b-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pagination?.current_page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={(pagination?.current_page || 1) >= (pagination?.last_page || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination?.current_page || 1) - 1) * (pagination?.per_page || 10) + 1}</span> to{' '}
                <span className="font-medium">{Math.min((pagination?.current_page || 1) * (pagination?.per_page || 10), pagination?.total || 0)}</span> of{' '}
                <span className="font-medium">{pagination?.total || 0}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pagination?.current_page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <span className="sr-only">Previous</span>
                  ←
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {pagination?.current_page || 1} of {pagination?.last_page || 1}
                </span>
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={(pagination?.current_page || 1) >= (pagination?.last_page || 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <span className="sr-only">Next</span>
                  →
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

