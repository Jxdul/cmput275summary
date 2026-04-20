#include <iostream>
using namespace std;

void printNTimes(int &x, int n) {
  while (n > 0) {
    cout << x << endl;
    --n;
  }
}

int main() {
  int y = 10;
  printNTimes(y, 5); // OK
  printNTimes(5, y); // Nope
  // can't pass rvalue 5 as an argument for
  // (non-const) lvalue reference x
}
