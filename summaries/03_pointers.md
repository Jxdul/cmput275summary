# 03 Pointers and Arrays

## Big Picture
- This lecture introduces pointers as memory addresses and then uses them to explain mutation, input, arrays, and strings.
- The important shift is that C exposes storage layout directly: you can read and write through a pointer, and arrays become pointer-like in many expressions.
- The rest of the lecture turns that model into practical tools for input handling, array processing, and C string work.

## What a Pointer Is
- A pointer stores a memory address.
- The address identifies some other data in memory.
- A pointer lets you read or write the data at that address.
- `int *ptr;` declares a pointer to `int`.
- The `*` belongs to the type.
- `&x` gives the address of `x`.
- You should not assign arbitrary numbers to pointers.

### Mental model
- A normal variable stores a value.
- A pointer stores where a value lives.
- The pointer itself is a value too, but its meaning is “address of something else.”
- The type tells C how to interpret the bytes at that address when you dereference it.

## Dereferencing and Aliasing
- `*ptr` follows the pointer to the value it points at.
- Dereferencing is an alias for the underlying storage.
- Assigning through a dereferenced pointer mutates the original object.

### Worked trace: `simple.c`
- `int x = 10;`
- `int *p = &x;`
- `p` now stores the address of `x`.
- `printf("value of p: %p\n", p);` prints the address.
- `printf("value of dereferenced p (*p): %d\n", *p);` prints `10`.
- `*p = -1;` writes through the pointer.
- `printf("The value of x: %d\n", x);` prints `-1` because `x` and `*p` refer to the same storage.

### Common mistaken model
- A student may think `*p` is just “a copy of x.”
- It is not.
- `*p` is a different way to name the same memory.
- That is why writes through `*p` change `x`.

## Mutation Through Pointers
- `times2(int *p)` can modify the caller’s value by writing through `*p`.
- Passing `&x` into such a function lets the function change `x`.
- This is the core reason pointers matter in C.

### Worked trace: `times2.c`
- Start with `x = 10`.
- Call `times2(&x)`.
- The function receives the address of `x`.
- `*p = *p * 2;` doubles the value stored at that address.
- After the first call, `x` becomes `20`.
- After the second call, `x` becomes `40`.

### Why this works
- C passes arguments by value.
- When you pass an `int`, the callee gets a copy.
- When you pass an `int *`, the callee gets a copy of the address.
- The copy of the address still points to the caller’s storage, so dereferencing it reaches the caller’s object.

### Debugging habit
- If a function “isn’t mutating the caller’s variable,” check whether you passed the value or the address.
- If a function parameter is `int x`, it can only mutate its local copy.
- If the goal is mutation, the parameter usually needs to be a pointer.

## Words, Addresses, and Hex
- A word is a group of bytes, commonly 4 or 8.
- The lecture diagrams assume 4-byte words.
- Hexadecimal is the normal way to display addresses.

### Why addresses are usually shown in hex
- Raw binary addresses are too long to read comfortably.
- Hex compresses four bits into one digit.
- That makes memory diagrams readable without losing the bit structure.

## Pointer Size and Pointer Arithmetic
- `sizeof` can show the size of a value versus the size of a pointer.
- Pointer arithmetic scales by the pointed-to type size.
- Adding 1 to an `int *` advances by `sizeof(int)` bytes.
- Pointer subtraction yields element distance, not raw byte distance.

### Worked trace: `sizes.c`
- The code prints `sizeof(int)` and `sizeof(int *)`.
- Those are not the same thing.
- It then sets `p = &x` and increments `p`.
- Incrementing the pointer moves it by one `int` worth of storage.

### Worked trace: `pointerArithmetic.c`
- `int *p = &x;`
- `long long int *z = &y;`
- `++p;` advances by one `int`.
- `++z;` advances by one `long long int`.
- The machine is not adding one raw byte.
- It is adding one element of the pointed-to type.

### What the machine is doing
- The compiler knows the size of the pointed-to type.
- Pointer arithmetic multiplies the step by that size.
- That is why `p + 1` and `z + 1` can move by different numbers of bytes.

## Invalid and Dangerous Pointers
- You should not assign arbitrary numbers to pointers.
- `&4` is invalid because the literal `4` is not a stored object with a normal address you may take.
- Walking a pointer across unrelated data is undefined behavior.

### Worked trace: `rvalue.c`
- The code tries to do `int *p = &4;`
- That is invalid because `4` is an rvalue.
- An rvalue may exist only as a temporary expression result.
- It is not guaranteed to have an address you can take.

### Worked trace: `badBehaviour.c`
- The program prints addresses and then increments a pointer through unrelated storage.
- That is not a valid way to “scan memory.”
- A pointer must stay within a valid object or one-past-the-end.
- Crossing into unrelated objects makes the behavior undefined.

## Arrays: What They Are and What They Are Not
- Arrays are fixed-size collections of same-typed elements.
- They are contiguous in memory.
- Array size must be known when allocating stack arrays.
- `sizeof` works on actual arrays, but not on array parameters after decay.
- Arrays are not pointers.

### Important distinction
- An array stores elements.
- A pointer stores an address.
- In many expressions, an array name evaluates to the address of its first element.
- That is why arrays sometimes “look like pointers,” but they are not the same type.

### Worked trace: `whatIsAnArray.c`
- The array `arr` really is an array.
- `sizeof arr` measures the whole array storage.
- `arr` in an expression decays to the address of the first element.
- `&arr` is the address of the whole array object, which is why the type is different even if the numeric address prints the same.
- `arr[2]`, `*(arr + 2)`, and `2[arr]` all refer to the same element because indexing is pointer arithmetic plus dereference.

### Common mistaken model
- Students often believe `arr` “is just a pointer.”
- Better: an array can decay to a pointer in expressions, but it is still an array object.
- That distinction is why `sizeof` and function parameters behave differently.

## Array Parameters and Length
- When passed to a function, an array usually decays to a pointer to its first element.
- That is why `void f(int arr[])` and `void f(int *arr)` are effectively the same in parameter position.
- Because of decay, the callee must be given the length separately.

### Worked trace: `printArray.c`
- `main` creates a real array with ten elements.
- `printArray(arr, sizeof arr/sizeof arr[0]);` passes the pointer-like value and the length.
- `printArray(arr + 2, (sizeof arr/sizeof arr[0]) - 2);` passes a pointer to the third element and the remaining length.
- The function can print from the middle because the data are contiguous.

### Debugging habit
- If a function needs to know how many elements are valid, pass the length explicitly.
- Do not try to recover the original array size inside the function after decay.

## Traversing and Mutating Arrays
- Arrays are often traversed with index-based loops.
- Pointer iteration is another valid pattern.
- Mutation through arrays and pointers changes the same storage because arrays are contiguous.

### Worked trace: `argmax.c`
- The first version starts `max` at the first element.
- It walks `cur` from `arr` to `arr + len`.
- Whenever `*cur > *max`, it updates `max`.
- At the end, `max - arr` gives the index of the largest element.
- The second version does the same job with an explicit index variable.

### Worked trace: `replace.c`
- `end` points one past the last valid element.
- The loop walks from `arr` up to `end`.
- When `*arr == tar`, the code writes `repl` into that slot.
- The function returns the number of replacements.
- This is a canonical in-place mutation pattern.

## Strings
- C has no dedicated string type.
- Strings are null-terminated arrays of `char`.
- A character array without `'\0'` is not a valid C string.

### Storage of strings
- `char myS[] = "This is stored on the stack";`
  - creates a writable array on the stack.
  - the characters are copied into the array storage.
- `char *p = "This is stored in the text or data segment";`
  - points at string-literal storage.
  - writing through `p` is undefined behavior.

### Worked trace: `storage.c`
- `myS` is a real array.
- `myS[0] = 'X';` is legal because the array is writable.
- `p` points at a string literal.
- `p[0] = 'X';` is a bug because the literal storage should not be modified.
- The printed addresses demonstrate that the writable stack array and the literal live in different storage.

### Why `const char *` matters
- `const char *` says “pointer to read-only characters.”
- It prevents accidental writes through the pointer.
- That is the correct type for string literals and other read-only string data.

## String Length, Comparison, and Search
- `strlen` counts characters until the null terminator.
- `strcmp` compares lexicographically.
- `strchr` searches for a character.
- `strcat` appends strings, but only if the destination buffer is large enough.

### Worked trace: `strSize.c`
- `char s[] = "abcd";`
- `strlen(s)` returns `4` because it counts characters before `'\0'`.
- `sizeof s` returns the size of the whole array storage, including the terminator.
- This is one of the most common C mistakes: length and storage size are not the same thing.

### Worked trace: `myStrLen.c`
- `ourstrlen` starts at the first character.
- It advances while `*p` is nonzero.
- It increments `len` with each character.
- When it reaches `'\0'`, it stops.
- This is exactly the mental model you should have for `strlen`.

### Worked trace: `comparing.c`
- `buf1 < buf2` compares addresses, not string content.
- That is the wrong mental model if you want lexical order.
- `cmps` walks both strings until it finds a difference or a terminator.
- The function then returns `-1`, `0`, or `1` based on character comparison.

### Worked trace: `mystrchr.c`
- The function scans a string one character at a time.
- If it finds the target, it returns a pointer to that position.
- If it reaches the null terminator, it returns `NULL`.
- The returned pointer may point into stack storage, heap storage, or a literal; the pointer itself is just an address.

## Safer String Input
- Plain `scanf("%s", buff)` is dangerous because it can overrun a buffer.
- A width limit like `"%15s"` bounds how many characters are read.

### Worked trace: `readingStrings.c`
- `char buff[16];`
- `scanf("%15s", buff)` reads at most 15 characters plus the null terminator.
- The remaining input stays in the stream if the user typed more than 15 characters.
- That is safer than unbounded `%s`, but it also means long input can be split across reads.

## Input and Error Recovery
- `scanf` reads formatted input from stdin.
- It returns the number of successfully read items.
- If the return value is not what you expected, input likely failed.
- A failed integer read leaves the bad character in the stream.
- Repeating the same read without consuming anything repeats the failure.
- The fix is to consume the offending character and try again.
- `feof(stdin)` and `EOF` help detect end of input.
- `getchar()` reads one character and returns `EOF` at end of file.

### Worked trace: integer-reading loop
- Try `scanf("%d", &x)`.
- If it succeeds, use the value.
- If it fails, consume one character with `scanf("%c", &c)` or a similar strategy.
- Then try again.
- Without the consume step, the invalid character stays at the front of the stream forever.

### What the machine is doing
- `scanf` does not magically remove bad input.
- It only removes data it successfully consumes.
- If the next character is not valid for the requested format, the read fails and the stream position does not move past that character.

## Lecture Code Connections
- `lecture_code/cpl/pointers/simple.c`
  - Shows address-of, dereference, and mutation through `*p`.
- `lecture_code/cpl/pointers/times2.c`
  - Shows the pointer-based version of `times2` that actually changes the caller’s variable.
- `lecture_code/cpl/pointers/sizes.c`
  - Shows the size of a value versus the size of a pointer, and how pointer arithmetic advances by the pointed-to type size.
- `lecture_code/cpl/pointers/rvalue.c`
  - Shows that you cannot take the address of a literal rvalue like `4`.
- `lecture_code/cpl/pointers/pointerArithmetic.c`
  - Shows pointer arithmetic on different pointed-to types and why the increment depends on `sizeof(*p)`.
- `lecture_code/cpl/pointers/badBehaviour.c`
  - Demonstrates undefined behavior from walking a pointer across unrelated data.
- `lecture_code/cpl/arrays/whatIsAnArray.c`
  - Shows the array-versus-pointer distinction and the indexing identity `arr[i] == *(arr + i)`.
- `lecture_code/cpl/arrays/printArray.c`
  - Shows that array parameters behave like pointer parameters and need explicit length.
- `lecture_code/cpl/arrays/argmax.c`
  - Uses pointer iteration and array indexing to find the index of the maximum element.
- `lecture_code/cpl/arrays/replace.c`
  - Shows in-place mutation of array elements and count-returning replacement logic.
- `lecture_code/cpl/arrays/strings/storage.c`
  - Shows writable stack strings versus read-only string literals.
- `lecture_code/cpl/arrays/strings/readingStrings.c`
  - Shows safer bounded string reading with `scanf("%15s", buff)`.
- `lecture_code/cpl/arrays/strings/strSize.c`
  - Contrasts `strlen` with `sizeof` on a stack string.
- `lecture_code/cpl/arrays/strings/myStrLen.c`
  - Implements string length manually by scanning until `'\0'`.
- `lecture_code/cpl/arrays/strings/comparing.c`
  - Shows why address comparison is not string comparison.
- `lecture_code/cpl/arrays/strings/mystrchr.c`
  - Shows a search function that returns a pointer into the input string or `NULL`.

## Common Failure Narratives
- A student thinks a pointer is “the value itself” and then gets confused when two variables alias the same storage.
- A student uses `&4` or another rvalue and expects every expression to have an address.
- A student assumes arrays and pointers are interchangeable and then misuses `sizeof`.
- A student passes an array to a function but forgets to pass the length, so the callee cannot tell how much storage is valid.
- A student reads a non-integer with `scanf("%d", &x)` and then loops forever because the bad character is still sitting in stdin.
- A student compares strings with `<` and `>` and accidentally compares addresses.
- A student writes into a string literal through `char *` and hits undefined behavior.
- A student uses `%s` with no width limit and overflows a fixed buffer.

## Exam Solution Patterns
- If a question asks why a function mutates the caller’s value, explain aliasing through pointers.
- If a question asks about `scanf`, remember that it needs an address so it can store the parsed value.
- If a question asks about array length inside a function, remember array decay and the loss of size information.
- If a question asks about pointer arithmetic, convert the idea to “elements, not bytes.”
- If a question asks about strings, look for the null terminator and the storage location.
- If a question asks about a loop that will not stop, inspect whether bad input is being consumed.

## Quick Reference
- Pointer declaration: `int *p`
- Address-of: `&x`
- Dereference: `*p`
- Array indexing: `arr[i]`
- Pointer indexing: `p[i] == *(p + i)`
- Array length on a real array: `sizeof(arr) / sizeof(arr[0])`
- String terminator: `'\0'`
- Read integer: `scanf("%d", &x)`
- Read bounded string: `scanf("%15s", buff)`
- Check EOF: `feof(stdin)`
- Read one character: `getchar()`
- String length: `strlen`
- Comparison: `strcmp`
- Search: `strchr`
- Append: `strcat`
- Use `const char *` for string literals

## Exam Questions
- Q: Why does `times2(int *p)` mutate the caller’s variable, but `times2(int x)` does not?
  A: The pointer version writes through the caller’s address, while the value version only mutates a local copy.
- Q: What does `p[i]` mean for a pointer `p`?
  A: It means `*(p + i)`.
- Q: Why can’t you use `sizeof` to get the length of an array parameter?
  A: Because array parameters decay to pointers, and `sizeof` then measures the pointer, not the original array.
- Q: What does `'\0'` represent?
  A: The null terminator that marks the end of a C string.
- Q: Why is `char *s = "Text/Data";` dangerous if you try to write through `s`?
  A: It points at read-only string literal storage, so writing through it is undefined behavior and often crashes.
- Q: What does `scanf("%d", &x)` require that `scanf("%d", x)` does not?
  A: It requires the address of `x`, because `scanf` needs somewhere to store the value it reads.
- Q: Why is pointer arithmetic scaled by type size?
  A: Because advancing by one element means moving by `sizeof(*p)` bytes, not by one raw byte.
- Q: Why can a failed integer read loop forever?
  A: The invalid character stays in the input stream unless it is explicitly consumed.
