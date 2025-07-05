import { createFileRoute } from "@tanstack/react-router";
import Edititem from "../../../Components/staff/Edittestcard";
export const Route = createFileRoute("/staff/edit/$id")({
  component: Edititem,
});
