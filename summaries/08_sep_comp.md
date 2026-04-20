# Separate Compilation and Headers

## What this deck is really about

Separate compilation is how a real C or C++ program stops being one giant file. Each source file is compiled as its own translation unit, headers describe the interfaces between those units, and the linker later combines object files into one executable.

The central skill is diagnosing what information is needed at each stage:

- The preprocessor needs file names, macro names, and conditional compilation directives.
- The compiler needs declarations and enough type information to check each translation unit.
- The assembler produces object code.
- The linker needs one definition for every referenced function or global object and one program entry point, `main`.

This is why the lecture spends so much time on the difference between declarations and definitions. A declaration says "this exists and has this type." A definition supplies the body, storage, or complete representation.

## Build pipeline

The command `gcc file.c` hides several stages:

1. Preprocessing: handles directives such as `#include`, `#define`, `#ifdef`, and `#ifndef`.
2. Compilation: translates preprocessed C into assembly.
3. Assembly: translates assembly into a binary object file.
4. Linking: combines object files and libraries into an executable.

`gcc -c printArray.c` stops after producing `printArray.o`. That object file can contain compiled functions even though it cannot run by itself. Running `gcc printArray.c` tries to link an executable, and that fails if there is no `main`.

### Compile error vs linker error

Use this exam pattern:

- If one `.c` or `.cc` file cannot be understood on its own, it is a compiler problem.
- If all files compile but the final program cannot be assembled, it is a linker problem.

Examples:

```c
/* main.c */
int main() {
  int a[] = {1, 2, 3};
  printArray(a, 3, '\n');
}
```

Without a declaration for `printArray`, the compiler sees a call to an unknown function. In modern settings this is a compile failure or at least a serious warning. Add the declaration:

```c
void printArray(int *arr, int len, char end);
```

Now `main.c` can compile to `main.o`. But if the link command is only `gcc main.o -o prog`, the linker still fails because it cannot find the definition of `printArray`. The correct final link includes both object files:

```bash
gcc -c printArray.c
gcc -c main.c
gcc main.o printArray.o -o builtProgram
```

## Declarations and definitions

These are declarations:

```c
void printArray(int *arr, int len, char end);
struct List;
extern int globalCount;
```

These are definitions:

```c
void printArray(int *arr, int len, char end) {
  /* function body */
}

struct Node {
  int data;
  struct Node *next;
};

int globalCount = 0;
```

A function declaration can appear in many translation units. A function definition should appear once in the linked program. Multiple compatible declarations give the compiler type information. Multiple definitions create duplicate-symbol problems at link time.

## Preprocessor directives

Preprocessor directives are not ordinary C statements. They run before the compiler sees the program.

`#include` literally copies another file's text into the current file:

- `#include <stdio.h>` searches compiler/system include paths.
- `#include "list.h"` searches project-oriented include paths first.

`#define` creates preprocessor names:

```c
#define MAX_SIZE 1000
#define DEBUG
```

Compiler flags can define names too:

```bash
gcc -DDEBUG debug.c
gcc -DPREX=5 define.c
```

`#ifdef DEBUG` includes a block only when `DEBUG` is defined. `#ifndef DEBUG` includes a block only when it is not defined. The important point is that omitted code is not merely skipped at runtime; it is absent from the text the compiler receives.

### Practical debugging use

```c
#ifdef DEBUG
printf("i=%d len=%d\n", i, len);
#endif
```

Compiled normally, the debugging print statements are not in the program. Compiled with `-DDEBUG`, they are included. This is useful for lecture-sized debugging, though production systems usually use more structured logging.

## Headers as contracts

A header should contain the public interface of a module:

- type declarations clients need
- function declarations clients may call
- constants or macros intentionally exposed
- comments describing required behavior

A `.c` file should contain implementation details:

- private helper functions
- private struct layouts
- algorithms
- memory-management details

The header is a promise to client code. The implementation is allowed to change as long as that promise remains true.

## Lecture code: `printArray`

`lecture_code/cpl/sep_comp/printarray/printArray.c` defines:

```c
char defaultEnd = '\n';

void printArray(int *arr, int len, char end) {
  if (len == 0) {
    printf("[]");
    return;
  }
  printf("[%d", arr[0]);
  for (int i = 1; i < len; ++i) {
    printf(", %d", arr[i]);
  }
  printf("]");
  if (end) {
    printf("%c", end);
  }
}
```

The client file does not need the body to type-check a call. It needs the declaration. The linker needs the object file containing the body.

Exam reasoning:

- `gcc -c printArray.c` succeeds because no executable is being produced.
- `gcc printArray.c` fails at link time because there is no `main`.
- `gcc -c main.c` needs a declaration of `printArray`.
- `gcc main.o printArray.o -o prog` gives the linker both compiled pieces.

## Lecture code: opaque `List`

`lecture_code/cpl/sep_comp/list/list.h` exposes only:

```c
struct List;

int length(struct List *);
struct List *empty();
struct List *cons(int, struct List *);
void printList(struct List *);
int ith(struct List *, int);
void setIth(struct List *l, int index, int elem);
void removeIth(struct List *l, int i);
struct List *freeList(struct List *l);
int findElem(struct List *l, int elem);
```

The implementation file defines the representation:

```c
struct Node {
  int data;
  struct Node *next;
};

struct List {
  struct Node *head;
  int len;
};
```

This split is the ADT boundary. Client code can hold `struct List *` and call functions. It cannot inspect `head`, change `len`, create fake nodes, or form a cyclic structure that breaks `freeList`.

### Why incomplete types work

`struct List;` tells the compiler that `struct List` is a type. The compiler does not know its size or fields.

This is enough:

```c
struct List *l = empty();
```

The compiler knows the size of a pointer.

This is not enough:

```c
struct List l;
```

The compiler must allocate a full `struct List` on the stack, but the header does not say how large it is. The lecture error is "storage size of 'l' isn't known."

### Invariants hidden by the header

The list implementation relies on invariants:

- `l->head` is either `NULL` or points to a valid heap-allocated node.
- Every node's `next` is either `NULL` or another valid heap-allocated node.
- The node chain is acyclic.
- `l->len` matches the number of nodes.
- Client code frees the list through `freeList`, not by guessing its internals.

If clients could write `l->head` directly, they could put stack addresses into the list, create cycles, or make `len` lie. Hiding the struct is not decoration; it protects correctness.

## Stack allocation and the PIMPL variant

The fully opaque header prevents stack allocation of `struct List`. The PIMPL variant in `lecture_code/cpl/sep_comp/pimpl/list.h` exposes:

```c
struct listImpl;
struct List {
  struct listImpl *pimpl;
};
```

Now the compiler knows the size of `struct List`: it contains one pointer. Clients can write:

```c
struct List l;
initList(&l);
```

The implementation details remain hidden in `struct listImpl`. The linked-list implementation and array-backed implementation can both satisfy the same public interface by changing only the `.c` file and relinking.

Tradeoff:

- Fully opaque `struct List;`: strongest hiding, client must receive a pointer from constructor-like functions.
- PIMPL `struct List { struct listImpl *pimpl; }`: stack-friendly public object, representation still hidden behind an implementation pointer.
- Public `struct Point { int x; int y; };`: appropriate when field access is the abstraction.

## Worked build example

Suppose the files are:

```c
/* list.h */
struct List;
struct List *empty();
struct List *cons(int, struct List *);
void printList(struct List *);
struct List *freeList(struct List *);
```

```c
/* main.c */
#include "list.h"

int main() {
  struct List *l = empty();
  cons(3, l);
  printList(l);
  l = freeList(l);
}
```

Correct build:

```bash
gcc -c list.c
gcc -c main.c
gcc main.o list.o -o listprog
```

Reasoning:

- `main.c` compiles because `list.h` declares the functions and the incomplete type.
- `list.c` compiles because it includes both the header and the private definitions.
- The final link succeeds only if `list.o` is included.

Wrong build:

```bash
gcc main.o -o listprog
```

Likely error: undefined references to `empty`, `cons`, `printList`, and `freeList`.

## Header design checklist

Before putting something in a header, ask:

- Does client code need this name to compile?
- Is this part of the abstraction's public contract?
- Would exposing this make it harder to change the implementation later?
- Could a client break invariants if they see or write this field?

Keep in the header:

- public function declarations
- intentionally public struct definitions
- incomplete type declarations for opaque ADTs

Keep out of the header:

- private helper functions such as `freeNode`
- private node structures
- implementation-specific fields
- global variables unless they are deliberately part of the interface

## Deeper command and interface traces

### Trace: from source files to a working executable

Suppose a small program uses the lecture's print-array module:

```text
main.c          calls printArray
printArray.c    defines printArray
```

The clean build is:

```bash
gcc -c lecture_code/cpl/sep_comp/printarray/printArray.c
gcc -c main.c
gcc main.o printArray.o -o builtProgram
```

The first command produces an object file that provides the symbol `printArray`. It does not need `main`, because `-c` says "compile only." The second command produces an object file that provides `main` and contains an unresolved reference to `printArray`. The third command invokes the linker. The linker sees that `main.o` needs `printArray`, sees that `printArray.o` provides it, and connects the reference.

Now compare common wrong builds:

```bash
gcc lecture_code/cpl/sep_comp/printarray/printArray.c
```

This asks for an executable from a source file with no `main`. The compiler can translate the function body, but the linker cannot find the program entry point.

```bash
gcc -c main.c
gcc main.o -o builtProgram
```

This compiles the client but omits the implementation object at link time. The likely failure is an undefined reference to `printArray`. The declaration was enough for compilation; it was not enough for linking.

### Trace: a header is not an implementation

For `lecture_code/cpl/sep_comp/list/`, the client includes:

```c
#include "list.h"
```

That copies declarations such as:

```c
struct List;
struct List *empty();
struct List *cons(int, struct List *);
```

into the client's translation unit. It does not copy `list.c`. It does not compile `list.c`. It does not link `list.o`.

The client can compile because the compiler knows:

- `struct List` is a type
- pointers to `struct List` are valid
- `empty` returns `struct List *`
- `cons` takes an `int` and a `struct List *`

The final executable still needs:

```bash
gcc main.o list.o -o listprog
```

If `list.o` is missing, the linker has promises but no definitions.

### Object files as symbol tables

An object file is not just machine instructions. It also contains symbol information. A useful mental model is:

```text
main.o
  provides: main
  needs: empty, cons, printList, freeList

list.o
  provides: empty, cons, printList, freeList, length, ith, ...
  needs: malloc, free, printf, assert support
```

The linker merges these tables. When every needed symbol has exactly one suitable definition, the executable can be produced. If a needed symbol has no definition, you get an undefined reference. If two object files define the same global function or variable, you can get a multiple-definition error.

### Why opaque types are a teaching point, not a trick

The list header uses:

```c
struct List;
```

This is enough to let the client hold `struct List *`, because all object pointers have known pointer size. It is not enough to create `struct List l;`, because allocating a full object requires knowing its field layout and total size.

That limitation is intentional. It forces clients through functions such as `empty`, `cons`, and `freeList`. The implementation in `lecture_code/cpl/sep_comp/list/list.c` can maintain invariants about heap-owned nodes, acyclic `next` links, and correct `len`.

### PIMPL and replaceable implementations

The PIMPL version in `lecture_code/cpl/sep_comp/pimpl/` exposes a small wrapper:

```c
struct listImpl;
struct List {
  struct listImpl *pimpl;
};
```

Now a client can put the wrapper on the stack because its size is known: one pointer. The real representation remains hidden. One implementation stores linked nodes. Another stores a growing array and maps list index `i` to array index `len - 1 - i`. The same public operations can be implemented with different private invariants.

This is the deeper reason headers matter. A good header lets client code depend on behavior instead of storage decisions. A poor header exposes storage decisions and makes every client sensitive to implementation changes.

### Exam diagnostic checklist

When given a build problem, answer in this order:

1. Which command failed?
2. Was `-c` used, or was an executable being linked?
3. Did the source file have declarations for names it used?
4. Did the final link include object files for all definitions?
5. Is the error about syntax/type/size, or about missing/duplicate symbols?

This usually identifies whether the fix is "include the right header," "add a forward declaration," "compile another source file," or "include another object file in the link command."

## Common failure modes

- Missing declaration: compiler cannot type-check the call.
- Missing object file at link time: linker reports undefined reference.
- Function declared with one signature and defined with another: compiler or linker confusion, depending on language and name mangling.
- Function defined in a header included by multiple `.c` files: duplicate definitions at link time.
- Trying to allocate an incomplete type directly: compiler error because size is unknown.
- Exposing internal fields: client code can break invariants and make later implementation changes harder.
- Thinking `#include` links code: it does not. It only copies text before compilation.

## Exam reasoning patterns

When shown an error, identify the stage:

- "implicit declaration", "unknown type", "storage size is not known": compile-time translation unit problem.
- "undefined reference to `main`": link-time executable problem.
- "undefined reference to `foo`": declaration was probably visible, but the object file or library containing `foo` was not linked.
- "multiple definition of `foo`": a definition appears in more than one linked object file.

When shown a header, decide whether it is an interface or an implementation leak:

- `struct List;` supports pointers and hides representation.
- `struct List { struct Node *head; int len; };` exposes representation.
- `struct Point { int x; int y; };` may be fine if points are just data.

When asked whether stack allocation is allowed:

- Complete type visible: yes.
- Only incomplete declaration visible: no.
- PIMPL wrapper visible: wrapper can be on stack, implementation is still heap allocated.

## Quick reference

- Declaration: promises a name and type.
- Definition: provides body, storage, or full layout.
- Translation unit: one source file after preprocessing.
- Object file: compiled output before final linking.
- Linker: resolves references across object files.
- Header: public interface copied into clients by `#include`.
- Incomplete type: known to exist, but size and fields are hidden.
- Opaque ADT: clients manipulate values only through interface functions.
