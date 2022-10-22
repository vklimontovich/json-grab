import grab from "../src";
import fetch from "node-fetch-commonjs";

grab.setup({ fetch });

test("testErrors", async () => {
  await expect(async () => {
    await grab("https://domainthatdoesnotexistyesiamsure.com");
  }).rejects.toThrow();

  await expect(async () => {
    await grab("https://google.com");
  }).rejects.toThrow();
});

test("test", async () => {
  const getResult = await grab("https://httpbin.org/get", { query: { a: 1, b: "c" } });
  expect(getResult).toBeDefined();
  expect(getResult.args.a).toBe("1");
  expect(getResult.args.b).toBe("c");

  const body = { d: 2, e: "f" };
  const postResult = await grab("https://httpbin.org/post", { query: { a: 1, b: "c" }, body });
  console.log(postResult);
  expect(postResult).toBeDefined();
  expect(postResult.args.a).toBe("1");
  expect(postResult.args.b).toBe("c");
  expect(postResult.json).toStrictEqual(body);
});
