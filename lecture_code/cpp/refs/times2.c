#include <iostream>
using namespace std;
void times2(int &x) {
  x = x*2;
}

int main() {
  int y = 5;
  times2(y);
  cout << y << endl;
}

