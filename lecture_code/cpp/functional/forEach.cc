#include <iostream>
#include <vector>
#include <algorithm>
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
  cout << v.capacity() << endl;
  mutate_map([](int z){
                        return z < 0 ? 0 : (z > 255 ? 255 : z);
                      }, v);

  for_each(v.begin()+2, v.end()-1, [](int x) { cout << x << " "; });
  cout << endl;
  for_each(v.begin()+2, v.end()-1, [](int &x) { x = x*2;} );
  cout << endl;

  for_each(v.begin(), v.end(), [](int x) { cout << x << " "; });
  cout << endl;
  vector<float> copy;
  for_each(v.begin(), v.end(), [&copy](int x) { copy.emplace_back(x+0.5); });
  for_each(copy.begin(), copy.end(), [](float x) { cout << x << " "; });
  cout << endl;

  for_each(v.begin(), v.end(), [&v](int x) { v.emplace_back(x); });
  for_each(v.begin(), v.end()-3, [](int x) { cout << x << " "; });
  cout << endl;

}
