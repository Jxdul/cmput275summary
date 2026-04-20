# 06 Mutation as Return Values and Double Pointers

## Big Picture

C passes arguments by value. That means every function parameter is a local copy. If a function needs to change the caller's data, the caller must pass an address, and the function must write through that pointer.

This lecture uses that rule in two stages:

- Use single pointers as output parameters to return extra values.
- Use double pointers when a function must change the caller's pointer variable itself.

The central question is always:

```text
Which variable in the caller must be different after the function returns?
```

If the caller's `x` must change, pass `&x`. If the caller's `arr` pointer must point somewhere new, pass `&arr`, which has type `int **` when `arr` has type `int *`.

## Returning Multiple Values with Output Parameters

C functions return one value directly. To produce additional results, write into caller-provided memory.

The lecture's `maxInfo` example computes both:

- the maximum value in an array;
- the index where that maximum occurs.

From `lecture_code/cpl/mutation/maxinfo.c`:

```c
float maxInfo(float *arr, int len, int *indLoc) {
  assert(len > 0);
  int maxInd = 0;
  float maxVal = arr[0];
  for (int i = 1; i < len; ++i) {
    if (arr[i] > arr[maxInd]) {
      maxInd = i;
      maxVal = arr[i];
    }
  }
  *indLoc = maxInd;
  return maxVal;
}
```

The caller:

```c
int maxInd = 0;
float max = maxInfo(arr, len, &maxInd);
```

Reasoning:

1. `maxInfo` returns the maximum value normally.
2. `&maxInd` gives the function the address of the caller's variable.
3. `*indLoc = maxInd;` writes into that caller variable.
4. After the function returns, the caller can read both `max` and `maxInd`.

## Why `return (a, b)` Does Not Work

This statement is legal C:

```c
return (maxSoFar, maxInd);
```

But it does not return two values. It uses the comma operator:

1. Evaluate `maxSoFar`.
2. Discard that result.
3. Evaluate `maxInd`.
4. Return only `maxInd`.

This is often an exam trap. The code compiles, but it does not mean what a beginner might hope.

## Mutation-Only Version

A function can also return `void` and write all results through pointers:

```c
void maxInfo(float *arr, size_t len, float *max, size_t *ind) {
  assert(len > 0);
  float maxSoFar = arr[0];
  size_t maxInd = 0;

  for (size_t i = 1; i < len; ++i) {
    if (arr[i] > maxSoFar) {
      maxSoFar = arr[i];
      maxInd = i;
    }
  }

  *max = maxSoFar;
  *ind = maxInd;
}
```

Caller:

```c
float max;
size_t ind;
maxInfo(arr, len, &max, &ind);
```

This style is useful when there is no single obvious primary result, or when a function's direct return value is reserved for success/failure.

## Pass-by-Value Versus Pass-by-Pointer

This function cannot update the caller's length:

```c
void bad_inc(size_t len) {
  ++len;
}
```

`len` is a local copy. The caller's variable is unchanged.

This function can update the caller's length:

```c
void good_inc(size_t *len) {
  ++(*len);
}
```

Caller:

```c
size_t len = 0;
good_inc(&len);
```

Memory model:

- `&len` is the address of the caller's variable.
- Inside the function, `len` is a pointer storing that address.
- `*len` names the caller's actual variable.

## Dynamic Array `append`: Why Each Attempt Fails

The lecture builds toward this final interface:

```c
void append(int **arr, int *len, int *cap, int v);
```

Each pointer level corresponds to caller state that may need to change.

### Attempt 1: Everything by Value

```c
void push(int *arr, int val, size_t len, size_t cap) {
  if (len == cap) {
    int *newArr = malloc(sizeof(int) * cap * 2);
    for (size_t i = 0; i < len; ++i) {
      newArr[i] = arr[i];
    }
    free(arr);
    cap = cap * 2;
    arr = newArr;
  }
  arr[len] = val;
  ++len;
}
```

Problems:

- `len` is a copy, so the caller's length does not change.
- `cap` is a copy, so the caller's capacity does not change.
- `arr` is a copy of the pointer, so reassigning it does not reassign the caller's pointer.

If no resize happens, the value may be written into the array, but the caller still thinks `len` is unchanged. Printing `len` elements prints nothing if `len` remains 0.

### Attempt 2: Fix `len` Only

```c
void push(int *arr, int val, size_t *len, size_t cap) {
  ...
  arr[*len] = val;
  ++*len;
}
```

This lets the function update the caller's length, but `cap` and `arr` are still local copies. Once resizing happens, the caller may keep stale state.

### Attempt 3: Fix `len` and `cap`

```c
void push(int *arr, int val, size_t *len, size_t *cap) {
  if (*len == *cap) {
    int *newArr = malloc(*cap * sizeof(int) * 2);
    for (size_t i = 0; i < *len; ++i) {
      newArr[i] = arr[i];
    }
    free(arr);
    *cap = *cap * 2;
    arr = newArr;
  }
  arr[*len] = val;
  ++*len;
}
```

This still fails when resizing happens:

1. `arr` in `main` points to heap block A.
2. `push` receives a local copy of that address.
3. `push` allocates heap block B.
4. `push` copies A into B.
5. `push` frees A.
6. `push` sets its local `arr` copy to B.
7. `push` returns.
8. The caller's `arr` still points to A, which is now freed.
9. B is leaked because no caller variable points to it.

This explains both the dangling pointer and the double-free crash from the slides.

## Fixed `append` with a Double Pointer

From `lecture_code/cpl/mutation/doublingArray.c`:

```c
void append(int **arr, int *len, int *cap, int v) {
  if (*cap == *len) {
    int *newArr = malloc(sizeof(int) * (*cap * 2));
    for (int i = 0; i < *len; ++i) {
      newArr[i] = (*arr)[i];
    }
    free(*arr);
    *arr = newArr;
    *cap = *cap * 2;
  }
  (*arr)[(*len)++] = v;
}
```

Caller:

```c
int cap = 4;
int *arr = malloc(sizeof(int) * cap);
int len = 0;
append(&arr, &len, &cap, 10);
```

Why each argument is an address:

- `&arr` lets `append` change the caller's pointer variable.
- `&len` lets `append` change the caller's length.
- `&cap` lets `append` change the caller's capacity.

Inside `append`:

- `arr` has type `int **`.
- `*arr` is the caller's `int *` variable.
- `(*arr)[i]` indexes the caller's active heap array.
- `*arr = newArr` changes the caller's pointer.

Parentheses matter. `(*arr)[i]` means index the integer array pointed to by the caller's pointer. `*arr[i]` would index `arr` first and then dereference, which is not this data shape.

## Worked Trace: Fixed `append`

Initial state:

```text
main:
  arr -> A: [4, 8, 15, 16]
  len = 4
  cap = 4
```

Call:

```c
append(&arr, &len, &cap, 23);
```

Inside `append`:

1. `*len == *cap`, so the array is full.
2. Allocate B with capacity 8.
3. Copy values:

```text
B[0] = A[0] = 4
B[1] = A[1] = 8
B[2] = A[2] = 15
B[3] = A[3] = 16
```

4. `free(*arr)` frees A.
5. `*arr = newArr` changes `main`'s `arr` to point at B.
6. `*cap = *cap * 2` changes `main`'s `cap` to 8.
7. `(*arr)[(*len)++] = 23` writes B[4] and then changes `main`'s `len` to 5.

Final state:

```text
main:
  arr -> B: [4, 8, 15, 16, 23, _, _, _]
  len = 5
  cap = 8
```

## `pop` and What It Really Mutates

The lecture code has:

```c
void pop(int **arr, int *len, int *cap) {
  --*len;
}
```

This only removes the last item logically. It does not erase the old value from memory and does not shrink the capacity.

For an array:

```text
arr = [3, 5, 9, 12, _, _, _, _]
len = 4
cap = 8
```

After `pop`, `len = 3`. The old `12` may still sit in `arr[3]`, but it is outside the meaningful range. The valid elements are only indices `0` through `len - 1`.

A robust `pop` should check that `len > 0` before decrementing. Otherwise `--*len` can underflow when `len` is an unsigned type or become negative when signed.

## Debugging Double Pointer Code

Use the "caller variable" test:

- If the function only changes elements inside an existing array, `int *arr` may be enough.
- If the function changes which allocation the caller's array pointer names, use `int **arr`.
- If the function changes a scalar in the caller, use a pointer to that scalar, such as `size_t *len`.

Draw two boxes:

```text
main's arr variable: stores address A
function's arr parameter: stores address of main's arr variable
```

Then decode:

- `arr` is the address of the caller's pointer variable.
- `*arr` is the caller's pointer variable.
- `**arr` is the first integer in the caller's array.
- `(*arr)[i]` is the `i`th integer in the caller's array.

## Common Failure Modes

- Forgetting `&` at the call site for an output parameter.
- Writing to `ptr` when you meant `*ptr`.
- Updating a local copy and expecting the caller to see it.
- Reassigning a local pointer after `malloc`, leaking the new allocation.
- Freeing the old allocation but not updating the caller's pointer.
- Forgetting parentheses in `(*arr)[i]`.
- Passing an uninitialized pointer as an output destination.
- Calling `pop` on an empty array.
- Forgetting that `len`, `cap`, and `arr` are separate pieces of state that must stay consistent.
- Using `int` and `size_t` inconsistently in comparisons and loops.

## Practical Interface Design

Output parameters make a function more powerful but also easier to misuse. Good C interfaces should document:

- which parameters are inputs;
- which parameters are outputs;
- which parameters may be mutated;
- whether the function may allocate;
- whether ownership transfers;
- what the function does on allocation failure.

For example:

```c
int append(int **arr, size_t *len, size_t *cap, int v);
```

Returning `int` could report success or failure:

- `1` for success;
- `0` for allocation failure.

That is often stronger than a `void` function because callers can handle `malloc` failure.

## Exam Reasoning Patterns

When asked whether a function needs a pointer:

1. Identify the variable in the caller that must change.
2. If the caller variable is an `int`, pass `int *`.
3. If the caller variable is an `int *`, pass `int **`.
4. If the caller variable is a `struct List *`, replacing it would require `struct List **`.
5. If only the object pointed to needs mutation, a single pointer to that object may be enough.

When tracing a bad resize:

1. Name the old block A.
2. Name the new block B.
3. Track which variable points to A or B.
4. After `free(A)`, mark every pointer to A as dangling.
5. If no caller variable points to B, mark B as leaked.

## Quick Reference

- `T *out` lets a function write a `T` into caller-owned storage.
- `T **out` lets a function replace a caller-owned `T *` pointer.
- Pass `&x` when the function should mutate `x`.
- Pass `&arr` when the function may make `arr` point to a new allocation.
- `(*arr)[i]` is the correct form when `arr` is an `int **` pointing to the caller's array pointer.
- C returns one value directly; output parameters are the standard workaround for multiple results.

## Exam Questions

- Why does `maxInfo` use an output parameter for the index?
- Why is `return (maxSoFar, maxInd);` not a valid multi-value return?
- Why does `push` need `int **arr` instead of `int *arr`?
- What bug appears when a resized array is freed but the caller keeps the old pointer?
- What is the difference between `size_t *len` and `size_t len` as a function parameter?
- Why does `append(&arr, &len, &cap, x)` work while `append(arr, len, cap, x)` does not?
- What does a double free tell you about ownership?
- Why is a local pointer reassignment invisible to the caller?
- In `append`, explain the difference between `arr`, `*arr`, and `(*arr)[0]`.
- What should a safe `pop` check before decrementing `len`?
