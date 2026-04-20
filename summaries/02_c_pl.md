# 02 C Programming Language

## Big Picture
- This lecture introduces C as a compiled, statically typed language that sits much closer to the machine than Python.
- The important shift is that C makes representation visible: type, size, signedness, control flow, and function calls all connect to storage and bits.
- It also introduces the memory model that the rest of the course depends on: text, data, heap, and stack.

## What C Is
- C was developed at Bell Labs by Dennis Ritchie and Ken Thompson.
- It was built for Unix and later became foundational for kernels, systems tools, and performance-sensitive software.
- C is high-level because it is written in source code, but low-level compared with Python because it exposes the machine model more directly.
- In C, you cannot ignore representation for long; the language is constantly telling you where bits live and how they are interpreted.

## Compilation and Execution
- C uses a compiler, not an interpreter.
- `gcc` turns source code into a binary executable.
- One `gcc` invocation normally covers preprocessing, compilation, assembly, and linking.
- The compiler does not just “run” your code; it transforms your source into machine code that the operating system can load.

### What the toolchain is doing
- The preprocessor handles directives such as `#include`.
- The compiler translates C into lower-level representation.
- The assembler turns that representation into machine instructions.
- The linker combines object files and libraries into a final executable.
- You usually invoke `gcc`, but several tools are involved behind the scenes.

### What the machine does
- The operating system loads the binary into memory.
- It chooses the program’s starting point.
- It arranges the initial runtime state.
- Then execution begins at the entry point, which in C is `main`.

## Entry Point and Program Structure
- The operating system needs a starting address when it launches a program.
- In C, that entry point is `main`.
- Unlike Python, a C program must define `main`.
- `#include <stdio.h>` gives access to standard I/O functions.
- `int main(int argc, char **argv)` declares the entry function.
- `argc` counts the command-line arguments.
- `argv` stores the argument strings.
- `return 0;` sends an exit status back to the operating system.

### Why `main` matters
- The OS needs a defined place to begin execution.
- The compiler arranges for `main` to be that place.
- The return value of `main` is not just a local result; it becomes the program’s exit status.

### Worked trace: `helloWorld.c`
- Source:
  - `printf("Hello world!\n");`
  - `return 45;`
- Trace:
  - the program starts in `main`;
  - `printf` writes to stdout;
  - `main` returns `45`;
  - the OS receives that exit status.
- Lesson:
  - `main` can communicate success or failure through its return value.
  - In practice, `0` usually means success, and nonzero usually means failure.

### Why this is different from Python
- In Python, the interpreter is the active program.
- In C, the compiled binary is the active program.
- The source file is not what the CPU executes.
- That is why compilation is a required step before execution.

### Worked trace: `exitStatus.c`
- The program reads two integers with `scanf`.
- It returns `x + y` as the exit status.
- That example is intentionally unusual.
- It shows that a C program’s return value is an actual program result, not just syntax.

## Formatted Output
- `printf` prints according to a format string.
- `%d` prints decimal integers.
- `%u` prints unsigned integers.
- `%f` prints floating-point values.
- `%c` prints characters.
- `%s` prints strings.
- Precision such as `%.2f` limits decimal places.

### Mental model
- `printf` is not a generic printer that guesses types.
- The format string tells it how to interpret the following values.
- If the format specifier does not match the value, C will not protect you from the mismatch.

### Worked trace: `printf` with character data
- In `chars.c`, values like `'H'`, `101`, `c1 + 36`, and `'z' - 11` are all just numbers.
- `%c` asks `printf` to interpret those numbers as characters.
- That is why arithmetic on `char` values can still produce printable output.

## Types and Representation
- C’s built-in types are not classes.
- The lecture focuses on `int`, `char`, and `float`.
- `signed` and `unsigned` change how integer bits are interpreted.
- `char` is one byte.
- Characters are numeric values interpreted through ASCII or another encoding.
- Character literals use single quotes.

### Common mistaken model
- In Python, a name can be rebound to a value of a totally different type.
- In C, the declared type of a variable matters for the rest of its lifetime.
- C is not dynamically typed; the declared type is part of the contract.

## Number Systems and Why Binary Matters
- Base 10 is positional notation in powers of 10.
- Binary is base 2 and uses bits.
- Octal and hexadecimal are useful alternate radices.
- Hex is convenient because four bits map cleanly to one hex digit.

### Why binary matters in C
- Computer storage is built from fixed-size hardware units.
- Those units naturally behave like bits and bytes.
- C exposes those details instead of hiding them behind a heavily abstracted runtime.
- That is why number systems are not side material; they are the foundation.

### Reading a positional number
- `2357` in base 10 means:
  - `2 × 10^3`
  - `3 × 10^2`
  - `5 × 10^1`
  - `7 × 10^0`
- Binary works the same way, but the base is 2.
- `1011_2` means:
  - `1 × 2^3`
  - `0 × 2^2`
  - `1 × 2^1`
  - `1 × 2^0`

### Worked trace: `bitwise.c`
- The program reads an integer.
- It starts a mask at the highest bit.
- It uses `bit & x` to test whether each bit is set.
- It prints `1` or `0` for each position.
- It shifts the mask right one bit at a time.
- The idea is that binary is not just notation; it is directly inspectable with bitwise operations.

### Worked trace: `powersOfTwo.c`
- The program searches for the largest power of two not greater than the input.
- It then walks downward, subtracting powers of two when they fit.
- Each subtraction determines whether the current bit is `1` or `0`.
- This is a more arithmetic view of the same binary representation.

### Worked trace: `repeatedDiv.c`
- The helper recursively prints the binary digits of `x/2`.
- After the recursive call returns, it prints `x % 2`.
- This produces the bits from most significant to least significant.
- The `printBinaryFirst` version fails because it prints least significant bits first and cannot recover the earlier order.
- That example is a reminder that output order matters in recursive decomposition.

### Why hex shows up in memory diagrams
- Addresses are large binary numbers.
- Hex shortens them without losing the binary structure.
- Every hex digit corresponds to four bits.
- That makes it easier to inspect bit patterns and memory addresses.

## Fixed-Width Integers and Overflow
- Computer integers are finite-width.
- Overflow happens when a value does not fit in the available bits.
- Unsigned integers behave like ordinary fixed-width binary.
- Signed integers on modern systems use two’s complement.

### What overflow actually means
- The machine does not have infinite bits.
- When the stored result cannot fit, the high bits are lost.
- That is why the same arithmetic expression can produce different results depending on the type.
- Overflow is not “just a bug”; it is part of the finite storage model.

### What the machine is doing
- The hardware stores a fixed number of bits.
- Arithmetic is performed on those bits.
- If the true mathematical result does not fit, the extra bits are lost.
- That is why fixed-width integer arithmetic has boundaries.

### Unsigned versus signed interpretation
- The underlying bits can be identical.
- `%u` interprets them as an unsigned integer.
- `%d` interprets them as a signed integer.
- This is why one variable can print as a large positive number under one format and as a negative number under another.

### Worked trace: `intsize.c`
- `unsigned int x = 4294967295;`
- That value is at or near the maximum for a 32-bit unsigned integer.
- Printing with `%u` shows the unsigned interpretation.
- Printing with `%d` interprets the same bits as signed.
- After `x = x + 13554;`, the value wraps because the width is fixed.
- The lesson is not “C is weird”; the lesson is that the hardware representation is finite.

### Signed representations
- A sign-bit approach causes double zero and awkward arithmetic.
- One’s complement improves some things but still keeps double zero.
- Two’s complement is the representation used on modern machines.
- Two’s complement is attractive because addition works uniformly and the representation is efficient.

## Control Flow
- `if (expr) { ... }` uses parentheses around the condition.
- `while (expr) { ... }` repeats while the condition remains true.
- Zero is false; nonzero is true.
- Logical operators are `&&`, `||`, and `!`.
- C’s `for` loops have initialization, condition, and update sections.
- They are not the same shape as Python loops.

### Exact syntax habits
- C conditions are written inside parentheses.
- Blocks are written with braces.
- Statements end with semicolons.
- This matters because the language is far less forgiving than Python about punctuation.

### Worked example: boolean versus bitwise thinking
- In the course examples, `&&` is logical conjunction.
- `&` is bitwise AND.
- Those are not interchangeable.
- If you want boolean control flow, use boolean operators.
- If you want to combine bits, use bitwise operators.

### Worked trace: `booleanOperatorsvsBitwise.c`
- The program reads two integers.
- `if (x && y)` tests logical truthiness.
- `if (x & y)` tests whether the bitwise AND is nonzero.
- The two conditions can produce different answers for the same values.
- That example is a direct warning not to confuse logical and bitwise operators.

### Loop tracing habit
- Read the initialization first.
- Then ask what condition keeps the loop running.
- Then ask what update changes the loop variable.
- Then trace one iteration at a time until the stopping condition.

### Why the `while` example uses `scanf`
- The integer-reading examples show that control flow often depends on input.
- The loop is not just “repeat until true.”
- It is “repeat while the program has not yet obtained the input it needs.”
- That style of loop is common in robust C programs.

## Scope and Functions
- Curly braces define scope.
- Variables are only visible in their own block and nested blocks.
- A function has a return type, a name, parameters, and a body.
- Calls in C look familiar, but the type contracts are strict.
- Parameters receive copies of arguments.
- Changing a parameter usually changes only the callee’s local copy.
- Shared mutation requires a pointer or another shared handle.

### Why pass-by-value matters
- If a function takes `int x`, it receives a copy.
- If the function changes `x`, it changes the copy.
- The caller’s variable is unchanged unless you pass a pointer or another shared object.

### Function reasoning habit
- Ask what the function receives.
- Ask what storage the function may legally modify.
- Ask what value the function returns.
- Separate those three ideas in your head; many C bugs come from mixing them together.

### Worked trace: `increments.c`
- Prefix `++x` mutates first, then yields the new value.
- Postfix `x++` yields the old value, then mutates.
- That distinction matters because expressions can both produce a value and change storage.
- The code shows that `res1 = ++x1` and `res2 = x2++` are not the same thing.

### Worked trace: `unspecified.c`
- The program calls `printThree(++x, addFive(&x), doubleNum(&x));`
- The order of evaluation of the arguments is unspecified.
- That means the compiler may evaluate them in different orders.
- Because the arguments have side effects on the same variable, the result is not portable.
- The lesson is to avoid writing expressions that depend on evaluation order.

## Memory Layout
- Program memory is divided into text, data, heap, and stack.
- Text stores code.
- Data stores globals and statics.
- Heap stores programmer-managed dynamic memory.
- Stack stores locals and stack frames.

### What each region means
- Text is where the executable code lives.
- Data is where global and static storage live.
- Heap is where you later ask the program to allocate memory dynamically.
- Stack is where function-local automatic variables live.
- The lecture is not yet about dynamic allocation, but this layout is the frame for that later topic.

### Stack frames
- Each function call gets its own frame.
- Local data disappears when the function returns.
- Recursive calls create multiple live frames.
- This model is crucial later when you reason about pointers, arrays, and dynamic memory.

### How to think about a call
- A function call creates a new working area.
- When the function returns, that working area goes away.
- Returning a pointer to a local variable is dangerous because the referenced storage no longer exists after return.
- Even before later pointer lectures, the stack-frame model explains why that kind of bug is fatal.

## Lecture Code Connections
- `lecture_code/cpl/smallExamples/helloWorld.c`
  - Shows a minimal `main` with `printf` and an explicit return value.
  - Useful for entry-point reasoning and exit status.
- `lecture_code/cpl/smallExamples/exitStatus.c`
  - Returns the sum of two integers as the process status.
  - Reinforces that `main`’s return value goes to the OS.
- `lecture_code/cpl/smallExamples/intsize.c`
  - Shows unsigned wraparound and different format specifiers for the same bit pattern.
  - Good for signed-versus-unsigned interpretation.
- `lecture_code/cpl/smallExamples/chars.c`
  - Demonstrates that characters are numbers.
  - Good for ASCII and literal interpretation.
- `lecture_code/cpl/smallExamples/increments.c`
  - Demonstrates prefix and postfix increment and decrement.
  - Good for evaluating expression side effects.
- `lecture_code/cpl/smallExamples/unspecified.c`
  - Shows that side-effect-heavy argument lists are not portable.
  - Good warning for exam reasoning.
- `lecture_code/cpl/smallExamples/printBinary/bitwise.c`
  - Uses bitwise operations and shifting to print a binary representation.
  - Good for thinking in bits instead of decimal intuition.
- `lecture_code/cpl/smallExamples/printBinary/powersOfTwo.c`
  - Builds binary output using powers of two and subtraction.
  - Reinforces the positional view of binary.
- `lecture_code/cpl/smallExamples/printBinary/repeatedDiv.c`
  - Uses recursion and repeated division to print binary.
  - Helps connect recursion with representation.

## Common Failure Narratives
- A student expects C variables to change type like Python variables. They do not.
- A student forgets to define `main` and wonders why the program cannot start.
- A student uses `%d` where `%u` is needed, or vice versa, and reads the same bits under the wrong interpretation.
- A student assumes `int` has a universal size. It does not.
- A student writes code that depends on argument evaluation order and sees different behavior on different compilers.
- A student forgets that local variables live on the stack and vanish when the function returns.

## Exam Solution Patterns
- If a question asks about compilation, explain the toolchain and the resulting binary.
- If a question asks about `main`, explain program startup and exit status.
- If a question asks about binary, connect the answer to fixed-width hardware storage.
- If a question asks about `printf`, match the format specifier to the interpretation of the bits.
- If a question asks about a loop, trace the initialization, condition, and update separately.
- If a question asks about a function, separate the parameters, local copies, return value, and side effects.

## Quick Reference
- Compile: `gcc file.c`
- Compile with output name: `gcc file.c -o program`
- Run: `./program`
- Entry point: `main`
- Integer format: `%d`
- Unsigned integer format: `%u`
- Floating-point format: `%f`
- Character format: `%c`
- String format: `%s`
- Zero is false, nonzero is true
- Logical operators: `&&`, `||`, `!`
- Common integer types: `int`, `signed int`, `unsigned int`
- `char` is one byte
- Two’s complement is the standard signed integer representation

## Exam Questions
- Q: Why does C use `main` as the program entry point?
  A: The OS needs a defined place to start execution, and the compiler arranges for `main` to be that entry point.
- Q: What is the difference between `signed int` and `unsigned int`?
  A: They interpret the same fixed-width bit pattern differently; signed values use two’s complement while unsigned values are treated as ordinary binary.
- Q: Why can `char` hold numeric values and printable characters?
  A: Because a character is just a one-byte number interpreted through an encoding such as ASCII.
- Q: What does `return 0;` from `main` mean?
  A: It returns an exit status of 0 to the operating system, which usually indicates success.
- Q: Why is binary important for C?
  A: C exposes the machine-level representation of values, so understanding bits, bytes, and fixed width matters.
- Q: Why can a function parameter not normally change the caller’s variable?
  A: Function arguments are copied into the callee’s stack frame, so the callee mutates its own local copy.
- Q: What is overflow in unsigned arithmetic?
  A: When the result exceeds the fixed-width range, the extra bits are discarded and the value wraps.
- Q: What does `sizeof` measure?
  A: The size of its operand in bytes.
