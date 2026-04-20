# 05 Command Line Arguments and Multi-dimensional Arrays

## Big Picture

This lecture connects two ideas that look different but share the same memory model:

- command line arguments are an array of strings;
- many 2D arrays in C are represented as arrays of pointers to rows.

Both require you to understand that a pointer does not describe shape by itself. A pointer tells you where some data begins. The program must use conventions, lengths, null terminators, and documentation to know how much data exists and how to interpret it.

The practical outcome is that students should be able to:

- read and validate `argc` and `argv`;
- convert string arguments into numbers when needed;
- reason about `char *argv[]` and `char **argv`;
- allocate, use, and free pointer-based 2D arrays;
- compare pointer-to-pointer matrices with flat 1D matrix storage.

## `argc` and `argv`

A command-line C program usually uses this form of `main`:

```c
int main(int argc, char *argv[]) {
  ...
}
```

or equivalently:

```c
int main(int argc, char **argv) {
  ...
}
```

The parameters mean:

- `argc` is the number of command line arguments.
- `argv` is the argument vector.
- `argv[0]` is the program name or path used to run the program.
- `argv[1]` through `argv[argc - 1]` are the user-provided arguments.
- Each `argv[i]` is a C string, so it is a `char *` pointing to a null-terminated character array.

From `lecture_code/cpl/multiDim/simpleArgs.c`:

```c
int main(int argc, char *argv[]) {
  printf("Received %d arguments\n", argc);
  for (int i = 0; i < argc; ++i) {
    printf("Arg %d: %s\n", i, argv[i]);
  }
}
```

If the executable is run as:

```sh
./prog 12 hello
```

then conceptually:

```text
argc = 3
argv[0] -> "./prog"
argv[1] -> "12"
argv[2] -> "hello"
argv[3] -> NULL
```

The null entry after the last argument is why the lecture also shows walking `argv` without using `argc`.

## Worked Trace: Walking `argv`

From `lecture_code/cpl/multiDim/argvTerminated.c`:

```c
int main(int argc, char **argv) {
  char **s = argv;
  while (*s) {
    printf("Argument %d: %s\n", s - argv, *s);
    ++s;
  }
}
```

Trace for `./prog a b`:

1. `argv` points at `argv[0]`.
2. `s = argv`, so `s` also points at `argv[0]`.
3. `*s` is `argv[0]`, a pointer to `"./prog"`, so the loop runs.
4. `s - argv` is `0`, so it prints argument 0.
5. `++s` moves to `argv[1]`.
6. `*s` is `"a"`, so it prints argument 1.
7. `++s` moves to `argv[2]`.
8. `*s` is `"b"`, so it prints argument 2.
9. `++s` moves to `argv[3]`.
10. `*s` is `NULL`, so the loop stops.

This works because `argv` is conventionally terminated by a null pointer. `argc` is still usually clearer because it gives the length directly.

## Reading `char *argv[]`

The spiral rule reads C declarations from the variable name outward:

```c
char *argv[]
```

Read it as:

```text
argv is an array of pointers to char
```

Each `char *` points to the first character of a string.

As a function parameter, an array declaration decays to a pointer. That is why:

```c
int main(int argc, char *argv[])
```

and:

```c
int main(int argc, char **argv)
```

describe the same parameter shape in practice.

Memory model:

```text
argv
 |
 v
+---------+       +---+---+---+---+----+
| argv[0] | ----> | . | / | p | r | \0 |
+---------+       +---+---+---+---+----+
| argv[1] | ----> | 1 | 2 | \0         |
+---------+       +---+---+----+
| argv[2] | ----> | h | i | \0         |
+---------+       +---+---+----+
| NULL    |
+---------+
```

## Pointers Do Not Encode Shape

The lecture emphasizes this sentence: you cannot know just by looking at a pointer whether it points to one item or the first item in an array.

Examples:

```c
int *p;
char *s;
char **argv;
```

From the type alone:

- `p` might point to one `int`, or to the first element of many `int`s.
- `s` might point to one character, or to a null-terminated string.
- `argv` might point to one `char *`, or to an array of `char *` values.

The missing information comes from convention:

- `argc` tells you how many outer `argv` entries are valid.
- `'\0'` tells you where each string ends.
- A matrix function must document how many rows and columns exist.
- A dynamic array must carry length and capacity separately.

## Converting Command Line Arguments

Command line arguments are text. Arithmetic requires conversion.

From `lecture_code/cpl/multiDim/multInts.c`:

```c
int sToInt(const char *s) {
  int sum = 0;
  int neg = 1;
  if (*s == '-') {
    neg = -1;
    ++s;
  }
  while (*s >= '0' && *s <= '9') {
    sum = sum * 10 + *s - '0';
    ++s;
  }
  return sum * neg;
}
```

Trace `sToInt("-507")`:

1. See `'-'`, set `neg = -1`, move to `'5'`.
2. `sum = 0 * 10 + 5 = 5`.
3. `sum = 5 * 10 + 0 = 50`.
4. `sum = 50 * 10 + 7 = 507`.
5. Return `507 * -1 = -507`.

The same file checks argument count:

```c
if (argc != 3) {
  fprintf(stderr, "Usage: %s int1 int2\n", argv[0]);
  return 1;
}
```

This is a key habit. Before using `argv[1]` or `argv[2]`, prove those entries exist.

For production code, prefer robust conversion such as `strtol` because it can report invalid characters and overflow more carefully than `atoi`.

## Practical Connection: `wc`-Style Flags

`lecture_code/cpl/multiDim/mywc.c` reads optional flags:

```c
int pc = argc == 1 ? 1 : 0;
int pl = argc == 1 ? 1 : 0;
int pw = argc == 1 ? 1 : 0;

for (int i = 1; i < argc; ++i) {
  if (strcmp(argv[i], "-l") == 0) pl = 1;
  if (strcmp(argv[i], "-c") == 0) pc = 1;
  if (strcmp(argv[i], "-w") == 0) pw = 1;
}
```

Reasoning pattern:

- If there are no flags, print all counts.
- If there are flags, print only the requested counts.
- Use `strcmp` because strings in C are compared by content, not by pointer equality.

The same program counts words by detecting transitions from whitespace to non-whitespace:

```c
if (isws(prevChar) && !isws(c)) ++wc;
```

That condition counts the start of each word.

## 2D Arrays as Arrays of Pointers

The lecture introduces `argv` as a first 2D-like structure: an array of strings, where each string is itself an array of characters.

A common heap representation for an integer matrix is:

```c
int **matrix;
```

Meaning:

- `matrix` points to an outer array.
- Each outer element is an `int *`.
- Each `int *` points to one row.
- `matrix[i][j]` first selects row `i`, then element `j` inside that row.

Creating an `n` by `m` identity-like matrix:

```c
int **identity_matrix(size_t n, size_t m) {
  int **matrix = malloc(n * sizeof(int *));
  if (!matrix) return NULL;

  for (size_t i = 0; i < n; ++i) {
    matrix[i] = malloc(m * sizeof(int));
    if (!matrix[i]) {
      for (size_t k = 0; k < i; ++k) {
        free(matrix[k]);
      }
      free(matrix);
      return NULL;
    }

    for (size_t j = 0; j < m; ++j) {
      matrix[i][j] = (i == j) ? 1 : 0;
    }
  }

  return matrix;
}
```

The cleanup on partial failure is not emphasized in the slides, but it is the correct ownership reasoning: every row already allocated must be freed before returning failure.

## Freeing a Pointer-Based 2D Array

This is wrong:

```c
free(matrix); // leaks every row
```

It only frees the outer array of row pointers. After that, the program has lost the addresses of the rows, so it cannot free them.

Correct order:

```c
for (size_t i = 0; i < rows; ++i) {
  free(matrix[i]);
}
free(matrix);
```

Memory reasoning:

1. The outer allocation stores row addresses.
2. Each row allocation stores actual integers.
3. Free rows first while their addresses are still reachable.
4. Free the outer array last.

## Downsides of Double Indirection

An `int **` matrix is flexible, but it has costs:

- Each row is a separate allocation.
- Rows may be scattered across the heap.
- Accessing `matrix[i][j]` requires following two pointers.
- The outer row-pointer array uses extra memory.
- Scattered rows can hurt CPU cache performance.

The layout is also not the same as a true stack array like:

```c
int matrix[3][4];
```

`lecture_code/cpl/multiDim/stackAllocated2D.c` compares sizes and addresses to show that a real 2D stack array is an array of arrays, while the common dynamic representation is an array of pointers.

## Flat 1D Matrix Representation

A matrix can also be stored in one contiguous heap allocation:

```c
int *matrix = malloc(sizeof(int) * rows * cols);
```

Use row-major indexing:

```c
matrix[row * cols + col]
```

From `lecture_code/cpl/multiDim/oneDMatrix.c`:

```c
int getValue(int *mat, int r, int c, int nc) {
  return mat[r * nc + c];
}
```

Trace a 3 by 4 matrix:

```text
row 0: indices 0, 1, 2, 3
row 1: indices 4, 5, 6, 7
row 2: indices 8, 9, 10, 11
```

For `row = 2`, `col = 1`, `cols = 4`:

```text
index = 2 * 4 + 1 = 9
```

Flat representation tradeoffs:

- One allocation and one `free`.
- Better locality for dense matrices.
- No separate row allocations.
- You must carry `cols` everywhere.
- Indexing mistakes are easy if you use rows where columns are needed.

## Common Failure Modes

- Forgetting `argv[0]` is the program name.
- Using `argv[1]` without checking `argc`.
- Treating `"12"` as the integer `12` without conversion.
- Comparing strings with `==` instead of `strcmp`.
- Misreading `char *argv[]` as one string instead of an array of string pointers.
- Assuming a pointer tells you how long an array is.
- Freeing only the outer pointer of a pointer-based matrix.
- Forgetting to free rows before freeing the outer matrix.
- Using `i * rows + j` instead of `i * cols + j` for flat indexing.
- Confusing a true 2D stack array with an `int **`.

## Debugging Checklist

For command-line programs:

1. Print `argc` and each `argv[i]` when confused.
2. Check `argc` before accessing optional arguments.
3. Print a usage message to `stderr` and return nonzero for bad invocation.
4. Use `strcmp` for flags.
5. Use conversion routines carefully and test negative numbers, zero, and invalid text.

For 2D arrays:

1. Draw the outer array and each row allocation separately.
2. Count allocations and frees.
3. Free in reverse ownership order: rows, then outer pointer.
4. For flat matrices, write down `rows`, `cols`, and the index formula.
5. Test non-square matrices, because square matrices can hide row/column mistakes.

## Exam Reasoning Patterns

When analyzing `argv`:

- Start with `argc`.
- Remember user arguments begin at index 1.
- Treat every `argv[i]` as a string.
- Translate `argv[i][j]` as: argument `i`, character `j`.

When analyzing an `int **` matrix:

- `matrix` is the outer pointer.
- `matrix[i]` is the row pointer.
- `matrix[i][j]` is the integer in row `i`, column `j`.
- Free `matrix[i]` for each row before `free(matrix)`.

When analyzing a flat matrix:

- Identify the number of columns.
- Use `row * cols + col`.
- The total allocation size is `rows * cols * sizeof(int)`.

## Quick Reference

- `argc` includes the program name.
- `argv[0]` is the program name/path.
- `argv[i]` is a null-terminated string.
- `char *argv[]` as a parameter behaves like `char **argv`.
- A pointer's type does not reveal array length.
- Pointer-based 2D matrix: allocate outer array, allocate each row, free rows, free outer.
- Flat matrix index: `matrix[i * cols + j]`.
- Use `strcmp(argv[i], "-l") == 0` for flag comparison.

## Exam Questions

- What does `argc` count?
- Why is `argv[0]` special?
- Why are command line arguments strings instead of integers?
- How do you read `char *argv[]` with the spiral rule?
- Why is `char **argv` a valid parameter type for `main`?
- Why does a pointer alone not tell you whether it points to one value or an array?
- Why must the rows of a pointer-based matrix be freed before the outer array?
- What is the index formula for a row-major flat matrix?
- Why should you test matrix code with non-square dimensions?
- What is the difference between `int matrix[3][4]` and `int **matrix`?
