#include <iostream>

using namespace std;

struct Rect {
  int x, y, w, h;
  int area() {
    return w*h;
  }
  int heightMultiplied(const Rect &other) {
    return h*other.h;
  }
};
...
r.heightMultiplied(q);
