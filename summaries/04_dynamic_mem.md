# 04 Dynamic Memory

## Big Picture

Dynamic memory is the tool C gives you when the amount of data, or the lifetime of that data, cannot be handled cleanly by the stack. A stack array is useful when the size is fixed and the array only needs to live inside the current function call. The heap is useful when the size is discovered at runtime, when the data must survive after a function returns, or when the program needs to grow storage as input arrives.

The tradeoff is responsibility. Stack memory is automatically reclaimed when a function returns. Heap memory is controlled by the programmer: allocate it with `malloc`, use it through a pointer, and release it with `free` exactly once when the program is finished with it.

This lecture builds two major habits:

- When you use heap memory, always know who owns it and who must free it.
- When an array can grow, resize by allocating a larger block, copying the old values, freeing the old block, and updating the active pointer and capacity.

## Core Vocabulary

- **Stack:** automatic storage tied to function calls and local scopes.
- **Heap:** programmer-managed storage whose lifetime lasts until `free`.
- **Lifetime:** the period during which an object is valid to access.
- **Owner:** the part of the program responsible for eventually freeing heap memory.
- **Dangling pointer:** a pointer that stores the address of memory that is no longer valid.
- **Memory leak:** heap memory that was allocated but can no longer be reached and therefore cannot be freed.
- **Capacity:** how many elements an allocated array can hold.
- **Length:** how many elements are currently meaningful.

## Stack, Heap, and Lifetime

The slide memory diagram divides program memory into text, data, heap, unallocated space, and stack. The important distinction for this course is lifetime:

- Global/static data lives for the whole program.
- Stack data lives until the current function call or scope ends.
- Heap data lives until the programmer calls `free`.

Example of invalid lifetime:

```c
int *multiples(int n) {
  int arr[4];
  for (int i = 0; i < 4; ++i) {
    arr[i] = (i + 1) * n;
  }
  return arr; // wrong: arr dies when multiples returns
}
```

`arr` is a local stack array. Returning `arr` returns a pointer to the first element, but those elements stop being valid when the function returns. The pointer value may still look like an address, but dereferencing it is undefined behavior.

The lecture code `lecture_code/cpl/dynamic/lifetimes/badMultiples.c` makes this visible by calling the bad function more than once. The later function call reuses stack space, so earlier pointers may appear to change underneath you. With one compiler you may see a crash; with another you may see overwritten values. Both outcomes come from the same bug: the program used a pointer after the pointed-to object died.

## `malloc` and `free`

`malloc` asks the heap for a number of contiguous bytes:

```c
int *p = malloc(sizeof(int) * 1);
int *arr = malloc(sizeof(int) * 10);
```

Important rules:

- `malloc` returns a pointer to the first byte of the allocation.
- The result is usually assigned to a pointer of the appropriate type.
- The memory is uninitialized. Reading it before writing it is undefined behavior.
- `malloc` can fail and return `NULL`.
- Every successful allocation should eventually be released with `free`.

The lecture code `lecture_code/cpl/dynamic/growingArray/simpleMalloc.c` shows all of these points:

```c
int *p = malloc(sizeof(int) * 1);
if (!p) {
  fprintf(stderr, "Malloc failed... I simply can't continue");
  return 1;
}

int *arr = malloc(sizeof(int) * 10);
if (!arr) {
  fprintf(stderr, "Malloc failed... I simply can't continue");
}
```

After the program writes valid values, it frees both allocations:

```c
free(p);
p = NULL;

free(arr);
arr = NULL;
```

Setting a pointer to `NULL` after `free` is defensive. It does not fix aliases. If two pointers point to the same heap block and one is set to `NULL`, the other still dangles after `free`.

## Worked Memory Trace: Simple Heap Allocation

Suppose this code runs:

```c
int *p = malloc(sizeof(int));
int *arr = malloc(sizeof(int) * 3);
*p = 13;
arr[0] = -1;
arr[1] = -2;
arr[2] = -3;
```

Trace the memory:

1. `p` is a local variable on the stack. Its value is a heap address.
2. `arr` is also a local stack variable. Its value is another heap address.
3. `*p = 13` writes into the heap block that `p` points at.
4. `arr[1] = -2` means `*(arr + 1) = -2`, so it writes into the second `int` slot of the heap block.
5. `free(p)` releases the one-int block. After that, `p` should not be dereferenced.
6. `free(arr)` releases the three-int block. After that, none of `arr[0]`, `arr[1]`, or `arr[2]` is valid.

The pointer variables themselves are still ordinary stack variables. `free` does not delete the pointer variable; it releases the heap block whose address was stored in that pointer.

## The Fixed-Size Array Problem

The motivating example is a program that reads all integers from standard input and prints them in sorted order. A stack array such as:

```c
const int size = 1000;
int arr[size];
```

is not enough because the program does not know how many integers the user will type. Moving the same fixed capacity to the heap:

```c
int cap = 16;
int *arr = malloc(sizeof(int) * cap);
```

does not solve the whole problem either. It only moves the fixed-size array from stack to heap. The real benefit of the heap is that the program can allocate a new, larger block when the old block fills up.

## Growing an Array Safely

The resize pattern is:

1. Allocate a larger array.
2. Copy existing elements into the larger array.
3. Free the old array.
4. Update the active pointer and capacity.

From the lecture code:

```c
if (cap == len) {
  int *newArr = malloc(sizeof(int) * (cap * 2));
  for (int i = 0; i < len; ++i) {
    newArr[i] = arr[i];
  }
  free(arr);
  arr = newArr;
  cap = cap * 2;
}
```

The order matters:

- If you free `arr` before copying, the old values are gone.
- If you allocate `newArr` but forget `arr = newArr`, the new block is leaked.
- If you update `arr` before saving the old pointer or freeing it, the old block may be leaked.
- If `malloc` fails and you immediately overwrite `arr`, you lose the only pointer to the old valid data.

A more defensive resize in real code often uses a temporary pointer and checks for failure before changing the active state.

## Worked Trace: Inserting Into a Sorted Dynamic Array

The lecture `insert` function assumes there is already enough capacity:

```c
int insert(int *arr, const int len, const int cap, const int nv) {
  if (cap <= len) return 0;
  int i = 0;
  for (; i < len && arr[i] < nv; ++i);
  for (int j = len; j > i; --j) {
    arr[j] = arr[j - 1];
  }
  arr[i] = nv;
  return 1;
}
```

Trace `arr = [2, 5, 9, _, _]`, `len = 3`, `cap = 5`, `nv = 6`:

1. Find insertion index: `2 < 6`, `5 < 6`, `9 < 6` is false, so `i = 2`.
2. Shift from the back: `j = 3`, assign `arr[3] = arr[2]`, producing `[2, 5, 9, 9, _]`.
3. Stop because `j > i` is false after decrement.
4. Write `arr[2] = 6`, producing `[2, 5, 6, 9, _]`.
5. The caller must then increase `len`.

Notice that `insert` cannot know whether the caller increased `len` unless the interface is designed to mutate `len`. That issue becomes central in the next lecture.

## Why Growing by One Is Slow

Growing by one element each time is memory efficient but time inefficient. If the array starts with capacity 1 and eventually stores `n` integers, the copies are:

```text
1 + 2 + 3 + ... + (n - 1) = n(n - 1) / 2
```

That grows on the order of `n^2`.

Example for 6 inserted values:

```text
capacity 1 -> 2: copy 1
capacity 2 -> 3: copy 2
capacity 3 -> 4: copy 3
capacity 4 -> 5: copy 4
capacity 5 -> 6: copy 5
total copies = 15
```

For 100000 values, growing by one would require billions of copied integers.

## Why Doubling Works

Doubling capacity trades a bounded amount of extra memory for much better time behavior.

Example starting capacity 4:

```text
append values 1-4: no resize
append value 5: copy 4, capacity becomes 8
append values 6-8: no resize
append value 9: copy 8, capacity becomes 16
append values 10-16: no resize
append value 17: copy 16, capacity becomes 32
```

Most appends cost one write. Only occasional appends pay for copying. Spread across all appends, the average cost stays constant, so append is **amortized O(1)**.

The unused capacity is bounded. Right after doubling, the capacity is at most about twice the number of stored items. That is usually a good tradeoff unless memory is extremely constrained.

## Returning Pointers Correctly

A function can return a pointer only if the pointed-to data outlives the function call. Common valid cases:

1. Return a pointer into caller-provided data.
2. Return a pointer to heap data that has not been freed.
3. Return a pointer to global or static data.

Example returning caller-owned data:

```c
char *my_strchr(char *s, int c) {
  for (; *s != '\0'; ++s) {
    if (*s == c) return s;
  }
  return NULL;
}
```

This is valid because the returned pointer points inside the string passed by the caller. The function did not create that storage, so it also should not free it.

Example returning heap data:

```c
int *multiples(int m, size_t size) {
  int *ret = malloc(sizeof(int) * size);
  if (!ret) return NULL;
  for (size_t i = 0; i < size; ++i) {
    ret[i] = (int)i * m;
  }
  return ret;
}
```

The caller owns the returned array:

```c
int *fives = multiples(5, 10);
if (!fives) {
  return 1;
}
for (size_t i = 0; i < 10; ++i) {
  printf("%d ", fives[i]);
}
free(fives);
```

## Practical Connection: `digits`

`lecture_code/cpl/dynamic/digits.c` returns a heap array:

```c
int *digits(int x) {
  int digits = flooredLog(x, 10);
  int *ret = malloc(sizeof(int) * digits);
  for (unsigned int i = digits - 1; i > 0; --i, x = x / 10) {
    ret[i] = x % 10;
  }
  ret[0] = x;
  return ret;
}
```

Learning points:

- `ret` is heap allocated, so returning it is valid.
- The caller must know how many elements were returned. In this code, the caller recomputes `flooredLog(x, 10)`.
- The caller must free `digs`.
- A stronger interface might return the length through an output parameter or use a struct with pointer plus length.

Trace `digits(72519)`:

1. `flooredLog(72519, 10)` returns `5`.
2. Allocate space for 5 integers.
3. `i = 4`: store `72519 % 10 = 9`; update `x = 7251`.
4. `i = 3`: store `1`; update `x = 725`.
5. `i = 2`: store `5`; update `x = 72`.
6. `i = 1`: store `2`; update `x = 7`.
7. Store `ret[0] = 7`.
8. Return `[7, 2, 5, 1, 9]`.

## Common Failure Modes

- **Reading uninitialized heap memory:** `malloc` does not fill memory with zero.
- **Not checking `malloc`:** dereferencing `NULL` crashes or invokes undefined behavior.
- **Memory leak:** overwriting or losing the only pointer to heap memory before freeing it.
- **Dangling pointer:** using a pointer after its object went out of scope or was freed.
- **Double free:** freeing the same heap block twice.
- **Wrong allocation size:** using `sizeof(pointer)` when you meant `sizeof(*pointer)` or `sizeof(type)`.
- **Capacity and length confusion:** writing to `arr[len]` when `len == cap`.
- **Returning stack storage:** returning a pointer to a local array or local variable.
- **Freeing too early:** freeing a block while other code still expects to use it.
- **Assuming undefined behavior is predictable:** a bug may seem to work with one compiler and crash with another.

## Debugging Dynamic Memory

Use a systematic checklist:

1. For every `malloc`, identify the matching `free`.
2. For every pointer, identify the lifetime of the pointed-to object.
3. Before every write `arr[i]`, verify `0 <= i < cap`.
4. Before every read `arr[i]`, verify `0 <= i < len`.
5. After resizing, verify pointer, capacity, and length are all consistent.
6. After freeing, do not access the block again.
7. If the program crashes at `free`, suspect double free, heap corruption, or a pointer that did not come from `malloc`.

Compiler and tooling habits:

```sh
gcc -Wall -Wextra -g program.c
valgrind ./a.out
```

AddressSanitizer is also useful when available:

```sh
gcc -Wall -Wextra -g -fsanitize=address program.c
./a.out
```

## Exam Reasoning Patterns

When asked about heap code, do not only describe syntax. Track ownership and lifetime:

- Which variables are pointers?
- What allocation does each pointer currently refer to?
- Is the allocation still alive?
- Is the pointer the only way to reach that allocation?
- Who is responsible for freeing it?
- Does the function return a pointer? If yes, what object does it point into?
- Does the array have both a length and a capacity? If yes, which one controls reads and which one controls writes?

When asked to analyze resizing:

1. Draw the old array with its capacity and length.
2. Draw the new array after allocation.
3. Copy values one by one.
4. Mark the old array as freed.
5. Move the active pointer to the new array.
6. Update capacity.
7. Insert the new element and update length.

## Quick Reference

- `malloc(sizeof(T) * n)` allocates room for `n` objects of type `T`.
- `free(ptr)` releases a heap block allocated by `malloc`.
- `ptr = NULL` after `free(ptr)` helps catch accidental reuse of that one pointer.
- Heap memory is valid until freed.
- Stack memory is valid only while its function call or scope is active.
- Return heap pointers, caller-provided pointers, or global/static pointers; never return pointers to local stack objects.
- Grow dynamic arrays by doubling capacity for amortized constant append.
- Keep length and capacity separate.

## Exam Questions

- When should you use heap allocation instead of a stack array?
- Why is returning a pointer to a local array undefined behavior?
- What is the difference between a memory leak and a dangling pointer?
- Why is doubling capacity better than adding one slot at a time?
- Who owns heap memory returned by a function?
- Why is `size_t` preferred for array sizes and capacities?
- Why should a pointer often be set to `NULL` after `free`?
- In a resize operation, why must copying happen before freeing the old array?
- If `malloc` succeeds but the pointer is overwritten before `free`, what bug occurred?
- Given a function that returns `int *`, how can you decide whether the caller must free the returned pointer?
