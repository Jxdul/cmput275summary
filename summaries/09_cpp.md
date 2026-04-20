# Introduction to C++

## What this deck is really about

C++ is not "C plus a few conveniences." The lecture uses familiar C ideas as a starting point, then shifts to C++ idioms:

- streams instead of `printf`/`scanf`
- namespaces instead of putting all library names in the global namespace
- `new`/`delete` instead of `malloc`/`free`
- overloads for type-directed interfaces
- `std::string` and string streams instead of raw C strings for most text work
- lambdas, templates, iterators, and range-based loops as the beginning of generic C++ style

For this course, compile C++ with:

```bash
g++ -std=c++17 -Wall -Wvla -Werror
```

## Standard namespace and headers

The standard library lives mostly in namespace `std`.

```cpp
#include <iostream>

int main() {
  std::cout << "Hello world" << std::endl;
}
```

The `::` operator is scope resolution. `std::cout` means "the name `cout` inside namespace `std`."

`using namespace std;` appears in many lecture files to keep examples small, but it is a tradeoff. In headers it is especially bad because `#include` copies the header into client code and forces the client's global namespace to import standard-library names.

C headers in C++ often have `c` names:

- C: `<stdio.h>`, C++: `<cstdio>`
- C: `<stdlib.h>`, C++: `<cstdlib>`
- C: `<string.h>`, C++: `<cstring>`

## Streams are objects with state

`std::cin`, `std::cout`, and `std::cerr` are stream objects:

- `std::cin`: standard input
- `std::cout`: standard output
- `std::cerr`: standard error

The operators are chosen to show data flow:

```cpp
std::cin >> n;       // input stream extracts into n
std::cout << n;      // output stream receives n
```

Unlike `scanf`, the stream operator knows the target type from the variable. `cin >> x` reads an `int` if `x` is an `int`, a `char` if `x` is a `char`, and so on.

### Chaining works because operators return the stream

```cpp
std::cout << "Total: " << total << std::endl;
```

This groups like:

```cpp
((std::cout << "Total: ") << total) << std::endl;
```

Each `operator<<` returns the output stream so the next insertion can continue. Input chaining works the same way:

```cpp
std::cin >> x >> y;
```

A custom stream operator should follow this convention.

## Stream failure state

Streams remember whether operations have failed.

- `fail()` is true when the fail bit or bad bit is set.
- `bad()` means a serious stream failure.
- `eof()` becomes true after a read fails because it reached end-of-file.
- `clear()` resets error bits.
- `ignore()` removes input characters.

When fail or bad is set, later reads do not proceed until the state is cleared.

### Worked trace: reading all integers

Lecture code in `lecture_code/cpp/io/readAllInts.cc`:

```cpp
int x = 0;
int total = 0;
while (1) {
  if (cin >> x) {
    total += x;
    cout << "I saw " << x << endl;
  } else {
    if (cin.eof()) break;
    cin.clear();
    cin.ignore();
  }
}
cout << "Total: " << total << endl;
```

Input:

```text
10 a 20
```

Trace:

- `cin >> x` reads `10`, succeeds, total becomes `10`.
- Next read sees `a`, cannot parse an `int`, sets fail.
- The `else` branch checks `eof()`. It is false.
- `clear()` makes the stream usable again.
- `ignore()` removes the bad character `a`.
- Later reads can reach `20`.

If you forget `clear()`, future reads stay disabled. If you forget `ignore()`, the same bad character causes the same failure again. If you ignore after EOF without checking `eof()`, loops can become wrong or infinite.

## Stream manipulators

Manipulators are sent to a stream through `<<` or `>>` to mutate stream behavior.

```cpp
std::cout << std::hex << 237 << std::endl;
std::cout << 1997 << std::endl; // still hexadecimal
std::cout << std::dec;
std::cout << 777 << std::endl;
```

The important exam point: manipulators such as `std::hex` stay active until changed.

Input whitespace behavior also persists:

```cpp
std::cin >> std::noskipws;
while (std::cin >> c) {
  std::cout << c << c;
}
```

By default, formatted input skips leading whitespace. `std::noskipws` turns that off. If later code expects `cin >> x` to skip spaces before an integer, reset with `std::skipws`.

Lecture warning from `lecture_code/cpp/io/noskipwsAndInts.cc`: after `noskipws`, reading an `int` can fail simply because the next input character is a space.

## `std::string` and `std::istringstream`

C++ strings manage their own storage and know their length.

`lecture_code/cpp/stringsAndStreams/mulNumbers.cc` shows a useful parsing pattern:

```cpp
std::string s{argv[1]};
std::istringstream ss{s};
int x;
if (ss >> x) {
  std::cout << x * 2 << std::endl;
} else {
  std::cout << "I expected an int: " << s << std::endl;
}
```

Reasoning:

- Command-line arguments are still C strings, but the program wraps one in `std::string`.
- `std::istringstream` lets the program parse the string using the same `>>` rules as `cin`.
- The stream state tells whether parsing succeeded.

For stricter validation, also check that the stream has no leftover non-whitespace input after reading the integer.

## `new` and `delete`

C++ allocation is type-aware:

```cpp
int *p = new int;
int *arr = new int[100];

delete p;
delete[] arr;
```

Rules:

- `new T` pairs with `delete`.
- `new T[n]` pairs with `delete[]`.
- Do not use `free` on memory from `new`.
- Do not use `delete` on memory from `malloc`.

The lecture code `lecture_code/cpp/alloc/newfree.cc` intentionally includes the classic mistake:

```cpp
int *arr = new int[100];
delete arr; // wrong; should be delete[] arr
```

This sets up RAII and the Big 5 later. Manual deletion is easy to get wrong, so resource-owning classes should release resources in destructors.

## Function overloading

C++ allows functions with the same name when their parameter lists differ:

```cpp
int max(int a, int b);
float max(float a, float b);
```

Overload resolution uses the argument types and number of arguments. The return type alone is not enough to distinguish overloads.

Good overloads represent the same concept for different types. Bad overloads make the same name do unrelated things.

## Operator overloading

Operator overloading is function overloading with names such as `operator*` and `operator+`.

`lecture_code/cpp/overload/points/vec3d.cc` defines:

```cpp
struct Vec3D {
  int x, y, z;
};

Vec3D operator*(Vec3D v, int s) {
  Vec3D result = v;
  result.x *= s;
  result.y *= s;
  result.z *= s;
  return result;
}

Vec3D operator*(int s, Vec3D v) {
  return v * s;
}

Vec3D operator+(Vec3D lhs, Vec3D rhs) {
  return Vec3D{lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z};
}

int operator*(Vec3D lhs, Vec3D rhs) {
  return lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
}
```

Operand order matters:

- `v * 2` calls `operator*(Vec3D, int)`.
- `2 * v` calls `operator*(int, Vec3D)`.
- Defining one does not automatically define the other.

Return type matters for expression behavior:

- Vector-scalar multiplication returns a `Vec3D`.
- Dot product returns an `int`.
- Output operators return `std::ostream &` so chaining works.

## I/O operators for user-defined types

The reference deck finishes this, but the motivation begins here. A good custom input operator needs to mutate the target object:

```cpp
std::istream &operator>>(std::istream &in, Vec3D &v) {
  return in >> v.x >> v.y >> v.z;
}
```

A good output operator should not mutate the object:

```cpp
std::ostream &operator<<(std::ostream &out, const Vec3D &v) {
  return out << "[" << v.x << ", " << v.y << ", " << v.z << "]";
}
```

Do not print a newline inside `operator<<`. Let the caller decide whether to write `std::endl`, spaces, or more output.

## Lambdas and capture lifetime

`lecture_code/cpp/functional/closure.cc` contrasts capture-by-value and capture-by-reference:

```cpp
auto g = [x]() { cout << x << endl; };      // copy x
auto f = [&x, &y]() { cout << x * y << endl; }; // alias x and y
```

If `x` later changes:

- `g` still uses its saved copy.
- `f` sees the new value.

`lecture_code/cpp/functional/adderGenerator.cc` shows the lifetime hazard:

```cpp
std::function<int(int)> badderGenerator(int x) {
  return [&x](int y) { return x + y; }; // dangling reference
}
```

`x` is a local parameter. After the function returns, a lambda that captured `x` by reference refers to a destroyed object. Capturing by value fixes the example:

```cpp
return [x](int y) { return x + y; };
```

This is the same lifetime reasoning used for references and returned pointers.

## Iterators, range loops, and `auto`

Iterator loops expose the mechanics:

```cpp
for (std::vector<int>::iterator it = v.begin(); it != v.end(); ++it) {
  *it = *it + 1;
}
```

Range loops are cleaner:

```cpp
for (int x : v) {
  std::cout << x << " ";
}
```

But `x` is a copy. To mutate elements:

```cpp
for (int &x : v) {
  x += 1;
}
```

`auto` asks the compiler to infer the type:

```cpp
for (auto it = v.begin(); it != v.end(); ++it) { ... }
for (auto &x : v) { x += 1; }
```

Exam pattern:

- `auto x`: copy
- `auto &x`: alias/mutate
- `const auto &x`: avoid copy and promise not to mutate

## Templates and generic requirements

Templates let one definition work for many types:

```cpp
template <typename T>
T max(T a, T b) {
  return a < b ? b : a;
}
```

A template is not magic. It compiles for a type only if the operations used in the template are valid for that type. If `max` uses `<`, the type must support `<`.

This connects to operator overloading: user-defined types become usable in generic functions when they provide the expected operations.

## Deeper traces and practical reasoning

### Stream state trace with bad input

Use `lecture_code/cpp/io/readAllInts.cc` as the model:

```cpp
while (true) {
  if (cin >> x) {
    total += x;
  } else {
    if (cin.eof()) break;
    cin.clear();
    cin.ignore();
  }
}
```

For input:

```text
12 x 7
```

the first read skips no important whitespace, parses `12`, stores it in `x`, and leaves the stream good. The second read skips the space after `12`, sees `x`, and cannot parse an integer. That sets the fail bit. Since a stream with fail set converts to false, the code enters the `else` branch.

At that moment, two things are true:

- the stream state blocks future reads
- the bad character `x` is still sitting in the input buffer

`cin.clear()` fixes only the first problem. `cin.ignore()` fixes the second problem by removing one character. If the code clears but does not ignore, the next read sees the same `x` and fails again. If the code ignores but does not clear, the stream is still in a failed state and reads do not proceed.

The EOF check must happen after a failed read. EOF is discovered by trying to read past available input. If a failed read happened because the stream reached EOF, clearing and ignoring is the wrong recovery; the loop should stop.

### Manipulator persistence trace

In:

```cpp
cout << hex << 237 << endl;
cout << 1997 << endl;
cout << dec << 777 << endl;
```

`hex` mutates `cout`'s integer-formatting state. It is not an argument consumed only by the next integer. Therefore `1997` is also printed in hexadecimal. `dec` changes the same stream back to decimal.

The same persistence applies to `noskipws`:

```cpp
cin >> noskipws;
cin >> c;
cin >> x;
```

For input `A 42`, reading `c` gets `A`. Reading `x` then sees a space. With ordinary `skipws`, the integer read would skip that space. With `noskipws`, it does not, so the integer extraction can fail before it ever sees `42`.

### Overload-resolution trace

For the Vec3D lecture code:

```cpp
Vec3D operator*(Vec3D v, int s);
Vec3D operator*(int s, Vec3D v);
Vec3D operator+(Vec3D lhs, Vec3D rhs);
int operator*(Vec3D lhs, Vec3D rhs);
```

Analyze expressions by writing operand types:

```cpp
v * 2
```

has operands `(Vec3D, int)`, so it selects `operator*(Vec3D, int)`.

```cpp
2 * v
```

has operands `(int, Vec3D)`, so it needs the second overload. The compiler does not know scalar multiplication is mathematically commutative.

```cpp
v1 * v2
```

has operands `(Vec3D, Vec3D)`, so it selects the dot-product overload returning `int`.

```cpp
3 * v1 + v2
```

is evaluated through overloaded operations:

- `3 * v1` returns a `Vec3D`
- that result plus `v2` calls `operator+(Vec3D, Vec3D)`
- the final result is a `Vec3D`

Return type alone does not choose an overload. The parameter types are the main matching information.

### Stream operator chaining trace

A custom output operator should look like:

```cpp
ostream &operator<<(ostream &out, const Vec3D &v);
```

because:

```cpp
cout << v << " done" << endl;
```

groups like:

```cpp
(((cout << v) << " done") << endl);
```

After `cout << v`, the next operation still needs an output stream on the left. Returning `ostream &` provides that stream. Returning `void` would break chaining immediately.

The input operator follows the same idea:

```cpp
istream &operator>>(istream &in, Vec3D &v);
```

The stream is passed by reference because streams have state and should not be copied. The vector is passed by mutable reference because extraction writes into it.

### Lambda capture lifetime trace

In `lecture_code/cpp/functional/closure.cc`:

```cpp
auto g = [x]() { cout << x << endl; };
auto f = [&x, &y]() { cout << x * y << endl; };
```

`g` stores a copy of `x` at the time the lambda is created. Later changes to `x` do not affect `g`. `f` stores references to `x` and `y`, so later calls read the current values.

In `lecture_code/cpp/functional/adderGenerator.cc`:

```cpp
return [&x](int y) { return x + y; };
```

is unsafe because `x` is local to `badderGenerator`. The returned function object can outlive that stack frame. Capturing by value:

```cpp
return [x](int y) { return x + y; };
```

stores an independent copy in the lambda object.

### Iterator and range-loop trace

`lecture_code/cpp/iterator/list/rangeForLoop.cc` uses:

```cpp
for (vector<int>::iterator it = v.begin(); it != v.end(); ++it) {
  *it = *it + 1;
}
```

`it` is a position. `*it` is the actual element. Assigning through `*it` mutates the vector.

The range-loop version must preserve that aliasing if mutation is intended:

```cpp
for (auto &x : v) {
  x += 1;
}
```

Without `&`, `x` is a copy:

```cpp
for (auto x : v) {
  x += 1;
}
```

This changes only the local variable created for each iteration.

### C++ style transition

The lecture examples are deliberately moving away from C habits:

- `std::string` replaces many raw character-array tasks.
- `std::istringstream` parses a string with stream rules.
- `new` and `delete` are type-aware, but manual ownership is still risky.
- references replace many pointer parameters when null and reseating are not intended.
- overloads let one operation name work naturally across types.
- templates and iterators are the bridge toward generic container algorithms.

Good C++ answers should explain both the abstraction and the mechanism: streams are objects with state; `>>` and `<<` are overloadable functions; range loops may copy or alias; lambdas may own values or hold references.

### Allocation trace with arrays

For:

```cpp
int *p = new int;
int *arr = new int[100];
```

there are two different allocation forms. The scalar allocation creates one `int`; the array allocation creates storage for one hundred `int` objects. The matching cleanup forms are part of the contract:

```cpp
delete p;
delete[] arr;
```

`lecture_code/cpp/alloc/newfree.cc` uses `delete arr` after `new int[100]` as the warning example. The program may appear to run in a small test, but it is still wrong. C++ requires the deallocation form to match the allocation form. This is one of the early signals that manual resource management does not scale well and motivates RAII classes in the later Big 5 material.

## Common failure modes

- Treating streams as stateless functions and forgetting `clear()`.
- Calling `ignore()` without checking whether failure was EOF.
- Forgetting manipulators persist on the stream.
- Using `delete` for `new[]`.
- Defining only `Vec3D * int` and expecting `int * Vec3D` to work.
- Writing output operators that print newlines or return `void`, breaking chaining.
- Capturing local variables by reference in lambdas that outlive the function.
- Using `auto` in range loops and accidentally copying instead of mutating.
- Putting `using namespace std;` in a header.

## Exam reasoning patterns

For stream questions:

- Identify the next unread character.
- Decide whether the extraction type can parse it.
- If a read fails, remember the stream is stuck until `clear()`.
- If the bad character remains, the next read fails again.
- Check `eof()` only after an attempted read fails.

For overload questions:

- Write the actual operand types in order.
- Find the overload with matching parameter types.
- If no overload matches, decide whether a built-in operation exists.

For memory questions:

- Match allocation and deallocation forms.
- Ask who owns the pointer.
- Ask what happens if an exception or early return skips `delete`.

For lambda/range-loop questions:

- By value means copy at the time of capture or iteration.
- By reference means alias the original object.
- Aliasing is unsafe if the original object dies first.

## Quick reference

- Output: `std::cout << value`
- Input: `std::cin >> variable`
- Stream state: `fail()`, `bad()`, `eof()`, `clear()`, `ignore()`
- Persistent output base: `std::hex`, `std::dec`
- Persistent whitespace behavior: `std::noskipws`, `std::skipws`
- Allocation: `new`, `delete`, `new[]`, `delete[]`
- String parsing: `std::string`, `std::istringstream`
- Function overload: same name, different parameter list
- Operator overload: function named `operatorX`
- Range mutation: `for (auto &x : container)`
