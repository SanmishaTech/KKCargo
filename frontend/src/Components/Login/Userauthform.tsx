import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/custominput";
import { zodResolver } from "@hookform/resolvers/zod";
// import { signIn } from "next-auth/react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useFetchData } from "@/fetchcomponents/Fetchapi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { usePostData } from "@/fetchcomponents/postapi";

gsap.registerPlugin(useGSAP);

import * as z from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, isError } = useFetchData({
    endpoint: "https://66d59c0ff5859a704266c935.mockapi.io/api/todo/todo",
    params: {
      queryKey: "todos",
      retry: 5,
      refetchOnWindowFocus: true,
      onSuccess: () => {
        toast.success("Successfully Fetched Data");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    },
  });

  const postData = usePostData({
    endpoint: "http://localhost:8000/api/login",
    params: {
      retry: 2,
      onSuccess: () => {
        toast.success("Successfully Submitted Data");
      },
      onError: (error: AxiosError) => {
        toast.error(error.message);
      },
    },
  });

  useEffect(() => {
    console.log(data);
  }, [data]);

  const container = useRef<SVGSVGElement | null>(null);
  const { callbackUrl } = useParams();
  //   const callbackUrl = searchParams.get("callbackUrl");
  // const [loading, setLoading] = useState(false);
  const defaultValues = {
    email: "demo@gmail.com",
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: UserFormValue) => {
    console.log("Done");
    queryClient.invalidateQueries({ queryKey: ["todos"] });
    const dataa = {
      email: "admin@gmail.com",
      password: "abcd123",
    };
    postData.mutate(dataa);
    // signIn("credentials", {
    //   email: data.email,
    //   callbackUrl: callbackUrl ?? "/dashboard",
    // });
  };
  useGSAP(() => {
    gsap.to(
      container.current!,
      // { rotate: 0 },
      {
        rotate: 360,
        repeat: -1,
        delay: 0,
        repeatDelay: 0,
        duration: 0.3,
      }
    );
  }, [isLoading]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2 "
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="">
                <Label>Email</Label>
                <FormControl>
                  <div className="min-h-10 mb-[8rem]">
                    <Input
                      isLoading={isLoading}
                      type="email"
                      placeholder="Enter your email..."
                      disabled={isLoading}
                      className="min-h-8"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="">
                    <Input
                      isLoading={isLoading}
                      type="email"
                      placeholder="Enter your email..."
                      disabled={isLoading}
                      className=""
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={isLoading}
            isLoading={isLoading}
            className="ml-auto w-full flex gap-2"
            type="submit"
            // variant="primaryAccent"
            variant="outline"
          >
            PPP
            {/* {isLoading && (
              <svg
                ref={container}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-loader-circle rotate-0"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )} */}
            <span>Continue With Email</span>
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        {/* <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div> */}
      </div>
      {/* <GithubSignInButton /> */}
    </>
  );
}
