import { useState, useEffect } from "react";
import { useGetData } from "../HTTP/GET";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function TodayFollowup() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useGetData({
    endpoint: `/api/dashboard?page=${currentPage}&company_name=${searchQuery}&status=${statusFilter}&next_follow_up_date=${today}`,
    params: {
      queryKey: ["today-followup", searchQuery, statusFilter, currentPage.toString()],
      onSuccess: (data: any) => {
        if (!data?.status) {
          return;
        }

        const followUpsPayload = data?.data?.follow_ups ?? {};
        setFollowUps(followUpsPayload?.data ?? []);
        setNextPageUrl(followUpsPayload?.next_page_url ?? null);
        setPrevPageUrl(followUpsPayload?.prev_page_url ?? null);
      },
      onError: (error: any) => {
        console.error("Error fetching today's follow-ups:", error);
      },
    },
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const navigate = useNavigate();

  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboards">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Today's Follow-ups</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <CalendarClock className="h-8 w-8" />
              Today's Follow-ups
            </h1>
            <p className="text-muted-foreground mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Card className="bg-accent/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Follow-ups ({followUps.length})</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Filter by company name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="max-w-sm"
                />
                <Select
                  value={statusFilter || "all"}
                  onValueChange={(value) => {
                    setStatusFilter(value === "all" ? "" : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="not_answering">Not Answering the Call</SelectItem>
                    <SelectItem value="wrong_number">Wrong Number</SelectItem>
                    <SelectItem value="busy_on_call">Busy on Another Call</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Next Follow-up Date</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followUps.length > 0 ? (
                    followUps.map((followUp) => (
                      <TableRow
                        key={followUp.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => navigate({ to: "/company", search: { search: followUp.company_name || "" } })}
                      >
                        <TableCell className="font-medium">{followUp.company_name}</TableCell>
                        <TableCell>
                          {followUp.next_follow_up_date && !isNaN(new Date(followUp.next_follow_up_date).getTime())
                            ? new Date(followUp.next_follow_up_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{followUp.remarks}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {followUp.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {followUp.created_at && !isNaN(new Date(followUp.created_at).getTime())
                            ? (() => {
                                const date = new Date(followUp.created_at);
                                const day = date.getDate();
                                const month = date.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
                                const year = date.getFullYear();
                                return (
                                  <div className="text-center">
                                    <div className="font-bold">{day}</div>
                                    <div className="text-xs">{month}</div>
                                    <div className="text-xs">{year}</div>
                                  </div>
                                );
                              })()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                          <CalendarClock className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-lg font-semibold">No Records Found</p>
                          <p className="text-sm text-muted-foreground">No follow-ups are scheduled for today.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!prevPageUrl}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!nextPageUrl}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
