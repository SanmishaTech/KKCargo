import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/company/Edittestcard";
export const Route = createFileRoute("/company/edit/$id")({
  component: Edititem,
});
