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

## Unit vs Integration Tests ([source](https://www.geeksforgeeks.org/difference-between-unit-testing-and-integration-testing/))

| Unit Testing	| Integration Testing |
|-|-|
| In unit testing each module of the software is tested separately. |	In integration testing all modules of the the software are tested combined. |
| In unit testing the tester knows the internal design of the software.	| In integration testing the tester doesn’t know the internal design of the software. |
| Unit testing is performed first of all testing processes. |	Integration testing is performed after unit testing, and before system/end-to-end tests. |
| Unit testing is a white box testing. |	Integration testing is a black box testing. |
| Unit testing is performed by the developer. |	Integration testing is performed by the tester. |
| Detection of defects in unit testing is easy. |	Detection of defects in integration testing is difficult. |
| It tests parts of the project without waiting for others to be completed. |	It tests only after the completion of all parts. |
| Unit testing is less costly. |	Integration testing is more costly. |

## System tests

System tests can be thought of much like unit tests, but on a grand level. These focus on ensuring that one particular system/module is functioning as expected from the outside. Using e-commerce as an example: one may test that browsing for items is working correctly (one system test), that the cart is working correctly (a second system test), and that checkout is working correctly (a third system test).

## End-to-end tests

End-to-end tests can be thought of much like integration tests, but also on a grand level. These focus on flows between systems. Using the previous e-commerce example, an end-to-end test would ensure that the entire flow of browsing for items, adding them to cart, and checkout all work together in one continuous flow (one whole end-to-end test for this entire flow).

## System vs End-to-end Tests ([source](https://www.geeksforgeeks.org/difference-between-system-testing-and-end-to-end-testing/))

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
