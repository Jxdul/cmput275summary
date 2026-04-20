#include <iostream>
using namespace std;

struct Point {
  int x, y;
};

struct A3DVec {
  int x, y;
  int z = 10;
};

ostream &operator<<(ostream &out, const Point &o) {
  out << "(" << o.x << ", " << o.y << ")";
  return out;
}

ostream &operator<<(ostream &out, const A3DVec &o) {
  out << "<" << o.x << ", " << o.y << ", " << o.z << ">";
  return out;
}

template <typename T>
T genObject(int a, int b) {
  return T{a, b};
}


int main() {
  Point p = genObject<Point>(5, 3);
  A3DVec f = genObject<A3DVec>(-1, 2);
  cout << p << f << endl;
}
