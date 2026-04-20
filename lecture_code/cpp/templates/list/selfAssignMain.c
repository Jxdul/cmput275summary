#include <iostream>
#include "list.h"
using namespace std;

int main() {
  List l;
  l.cons(1).cons(2).cons(3);
  cout << l << endl;
  l = l;
  cout << l << endl;
}
