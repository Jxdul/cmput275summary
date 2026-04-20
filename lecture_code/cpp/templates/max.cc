#include <iostream>
using namespace std;

struct Pair {
  int x, y;
  bool operator>(const Pair &other) {
    return x*y > other.x*other.y;
  }
};

ostream &operator<<(ostream &out, const Pair &rhs) {
  return out << "(" << rhs.x << ", " << rhs.y << ")";
}

template <typename T>
T myMax(T a, T b) {
  return a > b ? a : b;
}

int main() {
  double f, p;
  int x, y;
  Pair a{2, 5};
  Pair b{11, 1};
  cin >> f >> p >> x >> y;
  cout << "Max double was: " << myMax(f, p) << endl;
  cout << "Max int was: " << myMax(x, y) << endl;
  cout << "Max pair was: " << myMax(a, b) << endl;
}
