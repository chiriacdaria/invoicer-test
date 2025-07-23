import { Hono } from "hono";
import { Bindings, Variables } from "./types";
import { dbMiddleware } from "./middleware/db.middleware";
import invoiceRoute from "./routes/invoiceRoute";

export const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>().basePath("/api");

app.use(dbMiddleware);
app.route("/invoice", invoiceRoute);
