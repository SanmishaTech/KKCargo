import { createFileRoute } from "@tanstack/react-router";
import Login from "../Components/Login/Login";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Login />
    </>
  );
}
