import { createFileRoute } from "@tanstack/react-router";
import { AdminControlCenter } from "./admin";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminControlCenter,
});
