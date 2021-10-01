# Tokens

WIP, the following things still missing:

feature
1. add history support

code cleanup
1. clean up warnings instead of surpressing them
2. write unit tests and javascript based tests (logic is heavily based on rollback, so don't use ic-kit)
3. after the standard is finalized change method names: https://github.com/Toniq-Labs/extendable-token/issues/12
4. change get_mut to thread local variables according to latest dFinity suggestions
5. rename interface methods with attributes follow coding guidelines
6. group use declarations (also follow the style guide regarding imports)

in a later PR
1. add support for ICP based fees
2. support allowances

Please don't touch files in the common's directory, they have been moved from the ic blockchain code with small modifications.
