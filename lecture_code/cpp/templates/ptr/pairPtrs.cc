#include "ptr.h"
#include <iostream>
using namespace std;

struct Pair {
  int x, y;
};

ostream &operator<<(ostream &out, const Pair &p) {
  return out << "(" << p.x << ", " << p.y << ")";
}
int main() {
  sharedptr<Pair> p{Pair{3, 5}};
  cout << *p << endl;
  sharedptr<Pair> cp = p;
  cout << *cp << endl;
}
