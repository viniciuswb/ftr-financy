import type { Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { resetDb, signUp } from "./helpers.js";

let app: Express;

beforeAll(async () => {
  app = await createApp();
});
beforeEach(resetDb);

it("answers a GraphQL request over HTTP with a Bearer token", async () => {
  const { token } = await signUp();
  const res = await request(app)
    .post("/graphql")
    .set("Authorization", `Bearer ${token}`)
    .send({ query: "{ me { id } }" });
  expect(res.status).toBe(200);
  expect(res.body.data.me.id).toEqual(expect.any(String));
});

it("allows the configured front-end origin (CORS preflight)", async () => {
  const res = await request(app)
    .options("/graphql")
    .set("Origin", "http://localhost:5173")
    .set("Access-Control-Request-Method", "POST");
  expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
});
