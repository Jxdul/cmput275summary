#include <iostream>

using namespace std;

void halveNumber(int *x) {
  *x = *x/2;
}

int main() {
  int *x = new int;
  int *y = new int;
  cin >> *x >> *y;
  while (*x * *y > 100) {
    cout << "x: " << *x << endl;
    cout << "y: " << *y << endl;
    int *max = *x > *y ? x : y;
    halveNumber(max);
  }
  delete x;
  delete y;
}
