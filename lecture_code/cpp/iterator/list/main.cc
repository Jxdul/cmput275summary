#include "list.h"
#include <iostream>
using namespace std;

int main() {
  List l;
  int x;
  while (cin >> x) l.cons(x);
  for (List::iterator it = l.begin(); it != l.end(); ++it) {
    cout << *it << " ";
  }
  cout << endl;
  // The auto keyword asks the compiler to determine the type
  // based on the type of the expression used for initialization.
  // PLEASE PLEASE PLEASE do NOT use auto all over the place.
  // only use auto when it is very claer from context what the type
  // is, otherwise it makes your code unreadable
  for (auto it = l.begin(); it != l.end(); ++it) {
    cout << *it << " ";
  }
  cout << endl;
  // Now, the iterator pattern is so ubiquitous that the C++ standards committee
  // added built in support for just such iterations by way of the range based for loop syntax
  // The below can be read as "for each int &x in l"
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

}
