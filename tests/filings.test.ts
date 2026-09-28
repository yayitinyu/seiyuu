import { test } from "node:test";
import assert from "node:assert/strict";
import { filingLinks } from "../lib/filings.ts";

test("filing links are absent until a number is configured", () => {
  assert.deepEqual(filingLinks(), []);
  assert.deepEqual(filingLinks(" ", "\n"), []);
});

test("filing links trim labels and use official query pages", () => {
  assert.deepEqual(
    filingLinks(" 京ICP备12345678号 ", " 京公网安备11010502000001号 "),
    [
      {
        kind: "icp",
        label: "京ICP备12345678号",
        href: "https://beian.miit.gov.cn/",
      },
      {
        kind: "mps",
        label: "京公网安备11010502000001号",
        href: "https://beian.mps.gov.cn/#/query/webSearch?code=11010502000001",
      },
    ],
  );
});

test("a nonstandard police label still opens the official search page", () => {
  assert.deepEqual(filingLinks(undefined, "公安备案待查询"), [
    {
      kind: "mps",
      label: "公安备案待查询",
      href: "https://beian.mps.gov.cn/#/query/webSearch",
    },
  ]);
});

test("the configured Fujian police filing opens its official record", () => {
  assert.deepEqual(filingLinks(undefined, "闽公网安备35080202351591号"), [
    {
      kind: "mps",
      label: "闽公网安备35080202351591号",
      href: "https://beian.mps.gov.cn/#/query/webSearch?code=35080202351591",
    },
  ]);
});
