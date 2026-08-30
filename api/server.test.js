import test from "node:test";
import assert from "node:assert/strict";

test("runtime exposes fetch", () => {
  assert.equal(typeof fetch, "function");
});

