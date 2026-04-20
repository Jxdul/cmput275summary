#include <iostream>
#include <vector>
using namespace std;

template <typename UnFn, typename Collection>
void mutate_map(UnFn f, Collection &c) {
  for (auto &x: c) {
    x = f(x);
  }
}

int main() {
  vector<int> v;
  int x;
  while (cin >> x) v.emplace_back(x);
  mutate_map([](int z){
                        return z < 0 ? 0 : (z > 255 ? 255 : z);
                      }, v);
  for (auto y: v) {
    cout << y << " ";
  }
  cout << endl;
}
