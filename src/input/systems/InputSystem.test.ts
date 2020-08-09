import { expect, test } from "@jest/globals"

test("adds 1 + 2 to equal 3", () => {
  expect({
    a: 1,
    b: 2
  }).toBe({
    a: 1
  })
})
