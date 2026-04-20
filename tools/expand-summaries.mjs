import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const marker = '## Expanded Study Guide';

const supplements = {
  '00_intro.md': `
## Expanded Study Guide

### How to use this course-administration lecture

This lecture is not technical, but it is still part of learning the course because it defines the constraints under which all technical work happens. The most important practical takeaway is that assessment rules are not background noise. They affect how you plan assignments, how you respond to illness, and how you avoid preventable mark loss. Treat the grading and deadline information as operating rules for the term.

The grade distribution also tells you how to allocate study effort. Assignments are a quarter of the grade, so steady implementation work matters. Morning problems are smaller individually but recurring, so they reward regular attendance and active recall. The midterm and final together dominate the course grade, so the summaries and exam questions should be used continuously rather than only immediately before the exams.

### Slip-day planning

Slip days are a limited resource: eight total, each worth a 24-hour extension, with no more than three usable on a single assignment. The cap matters because it prevents a student from saving every slip day for one large emergency. If an assignment is not close to completion, using three slip days may still not rescue it, and it may leave no buffer for later work. A better strategy is to start early, use slip days only when they genuinely change the outcome, and track the remaining total after every use.

When reading the technical summaries later, notice that many assignment bugs are not solved by one extra hour. Memory bugs, build-system errors, and pointer aliasing problems often need slow debugging. Slip days should protect against unexpected circumstances, not replace normal debugging time.

### Excused absences and weight shifting

The excused-absence policy is different from slip days. Slip days are a pre-allocated extension mechanism for assignments. Excused absences require a qualifying reason and approval. If approved, the missed component is not simply ignored; its weight shifts to related work. That means missing a midterm can make the final substantially more important, and missing an assignment can make the remaining assignments carry more weight.

The academic habit to build is documentation and early communication. If something serious happens, follow the course process rather than guessing. If you silently miss work and later hope it will be treated as excused, you create unnecessary risk.

### Communication workflow

The Ed Discussion forum is the primary communication channel. That matters for technical questions because many students will hit the same compiler errors, command-line mistakes, and memory-management bugs. A public course forum lets answers help more than one person, and it also creates a searchable archive of common problems. Use private channels only when the question includes personal information, grading details, or code that should not be posted publicly.

When asking for help, include the command you ran, the exact error output, the relevant file names, and what you expected to happen. This habit will become important in every later lecture, especially shell usage, separate compilation, and C++ resource-management debugging.
`,
  '01_shell.md': `
## Expanded Study Guide

### Reading shell commands precisely

The shell is an interpreter with rules. A command line is not just text that magically runs. Bash first performs expansions such as variables, command substitution, globbing, and quote removal, then it decides what program to execute and what arguments to pass. This is why two commands that look similar can behave differently. ` + '`wc file.txt`' + ` passes a filename argument to ` + '`wc`' + `, while ` + '`wc < file.txt`' + ` changes standard input and passes no filename argument. The program receives different information.

The most important mental distinction is between arguments and input. Command-line arguments are strings passed to the program at startup. Standard input is a stream the program reads while it runs. Redirection changes streams; it does not create new arguments. Pipes also change streams: the output stream of one program becomes the input stream of the next. Once this distinction is clear, many later C topics become easier because ` + '`argc`' + ` and ` + '`argv`' + ` are just the C version of command-line arguments, while ` + '`scanf`' + ` and ` + '`cin`' + ` read streams.

### Streams, redirection, and debugging

Every process starts with standard input, standard output, and standard error. Good command-line tools use stdout for normal results and stderr for diagnostics. This separation lets you redirect useful output to a file without hiding error messages, or redirect errors separately with ` + '`2>`' + `. A common debugging pattern is to run a command normally first, then redirect only after you know which stream contains the information you want.

Be careful with ` + '`>`' + ` because it overwrites. When experimenting, use temporary files or inspect filenames before redirecting. The lecture-code examples under ` + '`lecture_code/shell/outVsErr`' + ` and ` + '`lecture_code/shell/errPrints`' + ` are useful because they make stdout and stderr visible as separate channels rather than treating "printing" as one undifferentiated operation.

### PATH, permissions, and executable scripts

When you type a bare command name, Bash searches the directories in ` + '`PATH`' + `. It does not automatically search the current directory. That is why local programs are run as ` + '`./program`' + ` unless the directory containing them has been added to ` + '`PATH`' + `. The ` + '`./`' + ` prefix is not decoration; it is a relative path.

Executable permission is separate from file contents. A Python script can contain valid Python, but Unix will not execute it as a program unless the execute bit is set and the system knows which interpreter to use. The shebang line supplies the interpreter, and ` + '`chmod`' + ` supplies permission. This becomes important in assignments where small helper scripts are used to run tests or transform files.

### Bash scripts as small programs

A Bash script should be read like a program with inputs, outputs, conditions, loops, and failure modes. ` + '`$0`' + ` is the script name, ` + '`$1`' + `, ` + '`$2`' + `, and so on are arguments, and ` + '`$#`' + ` is the number of user-provided arguments. Validate argument counts before using them. Quote variables unless you deliberately want word splitting or glob expansion. In the ` + '`countword`' + ` script, unquoted variables work only under simple assumptions; filenames with spaces or words containing shell-special characters expose why quoting matters.
`,
  '02_c_pl.md': `
## Expanded Study Guide

### C as a lower-level high-level language

C is still a high-level language because you write source code rather than machine instructions. The difference from Python is that C exposes more of the machine model. Types have fixed sizes, variables have storage locations, integer overflow can matter, and the compiler produces a binary that the operating system can execute directly. This is why the first C program contains ideas that Python hid: headers, ` + '`main`' + `, return types, explicit formatted output, and an exit status.

When compiling with ` + '`gcc`' + `, remember that one command normally runs preprocessing, compilation, assembly, and linking. In this early lecture, you mostly see ` + '`gcc file.c -o program`' + `. Later, separate compilation splits those steps apart, but the foundation is already here: C source must become machine code before it can run.

### Number systems and representation

Binary, octal, decimal, and hexadecimal are different notations for values. The base tells you what each digit position means. Binary is central because computer storage is built from two-state units. Hexadecimal is central because it groups binary cleanly into four-bit chunks, which makes memory addresses and bit patterns easier to read.

Unsigned integers are interpreted as ordinary fixed-width binary numbers. Signed integers use two's complement on typical modern systems. Two's complement matters because it makes addition work uniformly for positive and negative integers and removes the double-zero problem found in simpler sign-bit representations. The cost is that fixed-width integers have limits. With finite bits, overflow is not a theoretical issue; it is part of the model.

### Types, characters, and formatted I/O

C's built-in types are not objects. An ` + '`int`' + `, ` + '`char`' + `, or ` + '`float`' + ` is stored according to a representation chosen by the implementation and the platform. A ` + '`char`' + ` is a small integer type, and character literals are numeric values interpreted through an encoding such as ASCII. This explains why arithmetic on characters can produce other characters.

` + '`printf`' + ` is not like Python's flexible ` + '`print`' + `. The format string tells ` + '`printf`' + ` how to interpret later arguments. If the specifier does not match the value, C will not protect you the way a dynamic language might. This is an early example of a recurring C theme: the programmer is responsible for keeping the contract correct.

### Control flow, functions, and memory layout

C uses braces for blocks and semicolons for statements. Functions have explicit return types and parameter types. Variables live in stack frames when they are local automatic variables. Function calls create new frames; returns destroy them. That stack-frame model will become essential for understanding why pass-by-value does not mutate caller variables, why returning pointers to local variables is invalid, and why heap allocation is introduced later.

Trace the small examples in ` + '`lecture_code/cpl/smallExamples`' + ` by asking three questions: what type is each value, where is it stored, and what does the next statement do to that stored value? That habit scales directly into pointers, arrays, dynamic memory, and C++ objects.
`,
  '03_pointers.md': `
## Expanded Study Guide

### Pointers as addresses plus type

A pointer stores a memory address, but its type says how to interpret the data at that address. ` + '`int *`' + ` means "address of an int"; ` + '`char *`' + ` means "address of a char"; ` + '`float *`' + ` means "address of a float." The address itself is just a number-like value, but C uses the pointed-to type for dereferencing and pointer arithmetic.

The address-of operator and dereference operator are opposites in the normal case: ` + '`&x`' + ` produces the address of ` + '`x`' + `, and ` + '`*p`' + ` accesses the object pointed to by ` + '`p`' + `. The most important step is realizing that ` + '`*p`' + ` is an lvalue when ` + '`p`' + ` points to valid writable memory. That is why ` + '`*p = 10`' + ` changes the original object rather than changing the pointer.

### Mutation through pointers

C passes arguments by value. If a function parameter is an ` + '`int`' + `, the function receives a copy. Mutating the parameter mutates only the copy. If the function receives an ` + '`int *`' + ` that points to the caller's variable, then dereferencing that pointer lets the function write to the caller's memory. The ` + '`times2`' + ` example is the cleanest demonstration: ` + '`times2(int x)`' + ` cannot change the caller's ` + '`x`' + `; ` + '`times2(int *p)`' + ` can.

This is also the reason ` + '`scanf("%d", &x)`' + ` needs ` + '`&x`' + `. ` + '`scanf`' + ` must write into your variable, so it needs the address of that variable. Forgetting the address is not a harmless syntax mistake; it gives ` + '`scanf`' + ` the wrong value to treat as an address.

### Arrays, decay, and pointer arithmetic

An array is a contiguous block of elements. A pointer is a variable that stores an address. They are related, but not identical. In most expressions, an array name evaluates to the address of its first element. When an array is passed to a function, it decays to a pointer, so the function loses the array's length information. That is why array-processing functions need an explicit length parameter or a sentinel convention.

Pointer arithmetic is scaled by the pointed-to type. If ` + '`p`' + ` is an ` + '`int *`' + `, then ` + '`p + 1`' + ` advances by one ` + '`int`' + `, not by one byte. The indexing expression ` + '`arr[i]`' + ` is built on this idea. It means "start at the first element address, move ` + '`i`' + ` elements, and dereference."

### Strings and input loops

C strings are null-terminated arrays of ` + '`char`' + `. They are not a separate string type. A string function keeps reading characters until it sees the null terminator. If an array of characters is missing that terminator, treating it as a string makes the program read beyond the intended memory.

Robust input loops must handle failed reads. If ` + '`scanf("%d", &x)`' + ` fails because the next character is not part of an integer, that character remains in the stream. Repeating the same failed read without consuming anything creates an infinite loop. The lecture-code input examples show the correct habit: check the return value, consume bad input when needed, and treat EOF as a separate condition.
`,
  '04_dynamic_mem.md': `
## Expanded Study Guide

### Why the heap changes the design space

Stack arrays require a size that is known and reasonable for the current stack frame. That is not enough for programs that read an unknown number of integers from input. The heap lets the program request storage at runtime, keep it after a function returns, and grow data structures when capacity runs out. This is the foundation for dynamic arrays, linked lists, trees, and many ADTs.

But heap flexibility creates a new contract: every successful allocation needs a clear owner, and that owner must eventually release the memory exactly once. The pointer value is not the same as ownership. Multiple pointers may store the same address, but the program still needs one coherent policy for who calls ` + '`free`' + `.

### Resizing arrays safely

The resize pattern has four steps: allocate a larger block, copy existing elements, free the old block, and update the active pointer and capacity. The order matters. If you free first, you destroy the data you meant to copy. If you allocate and then forget to update the caller's pointer, the new block is leaked and the old pointer may dangle.

Growing by one element is easy to write but expensive. Each growth copies the whole current array. Across many appends, this adds up to quadratic work. Doubling capacity makes resizing occasional enough that appending is amortized constant time. The array sometimes has unused slots, but that extra space is the price paid for much better performance.

### Lifetimes and invalid pointers

A pointer is valid only while the pointed-to object is alive. Stack objects die when the function returns. Heap objects die when freed. A pointer can become invalid even though it still contains the same bit pattern as before. This is why use-after-free bugs are dangerous: the address may still print normally, and dereferencing it may appear to work until unrelated allocations reuse that storage.

Setting a pointer to ` + '`NULL`' + ` after freeing it is defensive, but it only affects that one pointer variable. Any aliases still dangle. The deeper fix is designing ownership so aliases are understood and freed memory is not reused accidentally.
`,
  '05_cmd_line.md': `
## Expanded Study Guide

### ` + '`argc`' + ` and ` + '`argv`' + ` as a bridge from shell to C

The shell lecture teaches that command-line arguments are strings passed to a program at startup. This lecture shows the C representation of that idea. ` + '`argc`' + ` tells you how many strings were passed, and ` + '`argv`' + ` gives access to those strings. ` + '`argv[0]`' + ` is the program name, so user arguments begin at ` + '`argv[1]`' + `.

Because command-line arguments are strings, numeric arguments must be converted before arithmetic. The lecture-code examples under ` + '`lecture_code/cpl/multiDim/simpleArgs.c`' + ` and ` + '`multInts.c`' + ` show the usual pattern: validate the count, convert with a library function such as ` + '`atoi`' + ` when appropriate, and then use the result as a number. For production-quality code, more robust conversion than ` + '`atoi`' + ` is often preferred, but the lecture's goal is the memory shape of the arguments.

### Reading ` + '`char *argv[]`' + `

The spiral-rule discussion is not just syntax trivia. It helps you translate declarations into memory layouts. ` + '`char *argv[]`' + ` reads as an array of pointers to char, but as a function parameter the array part decays, so the real parameter type behaves like ` + '`char **argv`' + `. That means ` + '`argv`' + ` points to the first element of an array whose elements are ` + '`char *`' + ` values. Each ` + '`char *`' + ` points to the first character of a null-terminated string.

A pointer alone never tells you whether it points to one object or the first object in an array. You need convention and extra information. For ` + '`argv`' + `, ` + '`argc`' + ` supplies the outer length, and null terminators supply the inner string lengths.

### Two-dimensional arrays

A pointer-to-pointer matrix allocates one outer array of row pointers and then one inner array for each row. This layout makes ` + '`matrix[i][j]`' + ` convenient, but it is not one contiguous rectangle of integers. Rows can live in unrelated heap locations. That costs extra memory for the row pointers and can be worse for cache behavior.

A flat one-dimensional allocation stores ` + '`n * m`' + ` integers contiguously. The program manually translates row and column into an index with ` + '`i * m + j`' + `. This layout is often faster and simpler to free because there is only one allocation. The tradeoff is that you must consistently carry the width and use the correct indexing formula.
`,
  '06_mutation.md': `
## Expanded Study Guide

### Output parameters as extra return values

C functions return one value directly, but they can write many values through pointer parameters. This is not a trick; it is a standard interface style. A function can return the primary result and write secondary results into caller-provided storage, or it can return ` + '`void`' + ` and write every result through output parameters.

The ` + '`maxInfo`' + ` example is the right mental model. The maximum value and the index describe one computation, but they are different types. Returning one and writing the other through a pointer keeps the interface simple. The caller must pass the address of storage that will still exist after the function returns.

### Mutating caller-owned state

Every time a function needs to update caller state, ask what variable must change in the caller. If the caller's ` + '`len`' + ` must change, the function needs ` + '`&len`' + `. If the caller's ` + '`cap`' + ` must change, the function needs ` + '`&cap`' + `. If the caller's pointer variable ` + '`arr`' + ` must be reseated to a new heap block, the function needs the address of the pointer variable, so it needs an ` + '`int **`' + `.

This is the reason the first versions of ` + '`push`' + ` fail. They update local copies of ` + '`len`' + `, ` + '`cap`' + `, or ` + '`arr`' + `. Those local copies disappear when ` + '`push`' + ` returns. The fixed version takes pointers to every caller variable that may need to change.

### Double pointers without fear

A double pointer is just a pointer to a pointer. If ` + '`arr`' + ` in ` + '`main`' + ` has type ` + '`int *`' + `, then ` + '`&arr`' + ` has type ` + '`int **`' + `. Inside the function, ` + '`*arr`' + ` means "the caller's pointer variable." Therefore ` + '`(*arr)[i]`' + ` indexes the active integer array, while ` + '`*arr = newArr`' + ` changes which heap block the caller's pointer points to.

Parentheses matter because ` + '`[]`' + ` binds tightly. ` + '`(*arr)[i]`' + ` indexes the array pointed to by the caller's pointer. ` + '`*arr[i]`' + ` means something else and is almost certainly wrong for this design.
`,
  '07_structs.md': `
## Expanded Study Guide

### Why structs matter

Before structs, related values travel as long parameter lists. The rectangle collision example makes the danger obvious: width, height, x, and y values can be passed in the wrong order and still type-check because they are all integers. A struct gives the group a name and makes the relationship explicit. ` + '`struct Rect`' + ` is not four random integers; it is one rectangle value.

C structs are aggregate data, not objects in the Python sense. They do not have constructors or methods. They simply describe a memory layout: fields in declaration order, possibly with padding for alignment. This is enough to build useful data models, but it does not by itself protect invariants.

### Passing structs

Unlike arrays, structs are copied when passed by value. That means a function receiving ` + '`struct Rect r`' + ` gets its own copy. Mutating ` + '`r.x`' + ` changes only the copy. If the function should mutate the caller's rectangle, pass ` + '`struct Rect *`' + ` and use the arrow operator. If the function only needs to inspect a large struct, pass a pointer to ` + '`const`' + ` to avoid copying while preventing mutation.

The arrow operator is shorthand for dereference then member access. ` + '`p->x`' + ` means ` + '`(*p).x`' + `. This becomes a daily C idiom once linked lists and heap-allocated ADTs appear.

### ADTs and linked lists

The List ADT is the first place where structs, pointers, and dynamic memory combine into a design. A node stores data and a pointer to the next node. The list stores the head pointer and length. Operations such as add-to-front, indexed access, mutation, removal, and deletion are implemented as functions that preserve the list invariants.

The invariants matter more than the syntax. The length should match the number of nodes. Each ` + '`next`' + ` pointer should either point to a valid heap node or be ` + '`NULL`' + `. Removed nodes must be freed exactly once. If the client can freely edit fields, they can create cycles, point into stack memory, corrupt the length, or make deletion crash. That is why the next lecture moves toward headers and incomplete types for encapsulation.
`,
  '08_sep_comp.md': `
## Expanded Study Guide

### Translation units and interfaces

Once a program is split into files, each source file is compiled mostly on its own. The compiler needs enough information to type-check each file, but it does not need the full implementation of every function immediately. Headers provide that minimum information. Implementations live in ` + '`.c`' + ` files. Object files are later combined by the linker.

This separation is what lets a module behave like a black box. Client code includes the header, calls the functions, and links against the object file. It does not need to know how the module stores its data. For the List ADT, hiding ` + '`struct Node`' + ` and the full ` + '`struct List`' + ` definition prevents the client from violating invariants.

### Diagnosing build errors

A compiler error usually means one translation unit could not be understood: missing declaration, type mismatch, syntax error, incomplete type used where complete size is required. A linker error usually means compilation succeeded, but the final executable could not be assembled: missing ` + '`main`' + `, unresolved function definition, duplicate definitions, or object files not provided to the link command.

The ` + '`printArray.c`' + ` example demonstrates this exactly. The file can compile to an object file without ` + '`main`' + `. It cannot link into an executable by itself because executables need an entry point. Adding ` + '`main.o`' + ` and ` + '`printArray.o`' + ` to the final ` + '`gcc`' + ` command gives the linker all pieces.

### Headers as contracts

A header should be small, stable, and client-facing. Put declarations in the header, implementation details in the source file, and comments in the header when clients need behavior guarantees. If a helper function is only for the module's internal implementation, keep it out of the header. If a struct's fields must not be touched by clients, expose only ` + '`struct List;`' + ` and functions that operate on ` + '`struct List *`' + `.

The cost of hiding a type in C is that clients cannot allocate it directly on the stack because the compiler does not know its size. That is a feature for opaque ADTs but not for plain aggregate data such as a simple point. Decide based on invariants: expose simple data whose fields are the interface; hide data whose representation must be protected.
`,
  '09_cpp.md': `
## Expanded Study Guide

### C++ is not just C with extra syntax

The lecture explicitly warns against writing C-style C++. Although C++ inherits much syntax from C, good modern C++ uses different abstractions. Streams replace much direct ` + '`scanf`' + `/` + '`printf`' + ` usage. ` + '`new`' + ` and ` + '`delete`' + ` are type-aware allocation operators. Overloading lets functions and operators adapt to user-defined types. Classes and references become central later.

The compiler command changes to ` + '`g++`' + ` with ` + '`-std=c++17`' + `. Many warning flags remain useful. Keeping warnings as errors is especially valuable in C++ because accidental copies, missing return values, and type mismatches can indicate deeper ownership bugs.

### Streams and stream state

` + '`std::cin`' + `, ` + '`std::cout`' + `, and ` + '`std::cerr`' + ` are stream objects. Operators ` + '`>>`' + ` and ` + '`<<`' + ` are overloaded to read from or write to streams. The operator direction visually matches data flow. Unlike ` + '`scanf`' + `, the stream knows the target type from the variable on the right-hand side.

Failed reads set stream state bits. If the fail or bad bit is set, further operations do not proceed until the state is cleared. ` + '`cin.clear()`' + ` resets the flags; ` + '`cin.ignore()`' + ` removes input. EOF must be checked separately, or a loop that clears and ignores after every failure can run forever at end-of-file.

### Manipulators, allocation, and overloads

I/O manipulators mutate stream behavior. ` + '`std::hex`' + ` stays active until ` + '`std::dec`' + ` switches integer output back. ` + '`std::noskipws`' + ` changes whitespace handling and should be reset if later formatted reads expect ordinary whitespace skipping.

` + '`new T`' + ` allocates one ` + '`T`' + `; ` + '`new T[n]`' + ` allocates an array. The matching frees are ` + '`delete p`' + ` and ` + '`delete[] arr`' + `. Mixing the scalar and array forms is wrong. This pairing sets up later RAII lessons: manual ` + '`delete`' + ` is easy to forget, so classes should own and release resources automatically.

Function overloading picks among functions by parameter count and types. Operator overloading is the same idea applied to operators. The Vec3D examples show that operand order matters and that returning the right type makes expressions natural.
`,
  '10_refs.md': `
## Expanded Study Guide

### References as aliases

A reference is another name for an existing object. Once initialized, it cannot be reseated to refer to something else. Assignment through the reference assigns to the object, not to the reference itself. This is why ` + '`int &y = x; y = 10;`' + ` changes ` + '`x`' + `. Printing ` + '`&x`' + ` and ` + '`&y`' + ` gives the same address because there is only one underlying integer object.

The ampersand now has two separate meanings depending on context. In a type, it declares a reference. In an expression, it is still the address-of operator. Always read declarations and expressions separately before deciding what ` + '`&`' + ` means.

### Rules that fall out of aliasing

References must be initialized because an alias to nothing is meaningless. Ordinary lvalue references must bind to objects with stable storage, not temporary expression results, unless the reference is ` + '`const`' + `. You cannot have arrays of references or pointers to references because references are not required to occupy independent storage. You can, however, have references to pointers.

These rules are not arbitrary. They preserve the idea that a reference behaves like the referred-to object. If the language allowed reseating or uninitialized references, references would behave more like nullable pointers, which is not the model this lecture is building.

### Pass-by-reference and return-by-reference

Pass-by-reference gives a function direct access to caller data without pointer syntax at the call site. Use non-const references when mutation is intended. Use const references when avoiding copies of large values while promising not to mutate them. This is the standard C++ replacement for many C pointer-parameter patterns.

Returning a reference is powerful but dangerous. The referenced object must outlive the function call. Returning a reference to a local variable is the reference version of returning a pointer to dead stack memory. The ` + '`larger`' + ` example is safe because it returns a reference to one of the caller's variables. To keep aliasing after the return, the receiving variable must also be a reference, or the result is copied into a new object.

### I/O operators

The input operator can mutate a variable without ` + '`&`' + ` because it receives the target by reference. Custom input and output operators follow that pattern: input takes ` + '`istream &`' + ` and a mutable reference to the target object; output takes ` + '`ostream &`' + ` and a const reference to the object being printed. Both return the stream by reference so chaining continues to work.
`,
  '11_classes.md': `
## Expanded Study Guide

### Classes as data plus behavior

C structs group data; C++ classes group data and behavior. A method is a function that belongs to the class and receives an implicit ` + '`this`' + ` pointer to the object it is operating on. That implicit object is what makes ` + '`r.area()`' + ` different from ` + '`area(r)`' + ` even if both could compute the same result.

Objects are instances of class types. The class definition describes what fields and methods exist; each object stores its own field values. This distinction matters for constructors because constructing an object is not just assigning fields after the fact. The object goes through allocation, field initialization, and constructor-body execution.

### Constructors and member initialization lists

A constructor defines valid creation. If a rectangle cannot have non-positive width or height, the constructor should enforce that invariant immediately. A default constructor is appropriate only when a meaningful default object exists. Do not add one just to make syntax convenient if the default value would be invalid or misleading.

Member initialization lists initialize fields before the constructor body runs. They are required for ` + '`const`' + ` fields and references, and they are usually preferred for all fields. The initialization order is the declaration order inside the class, not the order written in the MIL. If one field initializer depends on another, declaration order matters.

### Access control and encapsulation

Private fields protect invariants after construction. Without private fields, client code can write invalid values directly and bypass the constructor's checks. ` + '`struct`' + ` and ` + '`class`' + ` are almost the same in C++; their default access differs. ` + '`struct`' + ` defaults public, and ` + '`class`' + ` defaults private.

Getters and setters should not be automatic. Provide them only when exact field access is part of the abstraction. If the client only needs to print a rectangle, provide an output operator rather than exposing every field. A setter should preserve invariants, and a getter should not return a non-const reference unless you really want to grant mutation access.

### Friends and separate implementation

Methods declared in the class can be defined later with ` + '`ClassName::methodName`' + `. That supports headers for interfaces and ` + '`.cc`' + ` files for implementations. Standalone operators such as ` + '`operator<<`' + ` are often better as non-member functions because the left operand is the stream. If they need private access, they can be declared as friends. Friendship is useful but should be limited because every friend weakens encapsulation.
`,
  '13_big5.md': `
## Expanded Study Guide

### Resource ownership creates special-member obligations

If a class owns a heap allocation, file handle, socket, or other resource, the compiler-generated special members are usually not enough. The default destructor may not release the resource. The default copy constructor and copy assignment operator copy pointer values rather than the pointed-to resource, producing shallow copies. Once two objects believe they own the same memory, double-free bugs become likely.

The linked-list ` + '`List`' + ` is a perfect example. The object stores a head pointer. Copying that pointer does not copy the nodes. A deep copy must allocate new nodes and duplicate the chain. Destruction must delete every node exactly once. Move operations can transfer the chain without copying because the source temporary is about to be discarded.

### Destructor and copy constructor

The destructor runs automatically at the end of an object's lifetime. For a recursive node design, deleting the head can delete the entire chain if each node destructor deletes its next node. This keeps ` + '`List::~List`' + ` simple, but it depends on the node destructor being correct.

The copy constructor creates a new independent object from an existing one. Its parameter must be a reference because passing by value would require a copy before the copy constructor could run. For linked lists, the node copy constructor can recursively copy the chain. After copying, mutating one list should not mutate the other.

### Copy assignment

Copy assignment is harder than copy construction because the target already owns resources. A naive assignment leaks the old chain by overwriting the head pointer. A second attempt may delete old memory before copying, which breaks self-assignment and can leave the object invalid if allocation fails.

Copy-and-swap solves these problems cleanly. First make a copy using the copy constructor. Then swap the current object's fields with the copy. When the local copy goes out of scope, its destructor frees the old resources that were swapped into it. This reuses tested copy logic and keeps the target object unchanged if the copy fails before the swap.

### Move operations and copy elision

Moves are optimization with ownership semantics. A move constructor steals the source object's resource pointer and resets the source to a harmless empty state. The source remains valid, so its destructor can run safely. Move assignment can often swap with the source. It must still preserve invariants and avoid leaks.

Copy elision means the compiler can sometimes construct an object directly in its final destination, avoiding a copy or move. You should understand it because it explains why print statements in constructors may appear fewer times than expected. You should not rely on elision to make an incorrect ownership design safe; the Big 5 still need to be correct when they are called.
`,
};

const extraQuestions = {
  '00_intro.txt': [
    ['Q-00_intro-09', 'Why is the discussion forum preferred for most course questions?', 'It lets answers help the whole class and creates a searchable record of common issues.'],
    ['Q-00_intro-10', 'Why does the grading breakdown matter when planning study time?', 'It shows that assignments, recurring practice, and exams all matter, so students should not rely on one assessment type to carry the course.'],
  ],
  '08_sep_comp.txt': [
    ['Q-08-10', 'Why can client code store a `struct List *` when `struct List` is incomplete?', 'The compiler knows the size of a pointer even when it does not know the size or fields of the pointed-to struct.'],
    ['Q-08-11', 'When should a struct definition be placed in a header instead of hidden in a `.c` file?', 'Place it in the header when clients are supposed to allocate the type directly or access its fields as part of the public abstraction.'],
  ],
  '10_refs.txt': [
    ['Q-10-09', 'Why is `int &z = x; z = y;` not reseating `z`?', 'Because assigning to a reference assigns to the object it aliases. `z` still aliases `x`, and the value of `y` is copied into `x`.'],
    ['Q-10-10', 'Why should an output operator usually take `const T &` for the object being printed?', 'Printing should not mutate the object, and passing by const reference avoids a copy while allowing temporaries and const objects.'],
  ],
  '11_classes.txt': [
    ['Q-11-10', 'Why is the member initialization list required for const fields?', 'Const fields must be initialized before the constructor body runs; assigning to them inside the body is too late.'],
    ['Q-11-11', 'Why can a friend output operator access private fields even though it is not a method?', 'The class declaration explicitly grants that standalone function access to its private members.'],
  ],
};

for (const [file, text] of Object.entries(supplements)) {
  const fullPath = path.join(root, 'summaries', file);
  let current = fs.readFileSync(fullPath, 'utf8');
  if (!current.includes(marker)) {
    current = `${current.trim()}\n\n${text.trim()}\n`;
    fs.writeFileSync(fullPath, current);
  }
}

for (const [file, questions] of Object.entries(extraQuestions)) {
  const fullPath = path.join(root, 'examquestions', file);
  let current = fs.readFileSync(fullPath, 'utf8').trim();
  for (const [id, question, answer] of questions) {
    if (!current.includes(`[${id}]`)) {
      current += `\n\n[${id}]\nQuestion: ${question}\nAnswer: ${answer}\n`;
    }
  }
  fs.writeFileSync(fullPath, `${current.trim()}\n`);
}

for (const file of fs.readdirSync(path.join(root, 'examquestions'))) {
  if (!/^\d\d_.*\.txt$/.test(file)) continue;
  const fullPath = path.join(root, 'examquestions', file);
  let current = fs.readFileSync(fullPath, 'utf8');
  current = current.replace(/^\[(\d\d_[^\]-]+-\d+)\]/gm, '[Q-$1]');
  fs.writeFileSync(fullPath, current);
}
