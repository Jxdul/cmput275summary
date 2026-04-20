# 01 Shell

## Big Picture
- This lecture treats the shell as a precise interface to the operating system, not as a magic text box that simply “runs commands.”
- The key topics are command parsing, file paths, streams, permissions, executable lookup, and bash scripting.
- The practical skill is prediction: before you press Enter, you should be able to explain what the shell will do, what the program will receive, and where output will go.

## Core Model
- The operating system manages access to hardware, provides a safe environment for running programs, and exposes the file system.
- The shell is a text interface for asking the OS to do work.
- A shell command is not one thing; it is a program name plus arguments plus shell syntax such as quoting, redirection, pipes, and substitutions.
- Two commands that look similar can behave very differently because the shell is allowed to transform the command line before the program sees it.

## What Happens When You Press Enter
- The shell reads the line you typed.
- It breaks the line into words, operators, and quoted sections.
- It performs expansions in the order Bash defines.
- It resolves redirections and pipes.
- It finds the executable.
- It launches the program with the chosen arguments and streams.

### Why this order matters
- The shell is not passing your raw text directly to the program.
- It is preprocessing the line into a run-ready command description.
- If you forget that, you will misdiagnose a lot of bugs.
- Many “why did that happen?” shell questions are really “what did Bash do before my program started?” questions.

## Reading Commands Precisely
- In `cat /usr/share/dict/words`, the program name is `cat`.
- `/usr/share/dict/words` is a command-line argument.
- The operating system passes that string to the program.
- Quoting the path, as in `cat "/usr/share/dict/words"`, still gives exactly one argument.
- The shell does not “understand” the argument semantically; it just decides where argument boundaries are.

### Why quotes matter
- Quotes control shell parsing, not program semantics.
- If a path contains spaces, quotes stop the shell from splitting it into multiple arguments.
- If you want literal text, quotes can also stop globbing and other expansions.
- If you want a variable to expand but still remain one argument, use double quotes.

### What the shell actually does
- Bash first performs expansions and syntax processing.
- It resolves quotes, variable references, command substitutions, globbing, and redirection.
- Then it finds the program to execute.
- Then it starts the program with a set of arguments and connected streams.
- This order explains many confusing bugs: the shell may rewrite the line before your program ever runs.

### Command-line arguments versus input
- `wc file.txt` gives `wc` a filename argument.
- `wc < file.txt` gives `wc` no filename argument and instead changes standard input.
- The program sees different data, so the behavior is not identical.
- This distinction matters everywhere in C and Python later in the course, because programs often have one path for arguments and another path for stdin.

### Stream trace for `wc`
- In `wc file.txt`, the shell does not open `file.txt` for the program. It simply tells `wc` the name of the file.
- In `wc < file.txt`, the shell opens the file itself and connects it to stdin.
- `wc` then reads from stdin as if the keyboard had been replaced by the file.
- If the input comes from a pipe or redirect, the program may not know or care where it originally came from.

## File Paths and Directory Thinking
- An absolute path begins with `/` and starts at the root directory.
- A relative path is interpreted from the current working directory.
- `.` means the current directory.
- `..` means the parent directory.
- `pwd` prints the current working directory.
- `cd` changes the current working directory.

### Tree model
- The file system is naturally understood as a tree.
- Directories are internal nodes.
- Non-directory files are leaves.
- A path is a route through that tree.
- Thinking in trees helps with nested paths like `/usr/share/dict/words` and relative paths like `../../foo.txt`.

### Worked path trace
- Suppose the current working directory is `/usr/home/rob/cmput275/slides`.
- `foo.txt` means “the file named `foo.txt` in the current directory.”
- `./foo.txt` means the same thing.
- `../foo.txt` means the `foo.txt` file in the parent directory.
- `../../././foo.txt` still means the same as `../../foo.txt`; the redundant `.` entries do not change the location.

## Streams: stdin, stdout, stderr
- Every program starts with three standard streams.
- stdin is the input stream.
- stdout is the normal output stream.
- stderr is the error output stream.
- On Unix, `Ctrl+D` signals end of input from the keyboard.

### Why streams matter
- Streams let programs work with text input and output without caring whether the data came from the keyboard, a file, a pipe, or a redirect.
- Good command-line tools keep regular output on stdout and diagnostics on stderr.
- That separation lets you save useful output while still seeing errors.

### Redirection
- `>` redirects stdout to a file.
- `<` redirects stdin from a file.
- `2>` redirects stderr to a file.
- `>` overwrites the target file if it already exists.

### Worked stream traces
- `printOut.py > out.txt`
  - stdout is redirected into `out.txt`.
  - stderr, if any, still goes to the terminal.
- `printErr.py 2> err.txt`
  - stderr is redirected into `err.txt`.
  - stdout still goes to the terminal.
- `printBoth.py > out.txt 2> err.txt`
  - stdout and stderr are split into separate files.
  - This is a clean way to prove the streams are independent.

### What the lecture code is showing
- `printOut.py` writes only to stdout, so `>` captures everything it produces.
- `printErr.py` writes only to stderr, so `2>` captures everything it produces.
- `printBoth.py` makes the distinction visible in one run.
- `readInput.py` demonstrates that stdin is just a stream; when no file is given, it can read what is typed or what another command sends through a pipe.

### Input redirection versus filename arguments
- `wc file.txt`
  - the program receives `file.txt` as an argument.
  - `wc` decides how to open and read it.
- `wc < file.txt`
  - the shell opens `file.txt` and connects its contents to stdin.
  - `wc` just reads stdin.
- This is a recurring exam idea: an argument is not the same thing as a stream.

## Exit Status
- Programs return exit statuses to the OS.
- Zero usually means success.
- Nonzero usually means failure.
- The exact meaning is program-defined.
- The shell stores the last exit status in `$?`.

### Why exit status matters in shell work
- Scripts can stop early when a command fails.
- A pipeline or command chain can react differently depending on success.
- `$?` is how you inspect the result of the most recent command after it finishes.
- The course examples treat exit status as the program’s way of reporting success, failure, or custom meaning.

### Why exit status matters
- Exit status is how programs signal success or failure to the shell and to other scripts.
- A script can branch on exit status to decide what to do next.
- Later in the course, this becomes part of defensive shell scripting and automated testing.

## Bash Variables, Quoting, and Expansion
- Assignment uses `x=10` with no spaces around `=`.
- Bash variables are strings.
- Reading a variable uses `$x` or `${x}`.
- Arithmetic uses `$((...))`.
- `$?` stores the exit status of the last command.

### The string model
- Bash variables are not typed numeric containers the way C variables are.
- The shell stores text and expands it when needed.
- Arithmetic expansion is a special case that asks Bash to interpret the text as a number.
- That is why quoting and expansion rules matter so much in shell code.

### Mental model
- Bash variables are not typed like C variables.
- The shell stores text and expands it when needed.
- Arithmetic expansion is a separate step; it is not the default meaning of `+`.

### Quoting rules
- Single quotes suppress shell expansion.
- Double quotes suppress globbing but still allow most expansions.
- If you want literal text, single quotes are the safest default.
- If you want variables to expand but do not want word splitting or globbing, use double quotes.

### Worked examples
- `echo "$x275"` can be surprising if the shell tries to interpret `x275` as a variable name.
- `echo "${x}275"` makes the boundary explicit.
- `*` on its own expands to matching filenames.
- `echo "*"` prints a literal asterisk because the quotes suppress globbing.

### A useful debugging habit
- If a variable-based command behaves strangely, print the variable first.
- Then print the command with quoting preserved.
- Then decide whether the bug is expansion, globbing, or plain bad data.
- Many shell bugs disappear when you check the actual value before the shell processes it.

## Combining Commands
- `$(...)` runs a command and substitutes its output inline.
- `mktemp` creates a temporary filename and the file itself.
- Pipes send stdout from the command on the left into stdin on the command on the right.
- Unix tools are designed to be composed.

### What command substitution really does
- The shell runs the inner command first.
- It captures the command’s stdout.
- It substitutes that text into the outer command line.
- This is why `$(mktemp)` can be embedded inside a larger command that needs a fresh path.

### Worked examples
- `$(mktemp)`
  - the shell runs `mktemp`.
  - it substitutes the resulting filename into the surrounding command.
  - this is useful when a command needs a unique temporary path.
- `cmd1 | cmd2`
  - stdout from `cmd1` becomes stdin for `cmd2`.
  - no temporary file is necessary.

### Debugging habit
- When a pipeline fails, test each stage by itself.
- Then connect them one at a time.
- This isolates whether the bug is in the producer, the consumer, or the stream connection.

### Practical pipeline reasoning
- The left command should emit the format the right command expects.
- If the consumer expects lines and the producer emits one giant string, the pipeline may still run but produce nonsense.
- If the producer prints diagnostics to stderr, a pipe will not carry them.
- That separation is often useful when debugging because errors stay visible.

## Executables, PATH, and Permissions
- Bash searches directories listed in `PATH` when you run a command by name.
- If a program is not in `PATH`, you must name it with a path such as `./myProgram`.
- `./` means “in the current directory.”
- `ls -l` shows file permissions.
- `chmod` changes permissions.
- A file still needs execute permission before the kernel will run it as a program.

### What the shell and kernel are doing
- The shell decides which file should be executed.
- The kernel decides whether the file may be executed.
- If the file is a script, the shebang selects the interpreter.
- If the file is a binary, the kernel loads it directly.

### PATH failure mode
- If you type `programName` and the shell says command not found, one possibility is that the executable exists but is not on PATH.
- Another is that you forgot `./` for a local executable.
- Another is that the file does not have execute permission.
- These are different problems even if the error message feels similar.

### What the machine is doing
- The shell finds the executable file.
- The kernel checks whether the file is executable.
- If the file is a script, the shebang tells Unix which interpreter to launch.
- If the file is a binary, the kernel loads and executes it directly.

### Worked example
- `gcc` produces binaries with the execute bit already set.
- That is why you can run the result right away with `./a.out`.
- If you compile to `hello_world`, the shell still will not search the current directory automatically, so `./hello_world` is the safe form.

### Permissions thinking
- `r` means read.
- `w` means write.
- `x` means execute.
- `chmod u+rw file` adds read and write permission for the owner.
- If you add a shebang but forget `x`, the script still will not run as a program.

## Scripts and Remote Shells
- A bash script is just a text file containing bash commands.
- `#!/bin/bash` marks it for bash execution.
- `$1`, `$2`, `$#`, and `$0` expose script arguments and counts.
- `if`, `for`, `while`, and functions let scripts express control flow.
- `ssh username@serverAddress` opens a shell on a remote machine.
- Temporary files on shared systems should be deleted promptly.

### Worked trace: `simplefor.sh`
- The loop iterates over `One`, `Two`, and `Three`.
- On each iteration, `x` is set to the next word.
- `echo` prints the current value.
- The loop body is small, but it demonstrates the full control-flow structure of a bash script.

### Worked trace: `simpleWhile.sh`
- `x=0` initializes the counter.
- The test `[ $x -le 10 ]` checks whether the loop should continue.
- `x=$((x+1))` increments the counter with arithmetic expansion.
- The loop stops when the condition becomes false.

### Reading `args.py`, `pyCat.py`, and `sillyAdder.py`
- `args.py` prints the raw argument list so you can see how Bash passed the command line into Python.
- `pyCat.py` reads filenames from `sys.argv[1:]` and falls back to stdin when no filenames are present.
- `sillyAdder.py` shows what a robust command-line program should do when it expects exactly two integers.
- These scripts mirror the lecture’s shell concepts because they expose the program side of the shell/program boundary.

### Lecture code connections
- `lecture_code/shell/args.py`
  - prints `sys.argv` so you can see how Python receives shell arguments.
  - this is the direct analog of how C receives `argc` and `argv`.
- `lecture_code/shell/pyCat.py`
  - reads files listed in `sys.argv[1:]`.
  - if there are no arguments, it falls back to stdin.
  - this mirrors the shell distinction between filename arguments and redirection.
- `lecture_code/shell/sillyAdder.py`
  - checks argument count before doing any work.
  - it is the right pattern when a tool expects exactly two numeric inputs.
- `lecture_code/shell/readInput.py`
  - reads from stdin line by line.
  - it shows the program side of a pipeline.
- `lecture_code/shell/outVsErr/printOut.py`
  - prints only to stdout.
- `lecture_code/shell/outVsErr/printErr.py`
  - prints only to stderr.
- `lecture_code/shell/errPrints/printBoth.py`
  - prints one line to each stream.
- `lecture_code/shell/shell_scripts/simplefor.sh`
  - shows a fixed `for` loop.
- `lecture_code/shell/shell_scripts/simpleWhile.sh`
  - shows a `while` loop and arithmetic expansion.

## Common Failure Narratives
- A student thinks `wc < file.txt` passes a filename. It does not; it changes stdin.
- A student runs `myProgram` from the current directory and gets “command not found” because `.` is not searched automatically.
- A student uses `>` when they meant to inspect output and accidentally overwrites a file.
- A student uses single quotes when they intended variable expansion, or double quotes when they intended literal text.
- A student writes a script that assumes a fixed number of arguments and then fails when it is called with the wrong count.
- A student forgets that `ssh` moves them onto another machine, then edits the wrong copy of a file.

## Exam Solution Patterns
- If the question involves a command, split it into program, arguments, redirections, and expansions.
- If the question involves a file path, decide whether it is absolute or relative and what directory the shell is currently in.
- If the question involves output, ask which stream is being used.
- If the question involves a script, check argument count, quoting, permissions, and interpreter selection.
- If the question compares two similar commands, identify whether the difference is in the program’s arguments or in the shell’s handling of input and output.

## Quick Reference
- Current directory: `pwd`
- Change directory: `cd path`
- Print file: `cat file`
- Stdout redirection: `cmd > file`
- Stdin redirection: `cmd < file`
- Stderr redirection: `cmd 2> file`
- Pipe: `cmd1 | cmd2`
- Temporary file: `mktemp`
- Inline command substitution: `$(cmd)`
- Bash variable assignment: `x=10`
- Bash arithmetic: `$((x + 1))`
- Last exit status: `$?`
- Remote shell: `ssh user@host`
- Make executable: `chmod +x file`
- Show permissions: `ls -l`

## Exam Questions
- Q: What is the difference between `wc file.txt` and `wc < file.txt`?
  A: The first passes a filename argument; the second feeds the file contents into stdin.
- Q: What does `2>` redirect?
  A: Standard error.
- Q: Why might `./program` be required instead of `program`?
  A: Because the current directory is not automatically searched through `PATH`.
- Q: What does a pipe do?
  A: It sends stdout from the command on the left to stdin of the command on the right.
- Q: What does `$(mktemp)` do?
  A: It runs `mktemp` and substitutes the resulting filename into the command.
- Q: Why can `printBoth.py > out.txt 2> err.txt` separate the two outputs cleanly?
  A: Because stdout and stderr are independent streams.
- Q: What is the purpose of a shebang line?
  A: It tells Unix which interpreter to use when the file is executed as a program.
- Q: Why is `echo "${x}275"` not always the same as `echo "$x275"`?
  A: Braces make the variable boundary explicit, so Bash does not try to interpret the combined text as a different variable name.
