import { useState, useEffect, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AxiosError } from "axios";
import { usePutData } from "@/Components/HTTP/PUT";
import { useGetData } from "@/Components/HTTP/GET";
import { toast } from "sonner";
import { useNavigate, useParams } from "@tanstack/react-router";

// Helper to coerce null/undefined to empty string and then validate
const requiredString = (message: string) =>
  z.preprocess((val) => (val == null ? "" : val), z.string().trim().min(1, message));
// Optional helper: treat empty string/null/undefined as undefined
const optionalString = () =>
  z.preprocess(
    (val) => (val === "" || val == null ? undefined : val),
    z.string().trim().optional()
  );

const profileFormSchema = z.object({
  staff_name:     requiredString("Staff Name is required"),
  employee_code:  optionalString(),
  date_of_birth:  z.preprocess(
                    (val) => (val === "" || val == null ? undefined : val),
                    z.string().trim().optional()
                  ),
  address:        optionalString(),
  mobile:         z.preprocess(
                    (val) => (val === "" || val == null ? undefined : val),
                    z
                      .string()
                      .trim()
                      .regex(/^[0-9]{10}$/,
                        "Mobile number must be exactly 10 digits and contain only numbers")
                      .optional()
                  ),
  role:           requiredString("Role is required"),
  email:          z.preprocess(
                    (val) => (val == null ? "" : val),
                    z.string().trim().min(1, "Email is required").email("Invalid email address")
                  ),
  password:       z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema> & {
  name?: string;
};

// This can come from your database or API.

function ProfileForm({ formData, id }: { formData: any; id?: string }) {
  // Provide explicit defaults so all inputs are controlled from the first render
  const defaultValues: Partial<ProfileFormValues> = {
    staff_name: "",
    employee_code: "",
    date_of_birth: "",
    address: "",
    mobile: "",
    role: "",
    email: "",
    password: "",
  };
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const navigate = useNavigate();

  // Populate form when new data arrives
  useEffect(() => {
    if (formData && Object.keys(formData).length) {
      // Sanitize incoming data: convert null/undefined to empty string for text fields
      const sanitized: any = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, v == null ? "" : v])
      );
      form.reset({
        ...sanitized,
        staff_name: sanitized.staff_name || sanitized.name || "",
      });
    }
  }, [formData]);

  // Setup mutation for updating staff
  const updateStaffMutation = usePutData({
    endpoint: `/api/staff/${id}`,
    params: {
      queryKey: ["staff"],

      onSuccess: () => {
        toast.success("Staff Updated Successfully");
        navigate({ to: "/staff" });
      },
      onError: (error: AxiosError | any) => {
        if (error.response) {
          const { errors, message } = error.response.data;
          if (errors) {
            Object.keys(errors).forEach((key) => {
              form.setError(key as keyof ProfileFormValues, {
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

  async function onSubmit(data: ProfileFormValues) {
    // Attach name field required by backend
    data.name = data.staff_name;

    // Send JSON payload directly (no multipart/form-data)
    updateStaffMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-[2rem]"
      >
        {" "}
        <div className="max-w-full p-4 space-y-6">
          {/* Staff Information Card */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Information</CardTitle>
                </div>
                 
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-5 space-y-3">
                <FormField
                  control={form.control}
                  name="staff_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-center min-h-[100px]">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employee_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Employee Code..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10} // Prevents input beyond 10 characters
                          onInput={(e: FormEvent<HTMLInputElement>) => {
                            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); // Removes non-numeric characters
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={(value: string) => field.onChange(value)}
                        value={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          
                           <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
  control={form.control}
  name="date_of_birth"
  render={({ field }) => {
    // Calculate the date 18 years ago
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    const maxDate = eighteenYearsAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    return (
      <FormItem>
        <FormLabel>
          Date of Birth
        </FormLabel>
        <FormControl>
          <Input
            id="date_of_birth"
            type="date"
            max={maxDate} // Limit to 18 years ago
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }}
/>
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Address..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          {/* Profile Information Card */}
          <Card className="w-full ">
            <CardHeader>
              <CardTitle>Staff Login Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Email..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Password..."
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end w-full gap-3 ">
          <Button
            onClick={() => navigate({ to: "/staff" })}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Update Staff
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  const { id } = useParams({ from: "/staff/edit/$id" });
  const [formData, setFormData] = useState<any>({});

  // Fetch staff details
  useGetData({
    endpoint: `/api/staff/${id}`,
    params: {
      queryKey: ["staff", id],
      enabled: !!id,

      onSuccess: (res: any) => {
        setFormData(res.data.Staff);
      },
      onError: (error: AxiosError) => {
        toast.error(error.message);
      },
    },
  });
  return (
    <Card className="min-w-[350px] overflow-auto bg-light shadow-md pt-4 ">
      <Button
        onClick={() => window.history.back()}
        className="ml-4 flex gap-2 m-8 mb-4"
      >
        <MoveLeft className="w-5 text-white" />
        Back
      </Button>

      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>Staff Master</CardTitle>
          {formData?.institute_name && (
            <span className="text-muted-foreground">
              {formData.institute_name}
            </span>
          )}
        </div>
        <CardDescription>Edit/Update the Staff</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 ">
          <ProfileForm formData={formData} id={id} />
        </div>
      </CardContent>
    </Card>
  );
}
