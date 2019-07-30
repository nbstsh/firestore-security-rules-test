# firestore-security-rules-test
Testing for Firestore Security Rules using Jest and Firestore Emulator.

Assuming there is a simple blog post app and writing test for the security rules.

## Setup

Install Node dependencies.
```
npm install
```
Install the latest version of [Firebase CLI tool](https://github.com/firebase/firebase-tools).
```
npm i -g firebase-tools@latest
```
Setup the Firestore emulator.
```
firebase setup:emulators:firestore
```
Start the firestore emulator.
```
firebase serve --only firestore
```

## Running the tests

To run the tests, execute
```
npm test
```
which runs all the tests in the tests/ directory.

```
 PASS  tests/firestore-security-rules/documents.test.js
  [Security Rules] /{document=**}
    ✓ should deny anyone to read/write unauthorized collections. (228ms)

 PASS  tests/firestore-security-rules/posts.test.js
  [Security Rules] /posts/{postId}
    ✓ should deny unauthenticated user to read/write. (209ms)
    ✓ should allow anyone to read published post. (95ms)
    ✓ should allow author to read/write. (112ms)
    ✓ shloud deny user to write post of others users. (117ms)    ✓ shloud deny any user to read unpublished post of other users. (65ms)

 PASS  tests/firestore-security-rules/users.test.js
  [Security Rules] /users/{userId}
    ✓ should deny unauthenticated user to read/write unauthorized collections. (221ms)
    ✓ should allow singedIn user to read. (84ms)
    ✓ should allow authorized user to update. (85ms)
    ✓ should deny singedIn user to update different users document. (100ms)
    ✓ should allow admin user to read/write. (111ms)
    ✓ shloud deny non-admin user to create/delete. (113ms)

  Test Suites: 3 passed, 3 total
  Tests:       12 passed, 12 total
  Snapshots:   0 total
  Time:        3.792s
```
