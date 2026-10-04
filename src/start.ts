import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachPrismaAuth } from "./lib/auth-middleware.server";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    const detail = error instanceof Error ? error.stack || error.message : String(error);
    return new Response(renderErrorPage(process.env.NODE_ENV !== "production" ? detail : undefined), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachPrismaAuth],
  requestMiddleware: [errorMiddleware],
}));
