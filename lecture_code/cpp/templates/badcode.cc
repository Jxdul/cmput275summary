#include <vector>
#include <iostream>
using namespace std;


int main() {
  vector<int> v;
  for (int i = 0; i <3; ++i) {
    int x;
    cin >> x;
    v.emplace_back(x);
  }
  int *p = &v[2];
  cout << "Third item in my vector is: " << *p << endl;
  cout << "Address of third item: " << p << endl;
  int x;
  while (cin >> x) {
    v.emplace_back(x);
  }
  cout << "Third item in my vector (accessed through p) is: " << *p << endl;
  cout << "Third item in my vector (accessed through v[2]) is: " << v[2] << endl;
}
