#include <iostream>
using namespace std;

void printNTimes(const int &x, int n) {
  while (n > 0) {
    cout << x << endl;
    --n;
  }
}

int main() {
  int y = 10;
  printNTimes(y, 5); // OK
  printNTimes(5, y); // Also OK! I promised the compiler I won't mutate it
}
