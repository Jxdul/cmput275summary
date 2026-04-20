#include <iostream>
#include "ptr.h"
using namespace std;

void halveNumber(Intptr x) {
  *x = *x/2;
}

int main() {
  Intptr x = Intptr{};
  Intptr y = Intptr{};
  Intptr xcopy{x};
  cin >> *x >> *y;
  while (*x * *y > 100) {
    cout << "x: " << *x << endl;
    cout << "y: " << *y << endl;
    Intptr max = *x > *y ? x : y;
    halveNumber(max);
  }

}
