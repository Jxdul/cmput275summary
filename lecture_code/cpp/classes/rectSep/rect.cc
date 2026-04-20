#include "rect.h"
#include <iostream>
using namespace std;
// In an /implementation/ file there is no problem if you want
// to use a namespace since it only affects your code here so you
// know if it's okay in your context.
Rect::Rect(int x, int y, int w, int h) : x{x}, y{y}, w{w}, h{h} {}
Rect::Rect() : x{0}, y{0}, w{1}, h{1} {}
int Rect::area() {
  return w*h;
}

int &Rect::getWidth() { return w;}
void Rect::setWidth(int nw) { w = nw; }

ostream& operator<<(ostream& out, const Rect &r) {
  out << r.w << "*" << r.h << " rectangle at (" << r.x << ", " << r.y << ")";
  return out;
}
