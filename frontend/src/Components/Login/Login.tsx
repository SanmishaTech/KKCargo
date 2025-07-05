import React, { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { UseFormHook } from "@/components/ui/HookFormcomp";
import background from "../../images/cargo.webp";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "@tanstack/react-router";

const Login = () => {
  const user = localStorage.getItem("user");
  const User = user ? JSON.parse(user) : null;
  // useEffect(() => {
  //   if (user && User?.email) {
  //     navigate({
  //       to: "/dashboard",
  //     });
  //   }
  // }, [user]);

  const navigate = useNavigate();
  const defaultValues = {
    email: "",
    password: "",
  };
  const onSubmit = async (data: Record<string, any>) => {
    try {
      const response = await axios.post("/api/login", data);
      const responseData = response.data;
      
      // Store the User data directly
      const userData = responseData.data.User;
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Also store token separately for easier access
      if (responseData.data.token) {
        localStorage.setItem("token", responseData.data.token);
      }
      
      // Store staff_id separately
      if (userData.staff_id) {
        localStorage.setItem("staff_id", userData.staff_id.toString());
      }
      
      // Get user role for navigation
      const role = userData.role;
      localStorage.setItem("role", role);
        navigate({ to: "/dashboards" });
      toast.success("Successfully Logged In");
    } catch (err) {
      console.error("Error logging in:", err);
      toast.error("Failed to log in. Check your credentials.");
    }
  };

  const typeofschema = {
    email: {
      name: "Email",
      type: "email",
      required: true,
      message: "Please enter your email",
      placeholder: "Enter your email...",
      className:
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      validation: {
        required: true,
        message: "Please enter your email",
        type: "email",
      },
      componentType: "Input",
      componentProps: {
        type: "email",
        placeholder: "Enter your email...",
        className:
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      },
    },
    password: {
      type: "string",
      required: true,
      message: "Please enter your password",
      className:
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      componentProps: {
        type: "password",
        placeholder: "Enter your password...",
        className:
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      },
      validation: {
        required: true,
        message: "Please enter your password",
        type: "password",
      },
    },
  };

  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        to="/examples/authentication"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 hidden md:right-8 md:top-8"
        )}
      >
        Login
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex  ">
        <div
          style={{
            backgroundImage: `url(${background})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
          className="absolute inset-0 "
        />
        <div className="relative z-20 flex items-center text-lg font-medium text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6 text-white"
          >
            <path
              className="text-white"
              d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"
            />
          </svg>
          Logo
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg text-white font-bold">Welcome To KK's APP</p>
            <footer className="text-sm text-white">
              KK's APP
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8 drop-shadow-md">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <UseFormHook
            schema={typeofschema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
