import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it } from "vitest";
import { errorCode, exec, resetDb, signUp } from "./helpers.js";

const REGISTER = `mutation($data: RegisterInput!) { register(data: $data) { token user { id name email } } }`;
const LOGIN = `mutation($data: LoginInput!) { login(data: $data) { token user { id email } } }`;
const ME = `{ me { id name email } }`;

beforeEach(resetDb);

describe("register", () => {
  it("registers a user and returns a token", async () => {
    const res = await exec(REGISTER, {
      data: { name: "Conta teste", email: "conta@teste.com", password: "12345678" },
    });
    expect(res.errors).toBeUndefined();
    expect(res.data.register.token).toEqual(expect.any(String));
    expect(res.data.register.user).toMatchObject({ name: "Conta teste", email: "conta@teste.com" });
  });

  it("normalizes email case and spaces on register and login", async () => {
    await exec(REGISTER, { data: { name: "A", email: " Conta@Teste.com ", password: "12345678" } });
    const res = await exec(LOGIN, { data: { email: "CONTA@teste.com", password: "12345678" } });
    expect(res.errors).toBeUndefined();
    expect(res.data.login.user.email).toBe("conta@teste.com");
  });

  it("rejects a duplicate email", async () => {
    await signUp({ email: "conta@teste.com" });
    const res = await exec(REGISTER, {
      data: { name: "Outro", email: "conta@teste.com", password: "12345678" },
    });
    expect(errorCode(res)).toBe("BAD_USER_INPUT");
  });

  it("rejects a password shorter than 8 characters", async () => {
    const res = await exec(REGISTER, {
      data: { name: "A", email: "conta@teste.com", password: "1234567" },
    });
    expect(errorCode(res)).toBe("BAD_USER_INPUT");
  });

  it("rejects an email without a valid format", async () => {
    const res = await exec(REGISTER, {
      data: { name: "A", email: "not-an-email", password: "12345678" },
    });
    expect(errorCode(res)).toBe("BAD_USER_INPUT");
  });

  it("rejects an empty name", async () => {
    const res = await exec(REGISTER, {
      data: { name: "   ", email: "conta@teste.com", password: "12345678" },
    });
    expect(errorCode(res)).toBe("BAD_USER_INPUT");
  });
});

describe("login", () => {
  it("logs in with the right password", async () => {
    await signUp({ email: "conta@teste.com" });
    const res = await exec(LOGIN, { data: { email: "conta@teste.com", password: "12345678" } });
    expect(res.data.login.token).toEqual(expect.any(String));
    expect(res.data.login.user.email).toBe("conta@teste.com");
  });

  it("gives the same error for wrong password and unknown email", async () => {
    await signUp({ email: "conta@teste.com" });
    const wrong = await exec(LOGIN, { data: { email: "conta@teste.com", password: "wrongpass" } });
    const unknown = await exec(LOGIN, { data: { email: "nobody@teste.com", password: "12345678" } });
    expect(errorCode(wrong)).toBe("BAD_USER_INPUT");
    expect(wrong.errors![0].message).toBe(unknown.errors![0].message);
  });
});

describe("me", () => {
  it("returns the current user", async () => {
    const { token } = await signUp({ email: "conta@teste.com" });
    const res = await exec(ME, {}, token);
    expect(res.data.me.email).toBe("conta@teste.com");
  });

  it("rejects a request without a token", async () => {
    expect(errorCode(await exec(ME))).toBe("UNAUTHENTICATED");
  });

  it("rejects a malformed token", async () => {
    expect(errorCode(await exec(ME, {}, "abc"))).toBe("UNAUTHENTICATED");
  });

  it("rejects an expired token", async () => {
    const { userId } = await signUp();
    const expired = jwt.sign({ sub: userId }, "test-secret", { expiresIn: -10 });
    expect(errorCode(await exec(ME, {}, expired))).toBe("UNAUTHENTICATED");
  });
});
