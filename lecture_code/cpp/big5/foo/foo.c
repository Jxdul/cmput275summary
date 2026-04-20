#include <iostream>
using namespace std;

class Foo {
  int x;
 public:
  Foo() : x{0} {
    cout << "default ctor called" << endl;
  }
  Foo(int x): x{x} {
    cout << "int paramaterized foo ctor called" << endl;
  }
  Foo(const Foo &o) : x{o.x} {
    cout << "copy ctor called" << endl;
  }
  Foo(Foo &&o) : x{o.x} {
    cout << "move ctor called" << endl;
  }
  Foo &operator=(const Foo &o) {
    x = o.x;
    cout << "CAO called" << endl;
    return *this;
  }
  Foo &operator=(Foo &&o) {
    x = o.x;
    cout << "MAO called" << endl;
    return *this;
  }
  ~Foo() { cout << "dtor called" << endl; }
};

Foo makeFoo(int n) {
  Foo ret{n % 2 ? n*3 +1 : n/2};
  return ret;
}


int main() {
  Foo f{makeFoo(5)};
}
