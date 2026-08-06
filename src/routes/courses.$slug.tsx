import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/courses/$slug")({
  component: () => <Outlet />,
});
