#include <iostream>
using namespace std;

int main() {
  int x = 3;
  int y = 5;
  int z = 0;
  cin >> z;
  int &r = z < 0 ? x : y;
  r = 22;
  cout << "x: " << x << endl;
  cout << "y: " << y << endl;
}
