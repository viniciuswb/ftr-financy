import { beforeEach, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { errorCode, exec, resetDb, signUp } from "./helpers.js";

const CREATE_CATEGORY = `mutation($data: CreateCategoryInput!) { createCategory(data: $data) { id } }`;
const CREATE = `mutation($data: CreateTransactionInput!) { createTransaction(data: $data) { id type description date amount category { id title } } }`;
const UPDATE = `mutation($id: ID!, $data: UpdateTransactionInput!) { updateTransaction(id: $id, data: $data) { id type description date amount category { id } } }`;
const DELETE = `mutation($id: ID!) { deleteTransaction(id: $id) }`;
const LIST = `{ transactions { id description date } }`;

const tx = (categoryId: string) => ({
  type: "EXPENSE",
  description: "Jantar no Restaurante",
  date: "2025-11-30",
  amount: 8950,
  categoryId,
});

async function createCategory(token: string, title = "Alimentação"): Promise<string> {
  const res = await exec(CREATE_CATEGORY, { data: { title, icon: "utensils", color: "blue" } }, token);
  if (res.errors) throw new Error(res.errors[0].message);
  return res.data.createCategory.id;
}

async function setup() {
  const user = await signUp();
  return { ...user, categoryId: await createCategory(user.token) };
}

async function createTransaction(token: string, data: Record<string, unknown>): Promise<string> {
  const res = await exec(CREATE, { data }, token);
  if (res.errors) throw new Error(res.errors[0].message);
  return res.data.createTransaction.id;
}

beforeEach(resetDb);

it("creates a transaction and returns its category", async () => {
  const { token, categoryId } = await setup();
  const res = await exec(CREATE, { data: tx(categoryId) }, token);
  expect(res.errors).toBeUndefined();
  expect(res.data.createTransaction).toMatchObject({
    type: "EXPENSE",
    description: "Jantar no Restaurante",
    date: "2025-11-30",
    amount: 8950,
    category: { id: categoryId, title: "Alimentação" },
  });
});

it("keeps the date exactly as sent", async () => {
  const { token, categoryId } = await setup();
  const created = await exec(CREATE, { data: tx(categoryId) }, token);
  expect(created.data.createTransaction.date).toBe("2025-11-30");
  const listed = await exec(LIST, {}, token);
  expect(listed.data.transactions[0].date).toBe("2025-11-30");
});

it("rejects malformed dates", async () => {
  const { token, categoryId } = await setup();
  for (const date of ["30/11/25", "2025-13-45", "2025-02-30"]) {
    expect(errorCode(await exec(CREATE, { data: { ...tx(categoryId), date } }, token))).toBe("BAD_USER_INPUT");
  }
});

it("rejects zero and negative amounts", async () => {
  const { token, categoryId } = await setup();
  for (const amount of [0, -100]) {
    expect(errorCode(await exec(CREATE, { data: { ...tx(categoryId), amount } }, token))).toBe("BAD_USER_INPUT");
  }
});

it("rejects a blank description", async () => {
  const { token, categoryId } = await setup();
  const res = await exec(CREATE, { data: { ...tx(categoryId), description: "  " } }, token);
  expect(errorCode(res)).toBe("BAD_USER_INPUT");
});

it("rejects another user's category on create", async () => {
  const a = await setup();
  const b = await signUp();
  expect(errorCode(await exec(CREATE, { data: tx(a.categoryId) }, b.token))).toBe("NOT_FOUND");
});

it("lists only the user's own transactions, newest date first", async () => {
  const a = await setup();
  const b = await setup();
  await createTransaction(a.token, { ...tx(a.categoryId), description: "Older", date: "2025-11-26" });
  await createTransaction(a.token, { ...tx(a.categoryId), description: "Newer", date: "2025-11-30" });
  await createTransaction(b.token, { ...tx(b.categoryId), description: "Other user" });
  const res = await exec(LIST, {}, a.token);
  expect(res.data.transactions.map((t: { description: string }) => t.description)).toEqual(["Newer", "Older"]);
});

it("updates only the fields sent", async () => {
  const { token, categoryId } = await setup();
  const id = await createTransaction(token, tx(categoryId));
  const res = await exec(UPDATE, { id, data: { amount: 10000 } }, token);
  expect(res.data.updateTransaction).toMatchObject({
    description: "Jantar no Restaurante",
    date: "2025-11-30",
    amount: 10000,
  });
});

it("cannot move a transaction into another user's category", async () => {
  const a = await setup();
  const b = await setup();
  const id = await createTransaction(a.token, tx(a.categoryId));
  const res = await exec(UPDATE, { id, data: { categoryId: b.categoryId } }, a.token);
  expect(errorCode(res)).toBe("NOT_FOUND");
  expect((await prisma.transaction.findUnique({ where: { id } }))?.categoryId).toBe(a.categoryId);
});

it("cannot update or delete another user's transaction", async () => {
  const a = await setup();
  const b = await signUp();
  const id = await createTransaction(a.token, tx(a.categoryId));
  expect(errorCode(await exec(UPDATE, { id, data: { amount: 1 } }, b.token))).toBe("NOT_FOUND");
  expect(errorCode(await exec(DELETE, { id }, b.token))).toBe("NOT_FOUND");
  expect((await prisma.transaction.findUnique({ where: { id } }))?.amount).toBe(8950);
});

it("deletes a transaction", async () => {
  const { token, categoryId } = await setup();
  const id = await createTransaction(token, tx(categoryId));
  expect((await exec(DELETE, { id }, token)).data.deleteTransaction).toBe(true);
  expect((await exec(LIST, {}, token)).data.transactions).toEqual([]);
});

it("reports count and unsigned total per category", async () => {
  const { token, categoryId } = await setup();
  await createTransaction(token, { ...tx(categoryId), amount: 8950 });
  await createTransaction(token, { ...tx(categoryId), type: "INCOME", amount: 1050 });
  const res = await exec(`{ categories { transactionCount totalAmount } }`, {}, token);
  expect(res.data.categories[0]).toEqual({ transactionCount: 2, totalAmount: 10000 });
});

it("reports zero for an empty category", async () => {
  const { token } = await setup();
  const res = await exec(`{ categories { transactionCount totalAmount } }`, {}, token);
  expect(res.data.categories[0]).toEqual({ transactionCount: 0, totalAmount: 0 });
});

it("requires auth", async () => {
  expect(errorCode(await exec(LIST))).toBe("UNAUTHENTICATED");
});
