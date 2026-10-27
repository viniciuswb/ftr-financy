import { beforeEach, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { errorCode, exec, resetDb, signUp } from "./helpers.js";

const CREATE = `mutation($data: CreateCategoryInput!) { createCategory(data: $data) { id title description icon color } }`;
const UPDATE = `mutation($id: ID!, $data: UpdateCategoryInput!) { updateCategory(id: $id, data: $data) { id title description icon color } }`;
const DELETE = `mutation($id: ID!) { deleteCategory(id: $id) }`;
const LIST = `{ categories { id title } }`;
const valid = {
  title: "Alimentação",
  description: "Restaurantes, delivery e refeições",
  icon: "utensils",
  color: "blue",
};

async function createCategory(token: string, data: Record<string, unknown> = valid): Promise<string> {
  const res = await exec(CREATE, { data }, token);
  if (res.errors) throw new Error(res.errors[0].message);
  return res.data.createCategory.id;
}

beforeEach(resetDb);

it("creates a category", async () => {
  const { token } = await signUp();
  const res = await exec(CREATE, { data: valid }, token);
  expect(res.errors).toBeUndefined();
  expect(res.data.createCategory).toMatchObject(valid);
});

it("stores an empty description as null", async () => {
  const { token } = await signUp();
  const res = await exec(CREATE, { data: { ...valid, description: "  " } }, token);
  expect(res.data.createCategory.description).toBeNull();
});

it("rejects a blank title", async () => {
  const { token } = await signUp();
  expect(errorCode(await exec(CREATE, { data: { ...valid, title: "  " } }, token))).toBe("BAD_USER_INPUT");
});

it("rejects an unknown icon", async () => {
  const { token } = await signUp();
  expect(errorCode(await exec(CREATE, { data: { ...valid, icon: "rocket" } }, token))).toBe("BAD_USER_INPUT");
});

it("rejects an unknown color", async () => {
  const { token } = await signUp();
  expect(errorCode(await exec(CREATE, { data: { ...valid, color: "black" } }, token))).toBe("BAD_USER_INPUT");
});

it("lists only the user's own categories, ordered by title", async () => {
  const a = await signUp();
  const b = await signUp();
  await createCategory(a.token, { ...valid, title: "Transporte" });
  await createCategory(a.token, { ...valid, title: "Mercado" });
  await createCategory(b.token, { ...valid, title: "Saúde" });
  const res = await exec(LIST, {}, a.token);
  expect(res.data.categories.map((c: { title: string }) => c.title)).toEqual(["Mercado", "Transporte"]);
});

it("updates only the fields sent", async () => {
  const { token } = await signUp();
  const id = await createCategory(token);
  const res = await exec(UPDATE, { id, data: { color: "red" } }, token);
  expect(res.data.updateCategory).toMatchObject({ ...valid, color: "red" });
});

it("cannot update another user's category", async () => {
  const a = await signUp();
  const b = await signUp();
  const id = await createCategory(a.token);
  const res = await exec(UPDATE, { id, data: { title: "Hacked" } }, b.token);
  expect(errorCode(res)).toBe("NOT_FOUND");
  expect((await prisma.category.findUnique({ where: { id } }))?.title).toBe(valid.title);
});

it("deletes a category and its transactions", async () => {
  const { token, userId } = await signUp();
  const id = await createCategory(token);
  await prisma.transaction.create({
    data: {
      userId,
      categoryId: id,
      type: "EXPENSE",
      description: "Jantar",
      amount: 8950,
      date: new Date("2025-11-30T00:00:00Z"),
    },
  });
  const res = await exec(DELETE, { id }, token);
  expect(res.data.deleteCategory).toBe(true);
  expect(await prisma.transaction.count({ where: { categoryId: id } })).toBe(0);
});

it("cannot delete another user's category", async () => {
  const a = await signUp();
  const b = await signUp();
  const id = await createCategory(a.token);
  expect(errorCode(await exec(DELETE, { id }, b.token))).toBe("NOT_FOUND");
  expect(await prisma.category.findUnique({ where: { id } })).not.toBeNull();
});

it("requires auth", async () => {
  expect(errorCode(await exec(LIST))).toBe("UNAUTHENTICATED");
});
