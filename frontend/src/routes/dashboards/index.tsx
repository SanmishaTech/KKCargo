import { createFileRoute } from "@tanstack/react-router";
import Login from "../../Components/Dashboard/AllDashboard";

export const Route = createFileRoute("/dashboards/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Login />;
}
