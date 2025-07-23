import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import invoiceRoute from "../routes/invoiceRoute";
import { invoices, lineItems } from "../db/schema"; // adjust import if needed

describe("invoiceRoute", () => {
  let app: Hono;
  const mockDb = {
    query: {
      invoices: {
        findMany: vi.fn(),
        findFirst: vi.fn()
      }
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  };

  beforeEach(() => {
    vi.resetAllMocks();

    app = new Hono();

    // Inject mock db into context
    app.use("/invoices/*", async (c, next) => {
      c.set("db", mockDb);
      await next();
    });

    app.route("/invoices", invoiceRoute);
  });

  // GET tests
  it("GET /invoices should return invoices", async () => {
    mockDb.query.invoices.findMany.mockResolvedValue([
      { id: 1, customerDetails: "Alice", lineItems: [] }
    ]);

    const res = await app.request("/invoices");
    const body = (await res.json()) as any[];

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].customerDetails).toBe("Alice");
  });

  it("GET /invoices/1 should return invoice with id 1", async () => {
    mockDb.query.invoices.findFirst.mockResolvedValue({
      id: 1,
      customerDetails: "Bob",
      lineItems: []
    });

    const res = await app.request("/invoices/1");
    const body = (await res.json()) as any;

    expect(res.status).toBe(200);
    expect(body.id).toBe(1);
    expect(body.customerDetails).toBe("Bob");
  });

  // POST tests
  it("POST /invoices should create a new invoice with valid data", async () => {
    mockDb.insert.mockImplementation(table => ({
      values: (data: any) => ({
        returning: async () => {
          if (table === invoices) {
            return [{ id: 10, ...data }];
          }
          if (table === lineItems) {
            return data;
          }
          return [];
        }
      })
    }));

    mockDb.query.invoices.findFirst.mockResolvedValue({
      id: 10,
      customerDetails: "Charlie",
      date: new Date().toISOString(),
      totalAmount: 300,
      lineItems: [
        {
          invoiceId: 10,
          description: "Test item",
          quantity: 3,
          amount: 100
        }
      ]
    });

    const newInvoice = {
      customerDetails: "Charlie",
      date: new Date().toISOString(),
      totalAmount: 300,
      lineItems: [{ description: "Test item", quantity: 3, amount: 100 }]
    };

    const res = await app.request("/invoices", {
      method: "POST",
      body: JSON.stringify(newInvoice),
      headers: { "Content-Type": "application/json" }
    });

    const body = (await res.json()) as any;

    expect(res.status).toBe(201);
    expect(body.customerDetails).toBe("Charlie");
    expect(body.lineItems).toHaveLength(1);
    expect(mockDb.insert).toHaveBeenCalledTimes(2);
  });

  it("POST /invoices should reject with 400 if required fields are missing", async () => {
    const invalidInvoice = {
      date: new Date().toISOString(),
      totalAmount: 100
    };

    const res = await app.request("/invoices", {
      method: "POST",
      body: JSON.stringify(invalidInvoice),
      headers: { "Content-Type": "application/json" }
    });

    const body = (await res.json()) as any;

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid or missing required fields");
  });

  it("POST /invoices should reject with 400 if totalAmount exceeds MAX_TOTAL_AMOUNT", async () => {
    const overLimitInvoice = {
      customerDetails: "Daisy",
      date: new Date().toISOString(),
      totalAmount: 1000000,
      lineItems: [{ description: "Expensive", quantity: 1, amount: 1000000 }]
    };

    const res = await app.request("/invoices", {
      method: "POST",
      body: JSON.stringify(overLimitInvoice),
      headers: { "Content-Type": "application/json" }
    });

    const body = (await res.json()) as any;

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Total amount cannot exceed/);
  });
});
