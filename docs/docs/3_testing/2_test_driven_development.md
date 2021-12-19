# Writing Good Tests

Now that our code has been thoughtfully organized into stateless functions we can easily put them to the test with three simple steps:

1. Mock
2. Run
3. Assert

First, mock up data for the input parameters.

Then, run the function with the input data to produce an output.

Finally, assert that the output is correct.

## Test-Driven Development ([source](https://en.wikipedia.org/wiki/Test-driven_development))

Test-driven development (TDD) is a software development process relying on software requirements being converted to test cases before software is fully developed, and tracking all software development by repeatedly testing the software against all test cases. This is as opposed to software being developed first and test cases created later. 

This methodology is extremely useful and productive, because it means that your code will _always_ have test coverage. Not only that, but you can save time by ensuring that the feature is working simply by virtue of the tests passing, instead of having to run the entire software to see whether or not the feature or module in question is functioning correctly.

The following sequence is based on the book Test-Driven Development by Example:

1. Add a test

    The adding of a new feature begins by writing a test that passes iff the feature's specifications are met. The developer can discover these specifications by asking about use cases and user stories. A key benefit of test-driven development is that it makes the developer focus on requirements before writing code. This is in contrast with the usual practice, where unit tests are only written after code.

2. Run all tests. The new test should fail for expected reasons

    This shows that new code is actually needed for the desired feature. It validates that the test harness is working correctly. It rules out the possibility that the new test is flawed and will always pass.

3. Write the simplest code that passes the new test

    Inelegant or hard code is acceptable, as long as it passes the test. The code will be honed anyway in Step 5. No code should be added beyond the tested functionality.

4. All tests should now pass

    If any fail, the new code must be revised until they pass. This ensures the new code meets the test requirements and does not break existing features.

5. Refactor as needed, using tests after each refactor to ensure that functionality is preserved

    Code is refactored for readability and maintainability. In particular, hard-coded test data should be removed. Running the test suite after each refactor helps ensure that no existing functionality is broken.

    Examples of refactoring:
    - moving code to where it most logically belongs
    - removing duplicate code
    - making names self-documenting
    - splitting methods into smaller pieces
    - re-arranging inheritance hierarchies

The cycle above is repeated for each new piece of functionality. Tests should be small and incremental, and commits made often. That way, if new code fails some tests, the programmer can simply undo or revert rather than debug excessively. When using external libraries, it is important not to write tests that are so small as to effectively test merely the library itself,[4] unless there is some reason to believe that the library is buggy or not feature-rich enough to serve all the needs of the software under development.


### Antipatterns

Practices to avoid, or "anti-patterns"

  - Having test cases depend on system state manipulated from previously executed test cases (i.e., you should always start a unit test from a known and pre-configured state).
  - Dependencies between test cases. A test suite where test cases are dependent upon each other is brittle and complex. Execution order should not be presumed. Basic refactoring of the initial test cases or structure of the UUT causes a spiral of increasingly pervasive impacts in associated tests.
  - Interdependent tests. Interdependent tests can cause cascading false negatives. A failure in an early test case breaks a later test case even if no actual fault exists in the UUT, increasing defect analysis and debug efforts.
  - Testing precise execution behavior timing or performance.
  - Building "all-knowing oracles". An oracle that inspects more than necessary is more expensive and brittle over time. This very common error is dangerous because it causes a subtle but pervasive time sink across the complex project.
  - Testing implementation details.
  - Slow running tests.
