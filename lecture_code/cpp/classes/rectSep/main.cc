#include "rect.h"
#include <iostream>
using namespace std;
int main() {
  Rect r{1, 2, 5, 10};
  cout << "r: " << r << endl;
  Rect q{1,2, -5, 0};
  //cout << "q: " << q << endl;
  Rect t;
  //cout << "t: " << t << endl;
  int &tw = t.getWidth();
  tw = -1;
  //cout << "t:" << t << endl;
}
