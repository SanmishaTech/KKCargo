import { createFileRoute, redirect } from "@tanstack/react-router";
import Roles from "../../Components/Roles";
import { toast } from "sonner";

export const Route = createFileRoute("/roles/")(
  {
    beforeLoad: async ({ context }) => {
      const role = localStorage.getItem("role");
      if (role !== "admin") {
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
  }
);

function RouteComponent() {
  return <Roles />;
}