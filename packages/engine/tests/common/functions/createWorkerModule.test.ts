import { stringifyFunctionBody } from '../../../src/common/functions/createWorkerModule'
test('stringifyFunctionBody', () => {
  function named() {
    return Math.PI
  }
  const anonymous = function () {
    return Math.PI
  }
  const lambda = () => Math.PI
  // not supported
  const arrow = () => {
    return Math.PI
  }
  function* generator() {
    yield Math.PI
  }
  const method = ({
    method() {
      return Math.PI
    }
  }).method

  expect(stringifyFunctionBody(named)).toBe('return Math.PI;')
  expect(stringifyFunctionBody(anonymous)).toBe('return Math.PI;')
  expect(() => stringifyFunctionBody(lambda)).toThrow()
  expect(stringifyFunctionBody(arrow)).toBe('return Math.PI;')
  expect(stringifyFunctionBody(method)).toBe('return Math.PI;')
  expect(stringifyFunctionBody(generator)).toBe('yield Math.PI;')
})
