#include <iostream>
#include "list.h"
#include <utility>
using namespace std;
List inc(List p) {
  for (int i = 0; i < p.getLen(); ++i) {
    p.setIth(i, p.getIth(i) + 1);
  }
  return p;
}

int main() {
  List l;
  l.cons(1).cons(2).cons(3);
  cout << l << endl;
  List q{std::move(l)}; // force compiler to treat l like an rvalue
  cout << l << endl; // BAD! Never read from a "moved-from" object.
  // Moved from objects /should/ be left in a "valid but unspecified state"

  List newL{inc(l)};
}
