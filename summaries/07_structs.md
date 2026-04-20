# 07 Structs and Building an ADT

## Big Picture

Structs let C group related values into one named aggregate type. That matters because real program data is usually not a single scalar. A rectangle has position and size. A dynamic array has a pointer, length, and capacity. A linked list has a head pointer and a length.

This lecture uses structs in two stages:

- group related fields so functions have clearer interfaces;
- build an abstract data type (ADT), where users rely on operations instead of manipulating representation details directly.

Structs do not make C object-oriented. They do not have constructors or methods. They are a named memory layout plus field access syntax. The design discipline comes from how you use them.

## Struct Basics

General form:

```c
struct Rect {
  int x, y, w, h;
};
```

Important syntax:

- The semicolon after the closing brace is required.
- The type name is `struct Rect`, not just `Rect`, unless you use `typedef`.
- Use `.` when you have a struct value.
- Use `->` when you have a pointer to a struct.

Example:

```c
struct Rect r;
r.x = 5;
r.y = 10;
r.w = 3;
r.h = 2;
```

## Why Structs Matter

The lecture begins with rectangle collision. Without structs, a collision function might take many integer parameters:

```c
int collides(int h1, int w1, int x1, int y1,
             int h2, int w2, int x2, int y2);
```

This is fragile because many parameters have the same type. Passing width where height belongs still compiles.

With structs:

```c
int collides(struct Rect r1, struct Rect r2);
```

The interface now says what the data means. A rectangle travels as one value instead of four unrelated integers.

From `lecture_code/cpl/aggregate/rect.c`:

```c
struct Rect {
  int x, y, w, h;
  char c;
};

int collides(struct Rect r1, struct Rect r2) {
  return (r1.x < r2.x + r2.w &&
          r1.x + r1.w > r2.x &&
          r1.y < r2.y + r2.h &&
          r1.y + r1.h > r2.y);
}
```

The collision test says the rectangles overlap when neither rectangle is completely to one side of the other.

## Worked Trace: Rectangle Collision

Let:

```text
r1: x=1, y=2, w=3, h=2
r2: x=3, y=3, w=2, h=2
```

Then:

```text
r1.x < r2.x + r2.w      1 < 5   true
r1.x + r1.w > r2.x      4 > 3   true
r1.y < r2.y + r2.h      2 < 5   true
r1.y + r1.h > r2.y      4 > 3   true
```

All four conditions are true, so the rectangles collide.

If one condition is false, there is separation on that axis and the rectangles do not overlap.

## Struct Values Are Copied

Unlike arrays, structs are copied when passed by value.

This function does not mutate the caller's rectangle:

```c
void translate(struct Rect r, int x, int y) {
  r.x = r.x + x;
  r.y = r.y + y;
}
```

Caller:

```c
struct Rect r1 = {.x = 1, .y = 5, .h = 1, .w = 1};
translate(r1, 3, -2);
printf("Rect at (%d, %d)\n", r1.x, r1.y);
```

Trace:

1. `main` has `r1`.
2. `translate` receives a copy named `r`.
3. `translate` changes the copy's fields.
4. `translate` returns and its stack frame disappears.
5. `main`'s `r1` is unchanged.

To mutate the caller's rectangle, pass a pointer:

```c
void translate(struct Rect *r, int xt, int yt) {
  r->x += xt;
  r->y += yt;
}
```

Caller:

```c
translate(&r1, 3, -2);
```

Now `r` stores the address of `r1`, and `r->x` writes into the caller's object.

## Dot and Arrow

Use dot for a struct value:

```c
struct Rect r;
r.x = 10;
```

Use arrow for a pointer to a struct:

```c
struct Rect *p = &r;
p->x = 10;
```

The arrow operator is shorthand:

```c
p->x
```

means:

```c
(*p).x
```

Parentheses are required in `(*p).x` because `.` binds more tightly than `*`. Writing `*p.x` means `*(p.x)`, which is wrong when `p` is a pointer.

## Passing Structs: Value, Pointer, and `const`

Choose the parameter style based on intent:

```c
int collides(struct Rect r1, struct Rect r2);
```

Good when the struct is small and the function only needs copies.

```c
void translate(struct Rect *r, int dx, int dy);
```

Good when the function should mutate the original object.

```c
int area(const struct Rect *r);
```

Good when the struct may be large and the function should inspect without mutating.

The `const` tells both the compiler and reader that the function should not change the object through that pointer.

## Struct Memory Layout and Padding

Struct fields are laid out in declaration order, but the compiler may insert padding bytes for alignment.

From `lecture_code/cpl/aggregate/structSizes.c`:

```c
struct T {
  int x, y;
  char a;
  int z;
  char b, c, d;
};

struct Q {
  int x, y;
  char a, b, c, d;
  int z;
};
```

Both structs contain similar fields, but their sizes can differ because field order changes where padding is needed.

Reasoning example:

- `int` often wants 4-byte alignment.
- `char` uses 1 byte.
- If a `char` is followed by an `int`, the compiler may add padding before the `int`.
- Grouping several `char` fields together can reduce padding.

Do not write code that assumes a struct's size is the sum of field sizes. Use `sizeof`.

## Structs for Dynamic Array State

The previous lecture's dynamic array required several parameters:

```c
append(&arr, &len, &cap, value);
```

Those variables are not independent. They are all parts of one dynamic array.

A struct can bundle them:

```c
struct IntArray {
  int *data;
  size_t len;
  size_t cap;
};
```

Then functions can take one object:

```c
void append(struct IntArray *a, int value) {
  if (a->len == a->cap) {
    size_t newCap = a->cap * 2;
    int *newData = malloc(sizeof(int) * newCap);
    for (size_t i = 0; i < a->len; ++i) {
      newData[i] = a->data[i];
    }
    free(a->data);
    a->data = newData;
    a->cap = newCap;
  }

  a->data[a->len] = value;
  ++a->len;
}
```

Benefits:

- The related state travels together.
- The function signature is smaller.
- It is harder to update `len` and forget which `cap` it belongs to.
- The code prepares students for ADTs.

## Abstract Data Types

An abstract data type is defined by behavior, not by representation.

A list user should know operations such as:

- create an empty list;
- add an item;
- remove an item;
- access an item;
- mutate an item;
- get length;
- delete the list.

The user should not need to know whether the list is implemented with:

- a linked list;
- a dynamic array;
- a tree;
- something else.

The representation should be hidden behind a stable interface. This makes code safer and more reusable.

## Linked List Representation

The lecture implements a list with nodes:

```c
struct Node {
  int data;
  struct Node *next;
};

struct List {
  struct Node *head;
  size_t len;
};
```

Invariants:

- `head` points to the first node, or is `NULL` for an empty list.
- Each node's `next` points to the next valid node, or `NULL` at the end.
- `len` equals the number of nodes reachable from `head`.
- Every node is heap allocated and eventually freed exactly once.

These invariants are what the ADT functions must preserve.

## Creating and Adding to a List

From the slides:

```c
struct List *createList() {
  struct List *ret = malloc(sizeof(struct List));
  ret->head = NULL;
  ret->len = 0;
  return ret;
}
```

From the ADT lecture code, the add-to-front operation is called `cons`:

```c
void cons(int elem, struct List *l) {
  struct Node *nn = malloc(sizeof(struct Node));
  nn->next = l->head;
  nn->data = elem;
  l->head = nn;
  l->len++;
}
```

Trace starting from empty list:

```text
head = NULL, len = 0
```

Call `cons(3, l)`:

```text
new node: data=3, next=NULL
head -> 3
len = 1
```

Call `cons(2, l)`:

```text
new node: data=2, next=old head
head -> 2 -> 3
len = 2
```

Call `cons(1, l)`:

```text
head -> 1 -> 2 -> 3
len = 3
```

Because insertion is at the front, values appear in reverse order of insertion.

## Access and Mutation by Index

Linked lists do not support constant-time indexing. To read index `i`, the program walks from the head:

```c
int ith(struct List *l, int i) {
  assert(i < length(l));
  struct Node *cur = l->head;
  for (int j = 0; cur && j < i; ++j, cur = cur->next);
  return cur->data;
}
```

Trace `ith(l, 2)` for `head -> 17 -> 32 -> 7`:

1. `cur` starts at 17, `j = 0`.
2. Move once: `cur` points to 32, `j = 1`.
3. Move again: `cur` points to 7, `j = 2`.
4. Return 7.

The work grows with the index, so `ith` is `O(n)` in the worst case.

Mutation is the same traversal plus an assignment:

```c
void setIth(struct List *l, int i, int elem) {
  assert(i < length(l));
  struct Node *cur = l->head;
  for (int j = 0; cur && j < i; ++j, cur = cur->next);
  cur->data = elem;
}
```

## Removing a Node

To remove a node, the list must be rewired before the removed node is freed.

For:

```text
head -> 17 -> 32 -> 7 -> NULL
```

Removing index 1:

1. `prev` points to 17.
2. `cur` points to 32.
3. Set `prev->next = cur->next`, so 17 points to 7.
4. Free `cur`.
5. Decrement `len`.

Result:

```text
head -> 17 -> 7 -> NULL
```

Special case: removing index 0 must update `head`.

```c
struct Node *tmp = l->head;
l->head = l->head->next;
free(tmp);
--l->len;
```

If you free the node before saving or using its `next`, you cannot safely access `node->next` afterward.

## Freeing a Linked List

A list has multiple heap allocations:

- one `struct List`;
- one `struct Node` per element.

Every allocation must be freed. From the slides:

```c
void deleteNode(struct Node *n) {
  if (!n) return;
  deleteNode(n->next);
  free(n);
}

void deleteList(struct List *l) {
  if (!l) return;
  deleteNode(l->head);
  free(l);
}
```

The recursive version frees the rest of the list before freeing the current node. That is safe because it reads `n->next` before `n` is freed.

Iterative version:

```c
void deleteNodes(struct Node *cur) {
  while (cur) {
    struct Node *next = cur->next;
    free(cur);
    cur = next;
  }
}
```

The key step is saving `next` before freeing `cur`.

## Why Exposing Internals Is Dangerous

The slides show that if clients can directly create `struct Node` and `struct List`, they can build invalid structures. For example, client code can create a cycle or point list nodes at stack variables.

Broken example from the idea in the slides:

```c
struct List l;
struct Node n1;
struct Node n2;
n1.next = &n2;
n2.next = &n1;
l.head = &n1;
```

Problems:

- Nodes are on the stack, but list deletion may call `free` on them.
- The cycle means traversal may never terminate.
- The `len` field may not match the actual structure.
- Client code can violate invariants the ADT functions depend on.

This is why a real ADT hides its representation and exposes only functions.

The next course topic, separate compilation and headers, gives C tools for this: put declarations in a header and implementation details in a `.c` file.

## Common Failure Modes

- Forgetting the semicolon after a struct definition.
- Writing `Rect r;` instead of `struct Rect r;` without a typedef.
- Passing a struct by value and expecting mutation in the caller.
- Using `.` on a pointer or `->` on a value.
- Forgetting that `p->x` means `(*p).x`.
- Assuming struct size equals the sum of field sizes.
- Forgetting to initialize every field.
- Letting `len` disagree with the actual number of linked-list nodes.
- Removing a node without freeing it.
- Freeing a node and then reading `node->next`.
- Exposing nodes so clients can corrupt the list.
- Expecting linked-list indexing to be constant time.

## Debugging Struct and ADT Code

For struct bugs:

1. Check whether the function received a copy or a pointer.
2. Use `.` for values and `->` for pointers.
3. Print relevant fields before and after a function call.
4. Use `sizeof` instead of guessing layout.

For linked-list bugs:

1. Draw the list before and after each operation.
2. Check `head`, every `next`, and `len`.
3. For removal, identify `prev`, `cur`, and `cur->next`.
4. Save `next` before freeing a node.
5. Check empty-list and single-element-list cases.
6. Run memory tools to catch leaks and invalid frees.

## Exam Reasoning Patterns

When asked whether a function mutates a struct:

- If parameter type is `struct Rect r`, it mutates only a copy.
- If parameter type is `struct Rect *r`, it can mutate the caller's object.
- If parameter type is `const struct Rect *r`, it should inspect only.

When asked about `->`:

- Rewrite `p->field` as `(*p).field`.
- Then reason from the dereferenced struct value.

When asked about linked-list operations:

1. Draw nodes as boxes.
2. Label `head`, `prev`, `cur`, and `next`.
3. Update links before freeing removed nodes.
4. Update `len`.
5. Check whether index 0 needs special handling.

When asked about ADTs:

- Focus on behavior and invariants.
- Explain why clients should not depend on representation.
- Mention that hiding internals allows the implementation to change without changing client code.

## Quick Reference

- `struct Name { ... };` defines a struct type.
- `struct Name x;` declares a struct value.
- `x.field` accesses a field on a value.
- `p->field` accesses a field through a pointer.
- `p->field` is shorthand for `(*p).field`.
- Structs are copied by value.
- Pass a pointer to mutate the caller's struct or avoid a large copy.
- Padding can make `sizeof(struct X)` larger than the sum of fields.
- Linked-list indexed access is `O(n)`.
- An ADT exposes operations and hides representation.

## Exam Questions

- Why is a struct better than passing many separate parameters?
- What does `r->x` mean in terms of `(*r).x`?
- Why did `translate` fail before it took a pointer?
- Why can struct size be larger than the sum of its fields?
- What is the difference between `.` and `->`?
- Why is a linked list `ith` operation `O(n)`?
- Why should an ADT hide its `Node` and `List` internals?
- In what order should a linked list be freed?
- Why does removing the first linked-list node need special handling?
- What invariant connects a list's `len` field to its node chain?
