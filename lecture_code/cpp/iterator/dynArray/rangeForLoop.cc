#include <vector>
#include <iostream>
using namespace std;


int main() {
  vector<int> v;
  int x;
  while (cin >> x) v.emplace_back(x);
  for (vector<int>::iterator it = v.begin(); it != v.end(); ++it) {
    *it = *it + 1;
    cout << *it << " ";
  }
  /*
  for (int y : v) {
    cout << y << " ";
  }
  */
  cout << endl;
}
