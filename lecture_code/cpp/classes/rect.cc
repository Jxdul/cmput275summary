#include <iostream>
using namespace std;

struct Rect {
  int x, y, w, h;
  int area() {
    return w*h;
  }
  Rect(int x, int y, int w, int h) {
    cout << "4-int ctor called" << endl;
    this->x = x;
    this->y = y;
    this->h = h > 0 ? h : 1;
    this->w = w > 0 ? w : 1;
  }

  Rect() {
    cout << "Default ctor called" << endl;
    x = 0; y = 0;
    w = 1; h = 1;
  }

};


int main() {
  Rect a{1, 2, 3, 4};
  Rect b;
  a.w = -10;
}

