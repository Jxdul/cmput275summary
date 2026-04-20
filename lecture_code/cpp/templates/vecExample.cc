#include <vector>
#include <iostream>
#include <string>
using namespace std;
int main() {
  int x{5};
  int y{10};
  vector<int> v{10, 2};
  vector<int> w(10, 2);
  for (int i = 0; i < v.size(); ++i) cout << " " << v[i];
  cout << endl;
  for (int i = 0; i < w.size(); ++i) cout << " " << w[i];
  cout << endl;
  string s = "hello there";
  string scat = s + "wooo!";
  cout << scat << endl;
  vector<string> k{"hello", "woo"};
  vector<string> m(15, "b");
  for (int i = 0; i < m.size(); ++i) cout << " " << m[i];
  cout << endl;

}
