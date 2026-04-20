#include <iostream>
#include "ptr.h"
using namespace std;

void halveNumber(sharedptr<int> x) {
  *x = *x/2;
}

int main() {
  sharedptr<int> x = sharedptr<int>{};
  sharedptr<int> y = sharedptr<int>{};
  sharedptr<int> xcopy{x};
  cin >> *x >> *y;
  while (*x * *y > 100) {
    cout << "x: " << *x << endl;
    cout << "y: " << *y << endl;
    sharedptr<int> max = *x > *y ? x : y;
    halveNumber(max);
  }

}
