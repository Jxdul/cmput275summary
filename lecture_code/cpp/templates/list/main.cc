#include "list.h"
#include <iostream>
using namespace std;

List<int> incrementList(List<int> p) {
  for (int i = 0; i < p.getLen(); ++i) {
    p.setIth(i, p.getIth(i)+1);
  }
  return p;
}

int main() {
  List<int> l;
  l.cons(1).cons(2).cons(3);
  List<int> q = l; // same as List q{l}; constructing q, copy construction
  q.setIth(0, 10);
  cout << "Printing l and q after mutating q" << endl;
  cout << l << endl;
  cout << q << endl;
  // I want to make q be like l again...
  q = l;
  // Above, q already exists this is /NOT/ construction! thus
  // cannot call the copy constructor (and wouldn't want to!, q already
  // has data!) This is a copy /ASSIGNMENT/ And that is an operator.
  cout << "Printing l and q after setting q to l again" << endl;
  cout << l << endl;
  cout << q << endl;
  l.setIth(1, 5);
  cout << "Printing l and q after mutating l[1] = 5" << endl;
  cout << l << endl;
  cout << q << endl;
}
