import { useState, useEffect } from "react";
import { Users, Building2, CalendarClock } from "lucide-react";
import { useGetData } from "../HTTP/GET";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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


export default function ResponsiveLabDashboard() {
  const userString = localStorage.getItem("user");
  const currentUser = userString ? JSON.parse(userString) : { name: 'User', role: '' };

  const [staffCount, setStaffCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [nextUpcomingFollowUp, setNextUpcomingFollowUp] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);

  useGetData({
    endpoint: `/api/dashboard?page=${currentPage}&company_name=${searchQuery}`,
    params: {
      queryKey: ["dashboard", searchQuery, currentPage.toString()],
      onSuccess: (data: any) => {
        if (data.status) {
          const { staff_summary, follow_ups, next_upcoming_follow_up } = data.data;
          setStaffCount(staff_summary.total_staff);
          setCompanyCount(staff_summary.company_count);
          setNextUpcomingFollowUp(next_upcoming_follow_up);
          setFollowUps(follow_ups.data || []);
          setNextPageUrl(follow_ups.next_page_url);
          setPrevPageUrl(follow_ups.prev_page_url);
        }
      },
      onError: (error: any) => {
        console.error("Error fetching dashboard data:", error);
      },
    },
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="flex h-screen ">
      {/* Sidebar for larger screens */}
      {/* <Sidebar className="hidden md:block w-64 shadow-md" /> */}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome, {currentUser.name} 
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <>
            <Card className="bg-accent/40 transition-shadow duration-200 ease-in-out hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Staff Count
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffCount}</div>
              </CardContent>
            </Card>

            <Card className="bg-accent/40 transition-shadow duration-200 ease-in-out hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Company Count</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companyCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-accent/40 transition-shadow duration-200 ease-in-out hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Next Follow-up
                </CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nextUpcomingFollowUp
                    ? new Date(nextUpcomingFollowUp).toLocaleDateString()
                    : "N/A"}
                </div>
              </CardContent>
            </Card>
          </>
        </div>

        <div className="mt-8">
          <Card className="bg-accent/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Follow-ups</CardTitle>
              <Input
                placeholder="Filter by company name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-sm"
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Follow-up Date</TableHead>
                    <TableHead>Next Follow-up Date</TableHead>
                    <TableHead>Follow-up Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followUps.length > 0 ? (
                    followUps.map((followUp) => (
                      <TableRow key={followUp.id}>
                        <TableCell className="font-medium">{followUp.company_name}</TableCell>
                       
                        <TableCell>{new Date(followUp.follow_up_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(followUp.next_follow_up_date).toLocaleDateString()}</TableCell>
                        <TableCell>{followUp.follow_up_type}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {followUp.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No follow-ups found.
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
