//ts-nocheck
import { createFileRoute, redirect } from "@tanstack/react-router";
import Members from "../../Components/company/Registertable";
import { toast } from "sonner";

export const Route = createFileRoute("/company/")({
  beforeLoad: async ({ fetch }) => {
    const role = localStorage.getItem("role");
     if (role !== "admin" && role !== "staff" ) {
      toast.error("You are not authorized to access this page.");
      throw redirect({
        to: "/",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Members />;
}
