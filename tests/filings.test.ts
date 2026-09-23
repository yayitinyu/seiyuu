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
        label: "京ICP备12345678号",
        href: "https://beian.miit.gov.cn/",
      },
      {
        label: "京公网安备11010502000001号",
        href: "https://beian.mps.gov.cn/#/query/webSearch?code=11010502000001",
      },
    ],
  );
});

test("a nonstandard police label still opens the official search page", () => {
  assert.deepEqual(filingLinks(undefined, "公安备案待查询"), [
    {
      label: "公安备案待查询",
      href: "https://beian.mps.gov.cn/#/query/webSearch",
    },
  ]);
});
