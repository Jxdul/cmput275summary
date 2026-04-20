#include <vector>
#include <iostream>
using namespace std;

class IncrementingAdder {
  int toAdd;
 public:
  IncrementingAdder() : toAdd{1} {}
  int operator()(int x) {
    return x + toAdd++;
  }
};

class UnaryAdder {
  int toAdd;
 public:
  UnaryAdder(int x) : toAdd{x} {}
  int operator()(int y) {
    return toAdd + y;
  }
};

template <typename UnFn, typename Collection>
void mutate_map(UnFn f, Collection &c) {
  for (auto &val : c) {
    val = f(val);
  }
}

float dbl(int x) {
  return x*2.5;
}

int main() {
  vector<int> v{1, 2, 3, 4, 5};
  mutate_map(dbl, v);
  for (int i = 0; i < v.size(); ++i) {
    cout << v[i] << " ";
  }
  cout << endl;
  IncrementingAdder f;
  cout << "f(1): " << f(1) << endl;
  cout << "f(1): " << f(1) << endl;
  cout << "f(1): " << f(1) << endl;
  IncrementingAdder q;
  cout << "q(1): " << q(1) << endl;
  mutate_map(IncrementingAdder{}, v);
  for (int i = 0; i < v.size(); ++i) {
    cout << v[i] << " ";
  }
  cout << endl;
  mutate_map(UnaryAdder{5}, v);
  for (int i = 0; i < v.size(); ++i) {
    cout << v[i] << " ";
  }
  cout << endl;
  mutate_map(UnaryAdder{7}, v);
  for (int i = 0; i < v.size(); ++i) {
    cout << v[i] << " ";
  }
  cout << endl;

}
