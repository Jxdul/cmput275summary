#include <iostream>
using namespace std;

int main() {
  int x = 5;
  int &y = x;
  cout << "x: " << x << endl;
  cout << "y: " << y << endl;
  x = 3;
  cout << "x = 3" << endl;
  cout << "x: " << x << endl;
  cout << "y: " << y << endl;
  y = 7;
  cout << "y = 7" << endl;
  cout << "x: " << x << endl;
  cout << "y: " << y << endl;
  cout << "&x: " << &x << endl;
  cout << "&y: " << &y << endl;

}
