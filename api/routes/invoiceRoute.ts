import { Hono } from "hono";
import { Bindings, Variables } from "../types";
import { eq } from "drizzle-orm";
import { invoices, lineItems, NewLineItem } from "../db/schema";

const invoiceRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const MAX_TOTAL_AMOUNT = 1000;

invoiceRoute.get("/", async c => {
  //  const db = c.var.db;
  const db = c.get("db");

  const invoiceItems = await db.query.invoices.findMany({
    with: {
      lineItems: true
    }
  });
  return c.json(invoiceItems);
});

invoiceRoute.get("/:id", async c => {
  //  const db = c.var.db;
  const db = c.get("db");

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, parseInt(c.req.param("id"))),
    with: {
      lineItems: true
    }
  });
  return c.json(invoice);
});

invoiceRoute.post("/", async c => {
  try {
    //const db = c.var.db;
    const db = c.get("db");

    const data = await c.req.json(); // get JSON body from request

    if (
      typeof data.customerDetails !== "string" ||
      data.customerDetails.trim() === "" ||
      !data.date ||
      isNaN(new Date(data.date).getTime()) ||
      typeof data.totalAmount !== "number" ||
      data.totalAmount <= 0 ||
      data.totalAmount > MAX_TOTAL_AMOUNT ||
      !Array.isArray(data.lineItems) ||
      data.lineItems.length === 0
    ) {
      if (data.totalAmount > MAX_TOTAL_AMOUNT) {
        return c.json(
          { error: `Total amount cannot exceed $${MAX_TOTAL_AMOUNT}` },
          400
        );
      } else
        return c.json({ error: "Invalid or missing required fields" }, 400);
    }

    // validate line items
    for (const item of data.lineItems) {
      if (
        (item.description && typeof item.description !== "string") ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0 ||
        typeof item.amount !== "number" ||
        item.amount <= 0
      ) {
        return c.json({ error: "Invalid line item data" }, 400);
      }
    }

    // insert invoice
    const insertedInvoice = await db
      .insert(invoices)
      .values({
        customerDetails: data.customerDetails.trim(),
        date: new Date(data.date),
        totalAmount: data.totalAmount
      })
      .returning();

    const invoiceId = insertedInvoice[0].id;

    const lineItemsData = data.lineItems.map((item: NewLineItem) => ({
      invoiceId,
      description: item.description || null,
      quantity: item.quantity,
      amount: item.amount
    }));

    await db.insert(lineItems).values(lineItemsData);

    const createdInvoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
      with: { lineItems: true }
    });

    return c.json(createdInvoice, 201);
  } catch (error) {
    console.error("POST /invoice error:", error);
    return c.json({ error: "Failed to create invoice" }, 500);
  }
});

invoiceRoute.put("/:id", async c => {
  try {
    //const db = c.var.db;
    const db = c.get("db");

    const invoiceIdParam = c.req.param("id");

    // id validation
    const invoiceId = Number(invoiceIdParam);
    if (isNaN(invoiceId) || invoiceId <= 0) {
      return c.json({ error: "Invalid invoice ID" }, 400);
    }

    const data = await c.req.json();

    // fields validation
    if (
      typeof data.customerDetails !== "string" ||
      data.customerDetails.trim() === "" ||
      !data.date ||
      isNaN(new Date(data.date).getTime()) ||
      typeof data.totalAmount !== "number" ||
      data.totalAmount <= 0 ||
      !Array.isArray(data.lineItems) ||
      data.lineItems.length === 0
    ) {
      return c.json({ error: "Invalid or missing required fields" }, 400);
    }

    // lineItems validation
    for (const item of data.lineItems) {
      if (
        (item.description && typeof item.description !== "string") ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0 ||
        typeof item.amount !== "number" ||
        item.amount <= 0
      ) {
        return c.json({ error: "Invalid line item data" }, 400);
      }
    }

    const existingInvoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId)
    });
    if (!existingInvoice) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    //update the invoice
    await db
      .update(invoices)
      .set({
        customerDetails: data.customerDetails.trim(),
        date: new Date(data.date),
        totalAmount: data.totalAmount
      })
      .where(eq(invoices.id, invoiceId));

    //delete existing lines
    await db.delete(lineItems).where(eq(lineItems.invoiceId, invoiceId));

    // insert new lines
    const lineItemsData = data.lineItems.map((item: NewLineItem) => ({
      invoiceId,
      description: item.description || null,
      quantity: item.quantity,
      amount: item.amount
    }));

    await db.insert(lineItems).values(lineItemsData);

    // return updated invoice
    const updatedInvoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
      with: { lineItems: true }
    });

    return c.json(updatedInvoice);
  } catch (error) {
    console.error("PUT /invoice/:id error:", error);
    return c.json({ error: "Failed to update invoice" }, 500);
  }
});

invoiceRoute.delete("/:id", async c => {
  try {
    //const db = c.var.db;
    const db = c.get("db");

    const invoiceId = c.req.param("id");

    // delete line items associated with the invoice
    await db
      .delete(lineItems)
      .where(eq(lineItems.invoiceId, Number(invoiceId)));

    // delete the invoice itself
    const deleteResult = await db
      .delete(invoices)
      .where(eq(invoices.id, Number(invoiceId)));

    if (deleteResult.rowCount === 0) {
      return c.json({ error: "Invoice not found" }, 404);
    }

    return c.json({ message: "Invoice deleted successfully" }, 200);
  } catch (error) {
    console.error("DELETE /invoice/:id error:", error);
    return c.json({ error: "Failed to delete invoice" }, 500);
  }
});

export default invoiceRoute;
