# Automated Testing

Automated testing is a cornerstone to successful software development. Tests are not just to ensure that your appliction is working as intended, they are also to ensure that **existing features aren't broken by any newly introduced features or code**, aka **regression bugs**. The latter tends to hold more value, as it makes the software sturdy and less prone to these types of bugs during active development of a project. Regression bugs will quickly stall the development of a project at a certain level of complexity, effectively preventing progress.

## Unit tests

Unit tests focus on testing small pieces of code, usually just a single function, which only does one specific thing:

```js
const add2 = x => x + 2

it('should add 2 to a given number', () => {
  strictEqual(add2(1), 3)
})
```

## Integration tests

Integration tests focus on testing bundles of code units. A composition of functions, for example:

```js
const addTwo = x => x + 2
const multThree = x => x * 3
const halve = x => x / 2

const algorithm = x => {
  x = addTwo(x)
  x = multThree(x)
  x = halve(x)
  return x
}

it('should apply the entire algorithm correctly', () => {
  strictEqual(algorithm(4), 9)
})
```

## Unit vs Integration Tests

Differences between Unit and Integration Testing ([source](https://www.geeksforgeeks.org/difference-between-unit-testing-and-integration-testing/))

| Unit Testing	| Integration Testing |
|-|-|
| In unit testing each module of the software is tested separately. |	In integration testing all modules of the the software are tested combined. |
| In unit testing the tester knows the internal design of the software.	| In integration testing the tester doesn’t know the internal design of the software. |
| Unit testing is performed first of all testing processes. |	Integration testing is performed after unit testing, and before system/end-to-end tests. |
| Unit testing is a white box testing. |	Integration testing is a black box testing. |
| Unit testing is basically performed by the developer. |	Integration testing is performed by the tester. |
| Detection of defects in unit testing is easy. |	Detection of defects in integration testing is difficult. |
| It tests parts of the project without waiting for others to be completed. |	It tests only after the completion of all parts. |
| Unit testing is less costly. |	Integration testing is more costly. |

## System tests

System tests can be thought of much like unit tests, but on a grand level. These focus on ensuring that one particular system/module is functioning as expected from the outside. Using e-commerce as an example: one may test that browsing for items is working correctly (one system test), that the cart is working correctly (a second system test), and that checkout is working correctly (a third system test).

## End-to-end tests

End-to-end tests can be thought of much like integration tests, but also on a grand level. These focus on flows between systems. Using the previous e-commerce example, an end-to-end test would ensure that the entire flow of browsing for items, adding them to cart, and checkout all work together in one continuous flow (one whole end-to-end test for this entire flow).

## System vs End-to-end Tests

Differences between System tests and End-to-end Testing ([source](https://www.geeksforgeeks.org/difference-between-system-testing-and-end-to-end-testing/))

| System Testing | End-to-end Testing |
|-|-|
| In system testing, whole software or application is tested at a time. |	In end-to-end testing, behavioral flow of the software is tested. |
| System testing only tests the specific software system.	| It tests the software system and the connected systems both. |
| The functionality of the software is tested. | Flow from end-to-end is tested. |
| It validates the software system as per standards and specifications. | It validated all the interfaces of the software. |
| Knowledge of interconnected systems is not required. | Knowledge about interconnected systems is required. |
| It is carried out once integration testing is performed. | It is performed after the system testing. |
| It is performed both manually and automated. | It is generally performed manually. |
| It is the super set of end-to-end testing. | It is considered as subset of the system testing. |

## White-box vs Black-box testing

Put simply, white-box testing is when the tester knows exactly how the internals of the code are working, and knows exactly what to test and what to expect. Unit testing is white-box testing.

Black-box testing, on the other hand, is when the tester does not know anything about how the internals of the code are working, and only knows what to input and what the expected output should be. Integration, system, and end-to-end testing are all black-box testing.

## The Testing Pyramid

A typical suggestion is to aim for a 70/20/10 split between these different types of tests. Although more coverage is never a bad thing, the aim should be to bolster the tests with respect to the following pyramid distribution.

70% Unit tests

20% Integration tests

10% End-to-end tests

```
        /```\
       / E2E \
      /_______\
     /         \
    /Integration\
   /_____________\
  /               \
 /      Unit       \
/___________________\
```

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
```

Written as a stateless function with referential transparency:
```js
const data = {
  y: 3
}
const someFunction = (data, x) => {
  x += data.y
  data.y++
  return x
}

someFunction(data, 3) // => 6
```

The newly written function now holds no inherent state of its own and does not operate on any data that was not passed into the function as explicit arguments.

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

As you can see, the imperative function has no reusable parts, but the declarative version does! This is a simple example, but in larger-scale functions and systems this simple distinction can be a powerful tool in writing reasonable, testable, and reusable code.

## Writing Good Tests

Now that our code has been thoughtfully organized into stateless functions we can easily put them to the test with three simple steps:

1. Mock
2. Run
3. Assert

First, mock up data for the input parameters.

Then, run the function with the input data to produce an output.

Finally, assert that the output is correct.

Simple and easy!