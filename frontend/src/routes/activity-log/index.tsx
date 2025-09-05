import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import { useGetData } from "../../Components/HTTP/GET";
import axios from "axios";
import { toast } from "sonner";

interface LogItem {
  id: number;
  created_at: string;
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
    return d.toLocaleString();
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
      queryKey: ["activity-logs", page, search, action, dateFrom, dateTo],
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
      <div className="max-w-7xl mx-auto px-4 py-6">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700 border-b">Time</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b">User</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b">Action</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b">Description</th>
              <th className="text-left p-4 font-semibold text-gray-700 border-b">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={5}>Loading activity logs...</td>
              </tr>
            )}
            {isError && (
              <tr>
                <td className="p-4 text-center text-red-600" colSpan={5}>Error loading activity logs</td>
              </tr>
            )}
            {!isLoading && !isError && logs.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={5}>No activity found</td>
              </tr>
            )}
            {logs.map((log, index) => (
              <tr key={log.id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="p-4 whitespace-nowrap text-sm text-gray-900">{formatDate(log.created_at)}</td>
                <td className="p-4 text-sm">
                  <span className="font-medium text-gray-900">{log.user_name || 'System'}</span>
                </td>
                <td className="p-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">{log.description || '-'}</td>
                <td className="p-4 text-sm text-gray-500 font-mono">{log.ip_address || '-'}</td>
              </tr>
            ))}
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

