import React, { useEffect, useState } from "react";
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
  const [requires2FA, setRequires2FA] = useState(false);
  const [storedEmail, setStoredEmail] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [sendingEmailOTP, setSendingEmailOTP] = useState(false);
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [emailOTPCountdown, setEmailOTPCountdown] = useState(0);
  const loginCredentials = React.useRef({ email: "", password: "" });
  
  // Reset form when switching between login and 2FA modes
  useEffect(() => {
    setFormKey(prev => prev + 1);
  }, [requires2FA]);
  
  // Countdown timer for email OTP
  useEffect(() => {
    if (emailOTPCountdown > 0) {
      const timer = setTimeout(() => {
        setEmailOTPCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailOTPCountdown]);
  
  // useEffect(() => {
  //   if (user && User?.email) {
  //     navigate({
  //       to: "/dashboard",
  //     });
  //   }
  // }, [user]);

  const navigate = useNavigate();
  
  // Function to send OTP to email
  const sendOTPToEmail = async () => {
    const email = loginCredentials.current.email || storedEmail;
    
    if (!email) {
      toast.error("Email not found. Please login again.");
      setRequires2FA(false);
      return;
    }
    
    setSendingEmailOTP(true);
    
    try {
      const response = await axios.post("/api/otp/send-email", { email });
      
      if (response.data.status) {
        setEmailOTPSent(true);
        setEmailOTPCountdown(60); // 60 seconds cooldown
        toast.success(`OTP sent to ${response.data.data?.email_masked || 'your email'}`);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to send OTP to email";
      toast.error(errorMessage);
    } finally {
      setSendingEmailOTP(false);
    }
  };
  
  // Build defaultValues based on 2FA requirement to match schema
  const defaultValues = requires2FA ? {
    otp: "",
  } : {
    email: "",
    password: "",
  };
  const onSubmit = async (data: Record<string, any> | undefined) => {
    try {
      
      if (!data) {
        toast.error('Form data is missing');
        return;
      }
      
      let loginData: any;
      
      if (requires2FA) {
        // We're submitting OTP, include stored credentials
        // Try ref first, fall back to state
        const email = loginCredentials.current.email || storedEmail;
        const password = loginCredentials.current.password || storedPassword;
        
        // Get OTP value
        
        // Check all possible variations of the field name
        const otpValue = data.otp || data.Otp || data.OTP || data['otp'] || '';
        
        // Ensure OTP is exactly 6 characters
        if (!otpValue || otpValue.length !== 6) {
          toast.error('Please enter a valid 6-digit OTP code');
          return;
        }
        
        // Ensure OTP is a string and remove any spaces
        const finalOtp = String(otpValue).trim();
        
        loginData = { 
          email: email, 
          password: password, 
          otp: finalOtp.toString().trim() 
        };
      } else {
        // First login attempt, store credentials immediately in both ref and state
        loginCredentials.current = {
          email: data.email,
          password: data.password
        };
        setStoredEmail(data.email);
        setStoredPassword(data.password);
        
        loginData = {
          email: data.email,
          password: data.password
        };
      }
      
      const response = await axios.post("/api/login", loginData);
      const responseData = response.data;
      
      // Check if 2FA is required
      if (responseData.requires_2fa) {
        // If we're already in 2FA mode, this means the OTP was wrong or missing
        if (requires2FA) {
          toast.error('Invalid OTP code. Please check and try again.');
          return;
        }
        
        // First time 2FA request - credentials are already stored in ref from earlier
        if (!loginCredentials.current.email || !loginCredentials.current.password) {
          toast.error('Session error. Please login again.');
          return;
        }
        
        setRequires2FA(true);
        
        toast.info("Please enter your 2FA code");
        return;
      }
      
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
      
      // Set flag to show today's follow-up popup
      sessionStorage.setItem("showFollowupPopup", "true");
      
      navigate({ to: "/company" });
      toast.success("Successfully Logged In");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to log in. Check your credentials.";
      toast.error(errorMessage);
      // Reset 2FA state on error
      if (requires2FA && err.response?.status === 400) {
        setRequires2FA(false);
        loginCredentials.current = { email: "", password: "" };
      }
    }
  };

  // Build schema based on 2FA requirement
  const typeofschema = requires2FA ? {
    otp: {
      name: "OTP",
      type: "string",
      required: true,
      message: "Please enter exactly 6 digits",
      placeholder: "Enter 6-digit code",
      className:
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      validation: {
        required: true,
        message: "Please enter exactly 6 digits",
        type: "string",
      },
      componentType: "Input",
      componentProps: {
        type: "text",
        placeholder: "123456",
        maxLength: 6,
        minLength: 6,
        pattern: "[0-9]{6}",
        inputMode: "numeric",
        autoComplete: "one-time-code",
        className:
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      },
    },
  } : {
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
              {requires2FA ? "Two-Factor Authentication" : "Login to your account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {requires2FA 
                ? "Enter the 6-digit code from your authenticator app" 
                : "Enter your email and password to login"}
            </p>
            {requires2FA && (
              <p className="text-xs text-muted-foreground">
                Logging in as: {storedEmail || loginCredentials.current.email || "(no email stored)"}
              </p>
            )}
          </div>
          <div key={`form-${formKey}-${requires2FA ? "otp" : "login"}`}>
            <UseFormHook
              schema={typeofschema}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
            />
          </div>
          {requires2FA && (
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={sendOTPToEmail}
                  disabled={sendingEmailOTP || emailOTPCountdown > 0}
                  className="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmailOTP ? (
                    "Sending..."
                  ) : emailOTPCountdown > 0 ? (
                    `Resend OTP in ${emailOTPCountdown}s`
                  ) : (
                    "Lost your phone? Send OTP to email"
                  )}
                </button>
                {emailOTPSent && (
                  <p className="text-xs text-green-600">
                    ✓ OTP sent to your registered email
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setRequires2FA(false);
                  loginCredentials.current = { email: "", password: "" };
                  setStoredEmail("");
                  setStoredPassword("");
                  setEmailOTPSent(false);
                  setEmailOTPCountdown(0);
                }}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
              >
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
