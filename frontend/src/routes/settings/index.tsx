import { createFileRoute } from "@tanstack/react-router";
import TwoFactorSetup from "../../Components/TwoFactorSetup";

export const Route = createFileRoute("/settings/")(
  {
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security and preferences
        </p>
      </div>
      
      <TwoFactorSetup />
    </div>
  );
}
