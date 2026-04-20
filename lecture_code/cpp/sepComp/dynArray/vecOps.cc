#include <iostream>
// vecOps.cc is getting TWO copies of list.h, one from explicitly including it
// and one from including vecOps.h which itself included list.h
#include "list.h"
// We could simply not include list.h... we know that vecOps.h will include it for us.
// That's fine right?
#include "vecOps.h"
using namespace std;
Vec::Vec(int x, int y, int z) { // Without explicitly initializing l in the MIL, it gets default constructed
  // that's fine in this case, as there's not a better (list initializer) constructor that exists
  l.push_back(x).push_back(y).push_back(z);
}

Vec Vec::operator+(Vec &o) {
  Vec v{*this};
  v.l[0] += o.l[0];
  v.l[1] += o.l[1];
  v.l[2] += o.l[2];
  return v;
}

std::ostream& operator<<(std::ostream &out, Vec o) {
  return out << "<" << o.l[0] << ", " <<o.l[1] << ", " << o.l[2] << ">";
}
