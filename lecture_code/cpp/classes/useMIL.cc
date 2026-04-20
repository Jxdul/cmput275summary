#include <iostream>
using namespace std;

struct MultRow {
  int len;
  int *arr;

  MultRow() : len{50000}, arr{new int[len]} {
    for (int i = 0; i < len; ++i) arr[i] = i*2;
    for (int i = 0; i < len; ++i) {
      for (int j = 0; j < len; ++j) {
        arr[i] = arr[i]*arr[j];
      }
    }
  }

  MultRow(int size, int mul) : len{size}, arr{new int[len]} {
    for (int i = 0; i < len; ++i) arr[i] = i*mul;
  }
  MultRow(const MultRow &o) : len{o.len}, arr{new int[len]} {
    for (int i = 0; i < len; ++i) arr[i] = o.arr[i];
  }
  MultRow &operator=(const MultRow &o) {
    delete[] arr;
    len = o.len;
    arr = new int[len];
    for (int i = 0 ; i < len; ++i) arr[i] = o.arr[i];
    return *this;
  }
  ~MultRow() { delete[] arr; }
};


struct Foo {
  MultRow mr;
  int x;
  char c;
  #ifdef USEMIL
  Foo(int len, int mul, int x, char c) : mr{len, mul}, x{x}, c{c} {}
  #else
  Foo(int len, int mul, int x, char c) {
    mr = MultRow{len, mul};
    this->x = x;
    this->c = c;
  }
  #endif
};


int main() {
  int len, mul;
  cin >> len >> mul;
  Foo f{len, mul, 7, 'A'};
}
