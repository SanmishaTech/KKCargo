//ts-nocheck
import { createFileRoute, redirect } from "@tanstack/react-router";
import Members from "../../Components/company/Follow-up";
import { toast } from "sonner";

export const Route = createFileRoute("/follow-up/")({
  beforeLoad: async () => {
    const role = localStorage.getItem("role");
    const allowed = ["admin", "staff"];
    if (!role || !allowed.includes(role)) {
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
  const searchParams = Route.useSearch() as any;
  const companyId = searchParams?.company_id ? Number(searchParams.company_id) : undefined;
  return <Members companyId={companyId} />;
}
