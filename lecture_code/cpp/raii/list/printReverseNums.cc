#include "list.h"
#include <iostream>
using namespace std;
int main() {
  List l;
  int x;
  while (cin >> x) {
    l.cons(x);
  }
  cout << l << endl;
}
