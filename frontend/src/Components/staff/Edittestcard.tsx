import { useState, useEffect } from "react";
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

const profileFormSchema = z.object({
  staff_name:     z.string().nonempty("Staff Name is required"),
  employee_code:  z.string().nonempty("Employee Code is required"),
  date_of_birth:  z.string().nonempty("Date of Birth is required"),
  address:        z.string().nonempty("Address is required"),
  mobile:         z.string().nonempty("Mobile is required"),
  role:           z.string().nonempty("Role is required"),
  email:          z.string().nonempty("Email is required").email("Invalid email address"),
  password:       z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema> & {
  name?: string;
};

// This can come from your database or API.

function ProfileForm({ formData, id }: { formData: any; id?: string }) {
  const defaultValues: Partial<ProfileFormValues> = formData;
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Populate form when new data arrives
  useEffect(() => {
    if (formData && Object.keys(formData).length) {
      form.reset({
        ...formData,
        staff_name: formData.staff_name ?? formData.name,
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
                  rules={{
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/, // Ensures exactly 10 numeric digits
                      message:
                        "Mobile number must be exactly 10 digits and contain only numbers",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10} // Prevents input beyond 10 characters
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, ""); // Removes non-numeric characters
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
                        onValueChange={(value: string) => {
                          field.onChange(value);
                        }} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role">
                              {field.value ? field.value.charAt(0).toUpperCase() + field.value.slice(1) : ''}
                            </SelectValue>
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
          Date of Birth<span className="text-red-500">*</span>
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
                      <FormLabel>Email</FormLabel>
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
  const navigate = useNavigate();
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
