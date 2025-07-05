import { Link, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { MoveLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { usePostData } from "@/Components/HTTP/POST";
import { toast } from "sonner";

 
const profileFormSchema = z.object({
  staff_name: z.string().nonempty("Name is Required"),
  employee_code: z.string().nonempty("Employee Code is Required"),
   date_of_birth: z.any().optional(),
   academic_years_id: z.any().optional(),
  address: z.string().nonempty("Address is Required"),
  mobile: z.string().optional(),
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.string().nonempty("Password is required"),
  role: z.string().nonempty("Role is required"),
  
 });

type ProfileFormValues = z.infer<typeof profileFormSchema> & {
  userId?: string;
  name?: string;
};

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  role: "staff",  
   staff_name: "",
   employee_code: "",
   address: "",
  mobile: "",
  email: "",
  password: ""
};

function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    
    mode: "onChange",
  });
  const user = localStorage.getItem("user");
  const User = JSON.parse(user || "{}");
  const token = localStorage.getItem("token");

  // Setup mutation using custom POST hook
  const staffMutation = usePostData({
    endpoint: "/api/staff",
    
    params: {
      queryKey: ["staff"],
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      onSuccess: () => {
        toast.success("Staff Master Created Successfully");
        window.history.back();
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
    // attach additional metadata
    data.userId = User?._id;
    data.name = data.staff_name;

    // Build multipart form data from all defined values
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    // Trigger the mutation – hook handles success/error feedback
    staffMutation.mutate(formData);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-[2rem]"
      >
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
                      <FormLabel className="">Name<span className="text-red-500">*</span></FormLabel>
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
                    <FormItem >
                      <FormLabel >Employee Code<span className="text-red-500">*</span></FormLabel>
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
                      <FormLabel>Mobile<span className="text-red-500">*</span></FormLabel>
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
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "role"> }) => (
                    <FormItem className="">
                      <FormLabel>Role<span className="text-red-500">*</span></FormLabel>
                      <Select 
                      
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
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
                    <FormLabel>Address<span className="text-red-500">*</span></FormLabel>
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
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 ">
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
                    <FormLabel>Password<span className="text-red-500">*</span></FormLabel>
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
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end w-full gap-3 ">
          <Button
            onClick={() => window.history.back()}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Add Staff
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
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
        <CardTitle>Staff Master</CardTitle>
        <CardDescription>Add Staff Master</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 ">
          <ProfileForm />
        </div>
      </CardContent>
    </Card>
  );
}
