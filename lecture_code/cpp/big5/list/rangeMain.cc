#include "list.h"
#include <iostream>
using namespace std;
int main() {
  List l;
  l.cons(1).cons(2).cons(3);
  for (int &x : l) {
    cout << x << endl;
  }
}
