import { Context } from "hono";

type MockDb = {
  query: {
    invoices: {
      findMany: () => any;
      findFirst: () => any;
    };
  };
  insert: () => any;
  update: () => any;
  delete: () => any;
};

// Extend Hono's `ContextVariableMap` to include your custom keys
declare module "hono" {
  interface ContextVariableMap {
    db: MockDb;
  }
}
