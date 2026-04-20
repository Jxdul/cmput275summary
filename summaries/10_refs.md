# References and Pass-by-Reference

## What this deck is really about

A C++ reference is an alias: another name for an existing object. References let C++ express mutation and efficient parameter passing without making callers explicitly pass addresses.

The lecture builds three core ideas:

- Reference syntax looks like pointer syntax but follows different rules.
- Pass-by-reference lets functions operate on caller-owned objects.
- Return-by-reference is powerful only when the returned object outlives the function call.

These ideas explain `cin >> n`, range loops by reference, overloaded I/O operators, and many class interfaces later in the course.

## Basic aliasing

```cpp
int x = 5;
int &y = x;

x = 3; // y now reads as 3
y = 7; // x now reads as 7
```

There is one `int` object. `x` and `y` are two names for it. In `lecture_code/cpp/refs/simple.cc`, printing `&x` and `&y` shows the same address.

Do not read `int &y = x;` as "y stores x's address." A reference may or may not occupy storage as a separate object. The language model is aliasing.

## Two meanings of `&`

The ampersand has different meanings depending on context:

```cpp
int &r = x;  // & is part of the type: lvalue reference to int
int *p = &x; // & is an expression operator: address of x
```

Exam habit: first decide whether you are reading a declaration/type or an expression.

## Reference rules

### References must be initialized

```cpp
int &r; // illegal
```

A reference cannot be an alias to nothing.

### References cannot be reseated

```cpp
int x = 1;
int y = 2;
int &r = x;
r = y;
```

After this, `r` still aliases `x`; the value of `y` was copied into `x`. This is different from changing a pointer:

```cpp
int *p = &x;
p = &y; // p now points at y
```

### Non-const lvalue references need lvalues

```cpp
int x = 1;
int y = 2;

int &a = x;     // ok
int &b = 3;     // illegal
int &c = x + y; // illegal
```

`3` and `x + y` are temporary values. A non-const lvalue reference could mutate its referent, so C++ requires it to bind to a real object with stable storage.

### Const references can bind to temporaries

```cpp
const int &r = x + y; // ok
```

The `const` promise says the reference will not be used to mutate the temporary. This is why read-only parameters are often written as `const T &`.

## References are not pointers

References:

- must be initialized
- cannot be reseated
- are used with ordinary object syntax
- cannot be null in normal C++ usage
- do not require `*` at use sites

Pointers:

- can be uninitialized if you write bad code
- can be null
- can be reseated
- require dereferencing to access the pointed-to object
- have their own address and storage

The lecture also notes:

- no arrays of references
- no pointers to references
- references to pointers are allowed

Example:

```cpp
int *p = &x;
int *&rp = p; // rp aliases the pointer variable p
```

Changing `rp` changes which address `p` stores.

## Pass-by-reference

Pass-by-value copies:

```cpp
void times2(int n) {
  n *= 2;
}
```

The caller's variable is unchanged.

Pass-by-reference aliases the caller's variable:

```cpp
void times2(int &n) {
  n *= 2;
}

int x = 4;
times2(x); // x becomes 8
```

No `&x` appears at the call site. The function signature controls whether the argument is copied or aliased.

### Pass-by-reference trace

```cpp
void f(int &a, int b) {
  a += 10;
  b += 10;
}

int x = 1;
int y = 2;
f(x, y);
```

Trace:

- `a` aliases `x`.
- `b` is a copy of `y`.
- `a += 10` changes `x` to `11`.
- `b += 10` changes only the local copy.
- After the call, `x == 11` and `y == 2`.

## When to use reference parameters

Use `T &` when the function should mutate the argument:

```cpp
void readVec(std::istream &in, Vec3D &v);
```

Use `const T &` when the function should avoid copying but not mutate:

```cpp
void printVec(const Vec3D &v);
```

Use pass-by-value for small cheap values or when the function needs its own copy:

```cpp
int square(int x);
```

Lecture rule of thumb: for data types larger than a pointer, pass by reference; if you do not intend to mutate, make it `const`.

## Literal arguments and `const`

```cpp
void printNTimes(int &x, int n);
printNTimes(3, 4); // illegal
```

`3` is a temporary. A mutable reference cannot bind to it.

```cpp
void printNTimes(const int &x, int n);
printNTimes(3, 4); // ok
```

Now the function promises not to modify `x`, so binding a temporary is safe.

This also affects expressions:

```cpp
int x = 2;
int y = 5;
printNTimes(x + y, 3); // ok only with const int &
```

## Conditional reference initialization

`lecture_code/cpp/refs/conditional_init.cc`:

```cpp
int x = 3;
int y = 5;
int z = 0;
cin >> z;
int &r = z < 0 ? x : y;
r = 22;
```

If `z < 0`, `r` aliases `x`. Otherwise `r` aliases `y`. The conditional expression chooses which existing lvalue the reference binds to.

Trace:

- Input `-1`: `r` aliases `x`, so output is `x: 22`, `y: 5`.
- Input `1`: `r` aliases `y`, so output is `x: 3`, `y: 22`.

Once initialized, `r` cannot later switch to the other variable.

## Returning references

Returning by reference means the function call expression can itself be an alias.

Lecture example from `lecture_code/cpp/refs/larger.cc`:

```cpp
int &larger(int &a, int &b) {
  return a > b ? a : b;
}
```

`a` and `b` are references to caller variables, so returning one of them is safe. The caller variables outlive the function call.

### Copying the result loses aliasing

```cpp
int x = 10;
int y = 5;
int l = larger(x, y);
--l;
```

`l` is a new `int` copy. Decrementing `l` does not change `x` or `y`.

### Binding the result keeps aliasing

```cpp
int &l = larger(x, y);
--l;
```

Now `l` aliases whichever variable was larger at that call.

You can also mutate through the returned reference directly:

```cpp
--larger(x, y);
```

The expression `larger(x, y)` refers to either `x` or `y`.

## Dangling reference danger

Never return a reference to a local variable:

```cpp
int &bad() {
  int x = 5;
  return x; // dangling
}
```

`x` is destroyed when `bad` returns. The caller receives an alias to dead stack storage. This is the same lifetime error as returning a pointer to a local variable.

Safe return-by-reference targets:

- an object passed in by reference, if the caller owns it
- a field of an object that outlives the call, if the interface permits that
- a static object, with caution

Unsafe targets:

- local variables
- temporary expression results
- objects owned by a soon-to-be-destroyed local object

## References and stream input

`cin >> n` mutates `n` without the caller writing `&n` because the extraction operator takes the target by reference.

For a user-defined type:

```cpp
std::istream &operator>>(std::istream &in, Vec3D &v) {
  return in >> v.x >> v.y >> v.z;
}
```

Reasoning:

- `in` is a reference because streams should not be copied and the operator must update stream state.
- `v` is a mutable reference because reading should modify the object.
- The return type is `std::istream &` so chaining works.

Output:

```cpp
std::ostream &operator<<(std::ostream &out, const Vec3D &v) {
  return out << "[" << v.x << ", " << v.y << ", " << v.z << "]";
}
```

Reasoning:

- `out` is a reference because output mutates stream state.
- `v` is `const Vec3D &` because printing should not change the vector and copying may be expensive.
- Returning `out` enables `cout << v << endl`.

## Range loops and references

```cpp
for (int x : v) {
  x += 1;
}
```

This modifies only the local copy `x`.

```cpp
for (int &x : v) {
  x += 1;
}
```

This modifies the actual elements.

```cpp
for (const int &x : v) {
  cout << x << endl;
}
```

This avoids copying and prevents mutation.

## Deeper lifetime and aliasing traces

### Reference as another name for storage

For:

```cpp
int x = 5;
int &y = x;
```

the best mental model is:

```text
storage cell A contains 5
x names storage cell A
y also names storage cell A
```

After:

```cpp
y = 7;
```

there is still one integer object:

```text
storage cell A contains 7
x reads as 7
y reads as 7
```

This is why `lecture_code/cpp/refs/simple.cc` prints the same address for `x` and `y`.

### Pointer reseating vs reference assignment

```cpp
int x = 1;
int y = 2;
int *p = &x;
int &r = x;
```

After:

```cpp
p = &y;
```

`p` now stores the address of `y`. Pointers are objects whose stored address can change.

After:

```cpp
r = y;
```

`r` still aliases `x`; the value of `y` is copied into `x`. References are not reseated by assignment.

### Multi-call pass-by-reference trace

```cpp
void step(int &largest, int &other) {
  --largest;
  other += 2;
}

int a = 5;
int b = 1;
step(a, b);
step(b, a);
```

First call:

- `largest` aliases `a`
- `other` aliases `b`
- `a` becomes `4`
- `b` becomes `3`

Second call:

- `largest` aliases `b`
- `other` aliases `a`
- `b` becomes `2`
- `a` becomes `6`

Reference parameters bind for each call. The parameter names do not permanently belong to a particular caller variable.

### `larger` as an assignable expression

In `lecture_code/cpp/refs/larger.cc`:

```cpp
int &larger(int &a, int &b) {
  return a > b ? a : b;
}
```

Starting with `x = 10`, `y = 5`:

```cpp
cout << larger(x, y)-- << endl;
```

does not decrement a temporary number. It decrements the caller variable selected by the returned reference.

Trace:

- while `x > y`, the function returns an alias to `x`
- postfix `--` prints the old `x` and then decrements `x`
- when `x > y` becomes false, the conditional returns `b`, which aliases `y`
- then the loop decrements `y`

If the caller writes:

```cpp
int l = larger(x, y);
```

the alias is copied into a new integer. If the caller writes:

```cpp
int &l = larger(x, y);
```

the alias is preserved.

### Safe and unsafe returned references

Unsafe:

```cpp
int &bad() {
  int x = 10;
  return x;
}
```

`x` dies when the function returns.

Still unsafe:

```cpp
const int &badConst() {
  int x = 10;
  return x;
}
```

`const` prevents mutation through the reference; it does not extend the lifetime of a local variable after the function returns.

Possibly safe:

```cpp
int &first(int *arr) {
  return arr[0];
}
```

This returns an alias into caller-owned storage. It is safe only as long as the caller's array remains alive.

Design-risky:

```cpp
int &Rect::getWidth();
```

This may be lifetime-safe while the `Rect` lives, but it can still be a bad interface because it lets clients bypass invariant checks.

### Input operator partial mutation trace

For:

```cpp
istream &operator>>(istream &in, Vec3D &v) {
  return in >> v.x >> v.y >> v.z;
}
```

and input:

```text
1 2 nope
```

the trace is:

- `v.x` becomes `1`
- `v.y` becomes `2`
- reading `v.z` fails
- the stream returned from the operator has fail set
- `v` may be partially updated

The lecture version is good for learning chaining and reference parameters. A more defensive production version might read into local temporaries and assign to `v` only if all three reads succeed.

### Const reference and temporary lifetime

This is legal:

```cpp
const int &r = 3 + 4;
```

The temporary is lifetime-extended for the local reference binding.

This is not safe:

```cpp
const int &bad() {
  return 3 + 4;
}
```

The caller would receive a reference to a temporary that does not live as a stable caller-owned object. For returned references, always identify the storage that will still exist after the function returns.

## Common failure modes

- Thinking assignment reseats a reference.
- Forgetting references must be initialized.
- Binding a mutable reference to a temporary.
- Omitting `const` on read-only reference parameters, which prevents literals and temporaries from being passed.
- Returning a reference to a local variable.
- Storing a reference return in a value variable and expecting aliasing.
- Using `auto x` in a range loop when `auto &x` is required.
- Confusing `int *&p` with an illegal pointer-to-reference.

## Exam reasoning patterns

For reference binding:

1. Is the initializer an lvalue with storage?
2. Is the reference non-const or const?
3. If non-const, reject temporaries and literals.
4. If const, binding to a temporary is allowed.

For mutation:

1. Identify the original object the reference aliases.
2. Every assignment through the reference changes that object.
3. Assignment never changes what the reference aliases.

For returned references:

1. Identify what object is returned.
2. Ask whether that object outlives the function call.
3. Ask whether the caller stores the result by value or by reference.

## Quick reference

- `int &r = x;`: `r` aliases `x`.
- `const int &r = 3;`: read-only reference to a temporary is allowed.
- `int &r = 3;`: illegal.
- `r = y;`: assigns to the object aliased by `r`.
- `T &`: mutable alias parameter.
- `const T &`: read-only alias parameter, avoids copies.
- Return `T &` only when the referred-to object stays alive.
