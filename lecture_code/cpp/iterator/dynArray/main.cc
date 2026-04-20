#include "list.h"
#include <iostream>
using namespace std;

int main() {
  List l;
  int x;
  while (cin >> x) l.push_back(x);
  for (int &x : l) {
    cout << x << " ";
  }
  cout << endl;
  // You can even use auto here if you see fit
  for (auto x: l) {
    cout << x << " ";
  }
  cout << endl;
  // BUT! Be aware of what that means
  for (auto x: l) { // NOT a reference! just int x: l
    // so x is a local variable that is an int... a copy!
    x = x + 1;
  }
  for (auto x: l) {
    cout << x << " ";
  }
  cout << endl;
  for (auto &x: l) { // NOT a reference! just int x: l
    // so x is a local variable that is an int... a copy!
    x = x + 1;
  }
  for (auto x: l) {
    cout << x << " ";
  }
  cout << endl;
}
