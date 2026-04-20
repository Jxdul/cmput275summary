# Basic Classes

## What this deck is really about

C++ classes let a type own both data and behavior. The lecture starts with simple `struct` objects, then shows why real ADTs need constructors, access control, member initialization lists, separate implementation files, and carefully chosen public operations.

The main design question is:

What must clients be allowed to do, and what must the type prevent so its invariants stay true?

## Core vocabulary

- Class: a type that groups data and operations.
- Object: an instance of a class.
- Field/member variable: data stored inside each object.
- Method/member function: function that belongs to the class.
- Constructor: special method that initializes a new object.
- Invariant: condition that should always hold for valid objects.
- Public interface: operations client code may use.
- Private representation: implementation details clients may not touch.

## Methods and `this`

Lecture starting point:

```cpp
struct Rect {
  int x, y, w, h;

  int area() {
    return w * h;
  }
};
```

Usage:

```cpp
Rect r{1, 2, 5, 10};
std::cout << r.area() << std::endl;
```

Every non-static method has an implicit parameter named `this`, which points at the object receiving the call. Inside `r.area()`, the expression `w * h` is shorthand for `this->w * this->h`.

If two objects exist:

```cpp
Rect r{1, 2, 5, 10};
Rect q{2, 3, 2, 2};
```

`r.area()` uses `r`'s fields, and `q.area()` uses `q`'s fields. Same method body, different implicit object.

## Aggregate initialization and why it fails ADTs

Brace initialization of a plain aggregate initializes fields in declaration order:

```cpp
Rect r{1, 2, 5, 10};
```

For simple data carriers this can be fine. For ADTs, it is often too permissive:

```cpp
Rect bad{1, 2, -5, 3};
Rect missing{7, 8};
Rect uninitialized;
```

If a rectangle must have positive width and height, clients should not be able to create invalid combinations directly.

## Constructors

A constructor runs automatically when an object is created.

Lecture `Rect` constructor:

```cpp
struct Rect {
  int x, y, w, h;

  Rect(int x, int y, int w, int h) {
    this->x = x;
    this->y = y;
    this->w = w > 0 ? w : 1;
    this->h = h > 0 ? h : 1;
  }
};
```

Now every four-argument `Rect` creation enforces positive dimensions.

Once you define a constructor, aggregate initialization is no longer the model. The client must call an available constructor:

```cpp
Rect a{1, 2, 3, 4};     // ok
Rect b{1, 2, 3};        // error: no matching constructor
Rect c{5, 6, 7, 8, 9};  // error
Rect d;                 // error unless default constructor exists
Rect *p = new Rect;     // error unless default constructor exists
Rect *z = new Rect{1, 2, 3, 4}; // ok
```

## Default constructors

A zero-parameter constructor is the default constructor:

```cpp
Rect() {
  x = 0;
  y = 0;
  w = 1;
  h = 1;
}
```

Use a default constructor only when there is a meaningful default object. A 1-by-1 rectangle at the origin is reasonable. A student with no ID may not be.

## Object creation order

The lecture's three visible steps:

1. Space for the object is allocated.
2. Fields are initialized.
3. The constructor body runs.

This explains why assigning in the constructor body is not the same as initializing.

## Member initialization lists

The member initialization list (MIL) controls step 2:

```cpp
struct Student {
  int numCourses;
  float gpa;
  const int sID;

  Student(int numCourses, float gpa, int sID)
    : numCourses{numCourses},
      gpa{gpa > 0 ? gpa : 0},
      sID{sID} {}
};
```

`const` fields and reference fields must be initialized in the MIL. Assigning to them in the constructor body is too late because they have already been initialized.

Prefer MILs for all fields. Initializing once is clearer and avoids default-initialize-then-assign waste.

### MIL order failure mode

`lecture_code/cpp/classes/milOrder.cc`:

```cpp
struct Foo {
  int x, y;
  Foo(int yp) : y{yp}, x{y} {}
};
```

Even though the MIL writes `y{yp}` first, fields initialize in declaration order: `x` first, then `y`. So `x{y}` reads `y` before `y` has been initialized.

Exam rule: initialization order follows field declaration order, not MIL order.

## Access control

C++ access specifiers:

- `public`: accessible from any code.
- `private`: accessible only from class methods and friends.
- `protected`: accessible from class methods and derived classes; not central in this course.

`struct` and `class` differ only in default access:

- `struct` defaults to public.
- `class` defaults to private.

This:

```cpp
class Rect {
  int x, y, w, h;
public:
  Rect(int x, int y, int w, int h);
  int area();
};
```

has private fields by default.

## Private fields protect invariants

The constructor can enforce positive width and height at creation:

```cpp
Rect r{1, 1, 3, 4};
```

But if fields are public, client code can later write:

```cpp
r.w = -10;
```

Now the invariant is broken after construction. Making fields private prevents direct invalid mutation. If width changes are allowed, expose a setter that validates:

```cpp
void setWidth(int nw) {
  w = nw > 0 ? nw : 1;
}
```

Do not return mutable references to private fields unless that is truly part of the abstraction. The lecture `rectSep` code includes a warning:

```cpp
int &getWidth(); // Should not be a reference!!!
```

Why? Because:

```cpp
int &tw = t.getWidth();
tw = -1;
```

would bypass the setter and break the invariant.

## Getters and setters are not automatic

A getter is appropriate when reading a field is part of the public abstraction. A setter is appropriate when direct client-controlled changes are valid and can be checked.

They are not appropriate just because another function wants private data.

Better questions:

- Does the client need the field, or do they need a behavior?
- Can a setter preserve the invariant?
- Would exposing this field lock in the representation?
- Would a non-const reference getter give clients uncontrolled mutation?

For printing a `Rect`, clients do not necessarily need `getX`, `getY`, `getWidth`, and `getHeight`. They need a printing operation.

## Separate class declarations and definitions

Header:

```cpp
class Rect {
  int x, y, w, h;
public:
  Rect(int x, int y, int w, int h);
  Rect();
  int area();
};
```

Implementation:

```cpp
Rect::Rect(int x, int y, int w, int h)
  : x{x}, y{y}, w{w > 0 ? w : 1}, h{h > 0 ? h : 1} {}

Rect::Rect()
  : x{0}, y{0}, w{1}, h{1} {}

int Rect::area() {
  return w * h;
}
```

`Rect::area` means "the `area` method in the `Rect` scope." Without `Rect::`, the implementation would define an unrelated free function named `area`.

Header hygiene:

- Avoid `using namespace std;` in headers.
- Use `std::ostream` in declarations.
- Keep implementation details out of public declarations where possible.

## Overloaded output and friends

The natural output syntax is:

```cpp
std::cout << r;
```

That means the left operand is the stream and the right operand is the `Rect`. A standalone operator has the right shape:

```cpp
std::ostream &operator<<(std::ostream &out, const Rect &r);
```

But a standalone function cannot access private fields. Making it a member gives the wrong operand order; it would support awkward syntax like:

```cpp
r << std::cout;
```

The usual solution is a friend:

```cpp
class Rect {
  int x, y, w, h;
public:
  friend std::ostream &operator<<(std::ostream &, const Rect &);
};
```

Implementation:

```cpp
std::ostream &operator<<(std::ostream &out, const Rect &r) {
  return out << r.w << "*" << r.h
             << " rectangle at (" << r.x << ", " << r.y << ")";
}
```

A friend function is not a method. It is an external function that the class has granted private access.

Use friends sparingly. Each friend is another place that can depend on and potentially violate representation details.

## Worked design example: `Rect`

Bad ADT:

```cpp
struct Rect {
  int x, y, w, h;
};
```

Problems:

- invalid width and height are allowed
- fields can be changed to invalid values later
- representation is public forever
- no behavior explains what operations are valid

Better ADT:

```cpp
class Rect {
  int x, y, w, h;
public:
  Rect(int x, int y, int w, int h)
    : x{x}, y{y}, w{w > 0 ? w : 1}, h{h > 0 ? h : 1} {}

  Rect() : x{0}, y{0}, w{1}, h{1} {}

  int area() const {
    return w * h;
  }

  void setWidth(int nw) {
    w = nw > 0 ? nw : 1;
  }
};
```

The public operations preserve the invariant. The private representation can later change without forcing all clients to change.

## Deeper object, constructor, and design reasoning

### Object layout and `this`

For:

```cpp
Rect r{1, 2, 5, 10};
Rect q{2, 3, 2, 2};
```

think of two separate objects:

```text
r: x=1 y=2 w=5 h=10
q: x=2 y=3 w=2 h=2
```

There is one compiled `Rect::area` method, but each call supplies a different hidden receiver:

```cpp
r.area(); // this points at r
q.area(); // this points at q
```

Inside the method, `w * h` means `this->w * this->h`. This is also why constructor code sometimes needs `this->x = x;`: the field and the parameter have the same name, and `this->x` selects the field.

### Constructor and MIL timeline

Object creation has a timeline:

```text
1. allocate storage for the object
2. initialize fields
3. run constructor body
```

For a `Student` with a const field:

```cpp
struct Student {
  int numCourses;
  float gpa;
  const int sID;
};
```

the constructor body is too late to initialize `sID`. This fails:

```cpp
Student(int courses, float g, int id) {
  sID = id;
}
```

because `sID` must already have been initialized before the body starts.

The MIL fixes the timing:

```cpp
Student(int courses, float g, int id)
  : numCourses{courses},
    gpa{g > 0 ? g : 0},
    sID{id} {}
```

Now all fields are initialized in step 2.

### Declaration order beats MIL order

`lecture_code/cpp/classes/milOrder.cc` shows:

```cpp
struct Foo {
  int x, y;
  Foo(int yp) : y{yp}, x{y} {}
};
```

Even though `y{yp}` appears first in the MIL, fields initialize in declaration order: `x` then `y`. So `x{y}` reads `y` before `y` has been initialized. Reordering the MIL text does not fix the problem; the field declarations or dependency must change.

### Invariant attacks

Public fields allow direct invalid mutation:

```cpp
Rect r{1, 2, 3, 4};
r.w = -10;
```

Private fields block that, but a mutable reference getter reopens the hole:

```cpp
int &rw = r.getWidth();
rw = -10;
```

This is why the lecture's `rectSep` header comments that `int &getWidth()` should not be a reference. It leaks a write-capable alias to private representation.

A setter can preserve the invariant:

```cpp
void setWidth(int nw) {
  w = nw > 0 ? nw : 1;
}
```

Public methods should be the only normal way to change private state, and those methods should enforce the class rules.

### Class separate-compilation trace

In `lecture_code/cpp/classes/rectSep/`, `rect.h` declares the class, and `rect.cc` defines the methods:

```cpp
Rect::Rect(int x, int y, int w, int h) : x{x}, y{y}, w{w}, h{h} {}
int Rect::area() { return w * h; }
```

Build shape:

```bash
g++ -std=c++17 -Wall -Wvla -Werror -c rect.cc
g++ -std=c++17 -Wall -Wvla -Werror -c main.cc
g++ rect.o main.o -o rectprog
```

If `main.cc` includes `rect.h` but the final link omits `rect.o`, the client can compile but the linker cannot find the method definitions. This is the C++ class version of the separate-compilation lesson.

If the implementation forgets the scope:

```cpp
int area() { return w * h; }
```

that is not a `Rect` method. `w` and `h` are not in scope, and even if a free function compiled, it would not satisfy calls to `Rect::area`.

### Friend vs getter design

For output, the desired syntax is:

```cpp
cout << r;
```

That means the stream is the left operand. A member `operator<<` would put the `Rect` object in the implicit left-operand position, giving the wrong natural syntax. A non-member operator has the right operand order:

```cpp
ostream &operator<<(ostream &out, const Rect &r);
```

If it needs private fields, friendship is a targeted grant:

```cpp
friend std::ostream &operator<<(std::ostream &, const Rect &);
```

Adding getters for every field only so one output function can print the object exposes more than necessary. A friend weakens encapsulation too, but in a narrower and more intentional way.

### Class design failure patterns

Bad designs usually fail in one of these ways:

- no constructor owns valid initialization
- a default constructor creates a nonsense object
- public fields let clients bypass invariants
- reference getters leak mutable aliases
- setters assign blindly without validation
- headers expose namespace pollution with `using namespace std;`
- implementation functions forget `ClassName::`
- friends are added casually instead of for specific external operations

The fix is to decide the abstraction first. A class should expose operations that make sense for the concept, not merely expose its storage with function syntax.

### Object layout vs access control

Access control changes what code is allowed to name; it does not mean private fields are stored somewhere mystical. A `Rect` object with private `x`, `y`, `w`, and `h` still contains those fields as part of the object. The compiler enforces that only class methods and friends can access them directly.

This matters for reasoning about methods. `area()` can read `w` and `h` because it is a `Rect` method. A standalone function cannot read them unless it uses public methods or has been declared a friend. The object layout exists either way; access rules decide which code is trusted to touch it.

### Constructor design choices

The lecture constructor clamps invalid dimensions:

```cpp
w{w > 0 ? w : 1}
```

That is one policy. Another class might reject invalid arguments instead. The important learning point is not that every rectangle must silently clamp values. The point is that the constructor is where the class takes responsibility for valid creation. If the invariant is "positive width and height," then every constructor must establish it, and every mutating public method must preserve it.

### Reading class code on exams

When shown a class definition, first mark the public interface and private representation. Then ask which code is client code and which code is trusted class code. Many mistakes become obvious from that split:

- client code cannot access private fields
- friends are not methods, but they are trusted for private access
- method definitions outside the class need `ClassName::`
- constructor bodies run after field initialization
- non-const reference getters can leak mutation authority

## Common failure modes

- Treating classes as structs with functions and leaving fields public.
- Adding a default constructor even when no valid default object exists.
- Assigning to `const` fields in the constructor body.
- Assuming MIL order is the written order instead of declaration order.
- Returning non-const references to private fields.
- Writing setters that do not preserve invariants.
- Making I/O operators members and getting operand order wrong.
- Adding getters for every field when the real public need is a behavior.
- Placing `using namespace std;` in a header.

## Exam reasoning patterns

For construction questions:

1. List the available constructors.
2. Match the syntax to a constructor.
3. Check which fields initialize in the MIL.
4. Apply declaration-order initialization.
5. Run the constructor body after initialization.

For invariant questions:

1. State the invariant.
2. Identify every public operation that can affect it.
3. Check whether public fields or reference getters bypass validation.
4. Decide whether a getter/setter or behavior method is the better interface.

For output-operator questions:

1. Desired syntax is `out << obj`.
2. Therefore the left operand must be `std::ostream &`.
3. The operator should be a standalone function.
4. If it needs private access, declare it as a friend.
5. Return the stream by reference and do not force a newline.

## Quick reference

- `this`: pointer to the implicit receiver object.
- Constructor body: runs after fields are initialized.
- MIL: initializes fields before constructor body.
- Initialization order: declaration order.
- `struct`: default public.
- `class`: default private.
- `private`: protect representation and invariants.
- `friend`: non-member function granted private access.
- `ClassName::method`: definition of a method outside the class body.
