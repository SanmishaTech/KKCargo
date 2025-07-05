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
import { ComboboxWithDelete } from "@/components/ui/combobox-with-delete";
import { useState, useEffect } from "react";
import axios from "axios";
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

 
const profileFormSchema = z
  .object({
    company_name: z.string().nonempty("Company Name is Required"),
    street_address: z.string().nonempty("Street Address is Required"),
    area: z.any().optional(),
    city: z.any().optional(),
    state: z.string().nonempty("State is Required"),
    pincode: z.string().nonempty("Pincode is Required"),
    country: z.string().nonempty("Country is Required"),
    type_of_company: z.string().nonempty("Type of Company is Required"),
    other_type_of_company: z.string().optional(),
    contact_person: z.string().nonempty("Contact Person is Required"),
    contact_person_designation: z.string().nonempty("Contact Person's Designation is Required"),
    contact_email: z
      .string()
      .email({ message: "Invalid email address" })
      .or(z.literal(""))
      .optional(),
    contact_mobile: z.string().nonempty("Contact Mobile is Required"),
    alternate_contact_person: z.any().optional(),
    alternate_contact_person_designation: z.any().optional(),
    alternate_contact_email: z
      .string()
      .email({ message: "Invalid email address" })
      .or(z.literal(""))
      .optional(),
      alternate_contact_mobile: z.any().optional(),

  })
  .refine(
    (data) => {
      if (data.type_of_company === "Other") {
        return !!data.other_type_of_company && data.other_type_of_company.length > 0;
      }
      return true;
    },
    {
      message: "Please specify the other type of company",
      path: ["other_type_of_company"],
    }
  );

type ProfileFormValues = z.infer<typeof profileFormSchema> & {
  userId?: string;
  name?: string;
};

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  company_name: "",
  street_address: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  type_of_company: "",
  other_type_of_company: "",
  contact_person: "",
  contact_person_designation: "",
  contact_email: "",
  contact_mobile: "",
  alternate_contact_person: "",
  alternate_contact_person_designation: "",
  alternate_contact_email: "",
  alternate_contact_mobile: "",
};

function ProfileForm() {
  // store dropdown options
  const [companyTypes, setCompanyTypes] = useState<{ value: string; label: string }[]>([]);

  // fetch distinct company types once
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await axios.get("/api/company-types", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        const types: string[] = Array.isArray(res.data?.data) ? res.data.data : [];
        const opts = types.map((t) => ({ value: t, label: t }));
        setCompanyTypes([
          ...opts.filter((o) => o.value !== "Other"),
          { value: "Other", label: "Other" },
        ]);
      } catch (e) {
        // fallback defaults
        setCompanyTypes([
          { value: "Merchant Exporter", label: "Merchant Exporter" },
          { value: "Merchant cum Manufacturer Exporter", label: "Merchant cum Manufacturer Exporter" },
          { value: "Manufacturer Exporter", label: "Manufacturer Exporter" },
          { value: "Service Provider", label: "Service Provider" },
          { value: "Other", label: "Other" },
        ]);
      }
    };
    fetchTypes();
  }, []);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    
    mode: "onChange",
  });
  const user = localStorage.getItem("user");
  const User = JSON.parse(user || "{}");
  const token = localStorage.getItem("token");
    const typeOfCompany = form.watch("type_of_company");

  useEffect(() => {
    if (typeOfCompany !== "Other") {
      form.setValue("other_type_of_company", "");
    }
  }, [typeOfCompany, form]);

  // Handle delete company type
  const handleDeleteCompanyType = async (typeToDelete: string) => {
    if (window.confirm(`Are you sure you want to remove the company type "${typeToDelete}" from the dropdown? Companies using this type will have their type set to null.`)) {
      try {
        const response = await axios.delete('/api/company-types', {
          data: { type: typeToDelete },
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        
        // Remove the deleted type from the dropdown options
        setCompanyTypes(prev => prev.filter(option => option.value !== typeToDelete));
        
        // If the currently selected type was deleted, clear the selection
        if (form.getValues('type_of_company') === typeToDelete) {
          form.setValue('type_of_company', '');
        }
        
        const affectedCount = response.data?.data?.affected_companies || 0;
        toast.success(`Company type "${typeToDelete}" removed from dropdown. ${affectedCount} companies were affected.`);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to remove company type';
        toast.error(errorMessage);
      }
    }
  };

  // Setup mutation using custom POST hook
  const companyMutation = usePostData({
    endpoint: "/api/companies",
    params: {
      queryKey: ["companies"],
      onSuccess: () => {
        toast.success("Company Master Created Successfully");
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
    data.company_name = data.company_name;
    data.street_address = data.street_address;
    data.area = data.area;
    data.city = data.city;
    data.state = data.state;
    data.pincode = data.pincode;
    data.country = data.country;
    data.type_of_company = data.type_of_company;
    data.contact_person = data.contact_person;
    data.contact_person_designation = data.contact_person_designation;
    data.contact_email = data.contact_email;
    data.contact_mobile = data.contact_mobile;
    data.alternate_contact_person = data.alternate_contact_person;
    data.alternate_contact_person_designation = data.alternate_contact_person_designation;
    data.alternate_contact_email = data.alternate_contact_email;
    data.alternate_contact_mobile = data.alternate_contact_mobile;

    // Build multipart form data from all defined values
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    // Trigger the mutation – hook handles success/error feedback
    companyMutation.mutate(formData);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 pb-[2rem]"
      >
        <div className="max-w-full p-4 space-y-6">
          {/* Company Information Card */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Company Information</CardTitle>
                </div>
                 
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 space">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem >
                      <FormLabel className="">Company Name<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Company Name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  <FormField
                  control={form.control}
                  name="type_of_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Company<span className="text-red-500">*</span></FormLabel>
                      <ComboboxWithDelete
                        options={companyTypes}
                        value={field.value}
                        onValueChange={field.onChange}
                        onDelete={handleDeleteCompanyType}
                        placeholder="Select a type of company"
                        showDelete={true}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {typeOfCompany === "Other" && (
                  <FormField
                    control={form.control}
                    name="other_type_of_company"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Other Type of Company<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Please specify" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                </div>
              </CardContent>
          

           
              <CardHeader>
                <CardTitle>Company Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-3 ">
                 <FormField
                  control={form.control}
                  name="street_address"
                  render={({ field }) => (
                    <FormItem >
                      <FormLabel >Street Address<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Street Address..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Area..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "city"> }) => (
                    <FormItem className="">
                      <FormLabel>City</FormLabel>
                    <Input
                      placeholder="Enter City..."
                      {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "state"> }) => (
                    <FormItem className="">
                      <FormLabel>State<span className="text-red-500">*</span></FormLabel>
                    <Input
                      placeholder="Enter State..."
                      {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "pincode"> }) => (
                    <FormItem className="">
                      <FormLabel>Pincode<span className="text-red-500">*</span></FormLabel>
                    <Input
                      placeholder="Enter Pincode..."
                      {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "country"> }) => (
                    <FormItem className="">
                      <FormLabel>Country<span className="text-red-500">*</span></FormLabel>
                    <Input
                      placeholder="Enter Country..."
                      {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              </CardContent>
        

           
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-4 ">
                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "contact_person"> }) => (
                    <FormItem className="">
                      <FormLabel>Contact Person<span className="text-red-500">*</span></FormLabel>
                    <Input
                      placeholder="Enter Contact Person..."
                      {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_person_designation"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "contact_person_designation"> }) => (
                    <FormItem className="">
                      <FormLabel>Contact Person Designation<span className="text-red-500">*</span></FormLabel>
                    <Input
                      placeholder="Enter Contact Person Designation..."
                      {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "contact_email"> }) => (
                    <FormItem className="">
                      <FormLabel>Contact Email</FormLabel>
                    <Input
                      placeholder="Enter Contact Email..."
                      {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_mobile"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "contact_mobile"> }) => (
                    <FormItem className="">
                      <FormLabel>Contact Mobile<span className="text-red-500">*</span></FormLabel>
                    <Input
                      placeholder="Enter Contact Mobile..."
                      {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alternate_contact_person"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "alternate_contact_person"> }) => (
                    <FormItem className="">
                      <FormLabel>Alternate Contact Person</FormLabel>
                    <Input
                      placeholder="Enter Contact Person..."
                      {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alternate_contact_person_designation"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "alternate_contact_person_designation"> }) => (
                    <FormItem className="">
                      <FormLabel>Alternate Contact Person's Designation</FormLabel>
                    <Input
                      placeholder="Enter Contact Person..."
                      {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alternate_contact_email"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "alternate_contact_email"> }) => (
                    <FormItem className="">
                      <FormLabel>Alternate Contact Email</FormLabel>
                    <Input
                      placeholder="Enter Contact Email..."
                      {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alternate_contact_mobile"
                  render={({ field }: { field: ControllerRenderProps<ProfileFormValues, "alternate_contact_mobile"> }) => (
                    <FormItem className="">
                      <FormLabel>Alternate Contact Mobile</FormLabel>
                    <Input
                      placeholder="Enter Contact Mobile..."
                      {...field}
                      />
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
            onClick={() => window.history.back()}
            className="self-center"
            type="button"
          >
            Cancel
          </Button>
          <Button className="self-center mr-8" type="submit">
            Add Company
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function SettingsProfilePage() {
  return (
    <div>
      <div className="relative flex justify-center items-center p-4">
        <Button
          onClick={() => window.history.back()}
          className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2"
        >
          <MoveLeft className="w-5 text-white" />
          Back
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Company Master</h1>
          <h2 className="text-sm text-muted-foreground">Add Company Form</h2>
        </div>
      </div>
        <div className="space-y-3 ">
          <ProfileForm />
        </div>
     </div>
      
  );
}
