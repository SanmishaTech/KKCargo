 
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";
import { AxiosError } from "axios";
import { usePostData } from "@/Components/HTTP/POST";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { useGetData } from "@/Components/HTTP/GET";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Skeleton } from "@/Components/ui/skeleton";
import { useEffect, useState } from "react";

const followUpFormSchema = z.object({
  follow_up_date: z.string().nonempty("Follow Up Date is Required"),
  next_follow_up_date: z.string().nonempty("Next Follow Up Date is Required"),
  follow_up_type: z.string().nonempty("Follow Up Type is Required"),
  remarks: z.string().optional(),
});

type FollowUpFormValues = z.infer<typeof followUpFormSchema>;

interface FollowUp {
  id: number;
  follow_up_date: string;
  next_follow_up_date: string;
  follow_up_type: string;
  remarks: string;
  created_at: string;
}



const defaultValues: Partial<FollowUpFormValues> = {
  follow_up_date: new Date().toISOString().split('T')[0],
  next_follow_up_date: "",
  follow_up_type: "",
  remarks: "",
};

function FollowUpForm({ companyId }: { companyId?: number }) {
  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const followUpMutation = usePostData({
    endpoint: "/api/followup",
    params: {
      queryKey: ["followups"],
      onSuccess: () => {
        toast.success("Follow-up added successfully");
        form.reset();
      },
      onError: (error: AxiosError | any) => {
        if (error.response) {
          const { errors, message } = error.response.data;
          if (errors) {
            Object.keys(errors).forEach((key) => {
              form.setError(key as keyof FollowUpFormValues, {
                type: "server",
                message: errors[key][0],
              });
              toast.error(errors[key][0]);
            });
          } else {
            toast.error(message || "Something went wrong, please try again.");
          }
        } else {
          toast.error("Something went wrong, please try again.");
        }
      },
    },
  });

  async function onSubmit(data: FollowUpFormValues) {
    followUpMutation.mutate({ ...data, company_id: companyId });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Follow Up Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="follow_up_date"
                render={({ field }: { field: ControllerRenderProps<FollowUpFormValues, "follow_up_date"> }) => (
                  <FormItem>
                    <FormLabel>Follow Up Date</FormLabel>
                    <Input type="date" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="next_follow_up_date"
                render={({ field }: { field: ControllerRenderProps<FollowUpFormValues, "next_follow_up_date"> }) => (
                  <FormItem>
                    <FormLabel>Next Follow Up Date</FormLabel>
                    <Input type="date" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="follow_up_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow Up Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Follow Up Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Call">Call</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }: { field: ControllerRenderProps<FollowUpFormValues, "remarks"> }) => (
                  <FormItem>
                    <FormLabel>Remark</FormLabel>
                    <Textarea placeholder="Enter Remark" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

function FollowUpHistorySkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-10" /></TableHead>
            <TableHead><Skeleton className="h-4 w-32" /></TableHead>
            <TableHead><Skeleton className="h-4 w-32" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-48" /></TableHead>
            <TableHead><Skeleton className="h-4 w-40" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-10" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function FollowUpHistory({ companyId }: { companyId?: number }) {
  const { data, isLoading, error } = useGetData({
     endpoint: `/api/followup?company_id=${companyId}`,
     params: { queryKey: ['followups', companyId], enabled: !!companyId }
  });
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    if (data && (data as any).data && (data as any).data.Followup) {
      setFollowUps((data as any).data.Followup);
    }
  }, [data]);

  if (isLoading) return <FollowUpHistorySkeleton />;
  if (error) return <div>Error loading follow-ups.</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Follow-Up Count: {followUps.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>First Follow-Up: {followUps.length > 0 ? new Date(followUps[0].created_at).toLocaleString() : 'N/A'}</p>
          <p>Total Follow-Ups: {followUps.length}</p>
        </CardContent>
      </Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Follow-Up Date</TableHead>
            <TableHead>Next Follow-Up Date</TableHead>
            <TableHead>Follow-Up Type</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {followUps.map((followUp, index) => (
            <TableRow key={followUp.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{followUp.follow_up_date}</TableCell>
              <TableCell>{followUp.next_follow_up_date}</TableCell>
              <TableCell>{followUp.follow_up_type}</TableCell>
              <TableCell>{followUp.remarks}</TableCell>
              <TableCell>{new Date(followUp.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Followup({ companyId }: { companyId?: number }) {
  return (
    <div className="p-4 md:p-6">
      <Tabs defaultValue="add">
        <div className="flex justify-center">
          <TabsList className="mb-4 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="add">Add Follow up</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="add">
          <FollowUpForm companyId={companyId} />
        </TabsContent>
        <TabsContent value="history">
          <FollowUpHistory companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
