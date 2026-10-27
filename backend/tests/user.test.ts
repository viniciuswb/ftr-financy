import { beforeEach, expect, it } from "vitest";
import { errorCode, exec, resetDb, signUp } from "./helpers.js";

const UPDATE_ME = `mutation($data: UpdateMeInput!) { updateMe(data: $data) { name } }`;

beforeEach(resetDb);

it("updates the user's name", async () => {
  const { token } = await signUp({ name: "Old" });
  const res = await exec(UPDATE_ME, { data: { name: "  Novo Nome " } }, token);
  expect(res.data.updateMe.name).toBe("Novo Nome");
});

it("rejects a blank name", async () => {
  const { token } = await signUp();
  expect(errorCode(await exec(UPDATE_ME, { data: { name: "   " } }, token))).toBe("BAD_USER_INPUT");
});

it("requires auth", async () => {
  expect(errorCode(await exec(UPDATE_ME, { data: { name: "Nome" } }))).toBe("UNAUTHENTICATED");
});
