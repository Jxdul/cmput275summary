#include <iostream>
using namespace std;

int &foo(int x, int y) {
  int *p = new int;
  *p = x + y;
  return *p;
}

int main() {
  int x = foo(5, 3);
  // Above is immediately a memory leak...
  // I've lost all ability to refer to the address of
  // the integer that foo allocated. I cannot free it.
  int &r = foo(7, 10);
  // r is a reference to the integer foo allocated on the heap
  // it behaves in all ways like that integer.
  // That is, I can get it's address!
  delete &r;
}
