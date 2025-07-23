import { app } from "./app";
import { Bindings } from "./types";

export default {
  fetch: (request: Request, env: Bindings) => {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/")) {
      return app.fetch(request, env);
    }

    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      return env.ASSETS.fetch(request);
    }

    return new Response("Static assets not available in local dev", {
      status: 404
    });
  }
};
