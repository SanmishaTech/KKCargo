import React from "react";
import Globalcomponent from "./Globalcomponent";
import Layout from "./Components/sidebar/layout";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "./Components/sidebar/app-sidebar";
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
    const { setError } = this.context;

    if (setError) {
      setError(error); // Set the error in context
    }
  }

  render() {
    if (this.state.hasError) {
      const role = localStorage.getItem("role");
      return (
        <div className="flex min-w-full">
          <SidebarProvider>
            <AppSidebar role={role} />
            <main className="pt-2 flex-1 overflow-auto">
              <SidebarTrigger />
              {/* {children} */}
              <Globalcomponent />
            </main>
          </SidebarProvider>
        </div>
      );
    }

    return this.props.children;
  }
}
