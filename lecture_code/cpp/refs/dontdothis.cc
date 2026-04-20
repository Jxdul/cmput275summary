#include <iostream>
using namespace std;

void checkRef(int &x, int y) {
  void *p = (int **)&y; // bad!
  // If we WERE going to do casts in C++ that is also the wrong way to do it...
  // don't use C style casts in C++
  // Don't do any of this.
  cout << "8 bytes back from my y: " << (int **)(p-8) << endl;
  cout << "4 bytes forward from my y: "<< (int**)(p+4) << endl;
}


int main() {
  int q = 5;
  cout << "Address of q: " << &q << endl;
  checkRef(q, 7);
}
