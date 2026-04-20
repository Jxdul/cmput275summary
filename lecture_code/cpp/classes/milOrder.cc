#include <iostream>
using namespace std;

struct Foo {
  int x, y;
  Foo(int yp) : y{yp}, x{y} {}
};

int main() {
  Foo f{5};
  cout << "f.x: " << f.x << endl;
  cout << "f.y: " << f.y << endl;
}
