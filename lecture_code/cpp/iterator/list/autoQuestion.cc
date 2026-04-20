#include <iostream>
using namespace std;


int main() {
  int x;
  cin >> x;
  int *p = &x;
  float y = x < 0 ? 0x45ul : 4.6f;
  cout << y << endl;
}
