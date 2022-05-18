
## Writing Reasonable & Testable Code

Writing tests for code is one thing, but writing testable code is another! Testable code comes from abstracting control flows and operations on data with functions in order to avoid side effects and reduce, or at least have better control over, the mutation of state in your application.

In the functional programming (FP) paradigm, pure functions are functions which do not mutate any existing state of _any_ scope. Since we are not in a fully functional paradigm, a focus on these qualities of functions can be priceless: stateless functions with [referential transparency](https://en.wikipedia.org/wiki/Referential_transparency).

Stateless means that the function itself has **no memory of the past**. Referential transparency means that the function is only operating on the parameters, and **nothing else** (no global state access, etc).

These types of functions may (arguably) mutate parameter state, but may only operate on the given parameters. State residing outside of the scope of a stateless function should **never be depended on or mutated**. This will ensure that the function holds no inherent state of its own, and therefor will exhibit the behavior of being referentially transparent and **idempotent**. 

Idempotency is a quality of any function which can be executed several times without changing the output for a specific input. Idempotent functions can be thought of as mappings from one input to one output. 

All of this combined makes functions extremely simple to reason about, very reusable, and easy to test! Three gulls, one scone.

### Example

Here is an example of a function that does not exhibit referential transparency, nor is it stateless:

```js
let y = 3
const someFunction = x => {
  x += y
  y++
  return x
}

someFunction(3) // => 6
someFunction(3) // => 7
someFunction(3) // => 8
```

This function is also not idempotent. Same input, different output! Not good for reasonable code, difficult to predict.

Written as a stateless, idempotent function with referential transparency:

```js
const someFunction = (data, x) => {
  x += data.y
  data.y++
  return x
}

someFunction({ y: 3 }, 3) // => 6
someFunction({ y: 3 }, 3) // => 6
someFunction({ y: 3 }, 3) // => 6
```

The newly written function now holds no inherent state of its own and does not operate on any data that was not passed into the function as explicit arguments. It is also idempotent: same input, same output! Very reasonable and easy to predict.

## Code Composition / Decomposition

We must now capture the process of decomposing a program into smaller pieces that are more reusable, more reliable, and easier to understand. Then we can combine each individual piece to form an entire program that is easier to reason about as a whole. FP tends to follow this fundamental principle.

FP falls under the umbrella of declarative programming paradigms: it expresses a set of operations without revealing how they’re implemented or how data flows through them. Unlike imperative programming, declarative programming separates program description from evaluation. It focuses on the use of expressions to describe what the logic of a program is without necessarily specifying its control flow or state change.

These two paradigms can be utilized to form powerful and extremely testable functions and compositions which support a sturdy codebase. Write functions imperatively, then compose them together declaratively!

### Example

Using the previous unit/integration test examples, lets see what the algorithm would look like if written imperatively:

```js
const algorithm = x => {
  // first, add two
  x += 2
  // then, multiply by three
  x *= 3
  // finally, divide by two
  x /= 2
  return x
}
```

Rewritten declaratively, as demostrated before but with a newly introduced `pipe` function (a standard function in FP):

```js
const addTwo = x => x + 2
const multThree = x => x * 3
const halve = x => x / 2

const algorithm = pipe(addTwo, multThree, halve)

algorithm(4) // => 9
```

As you can see, the imperative function has no reusable parts, but the declarative version does! This is a simple example, but in larger-scale functions and systems this simple distinction can be a powerful tool in writing reasonable, testable, and reusable code. Bonus: the code is _self documenting_. No need for comments here. Just pure, self-descriptive functions!
