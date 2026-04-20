#include <vector>
#include <iostream>
#include "list.h"
using namespace std;

template <typename UnFn, typename Collection>
void mutate_map(UnFn f, Collection &c) {
  for (int i = 0; i < c.size(); ++i) {
    c[i] = f(c[i]);
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
  List<int> l;
  l.cons(9).cons(10).cons(11);
  mutate_map(dbl, l);
  for (int i = 0; i < l.size(); ++i) {
    cout << l[i] <<  " ";
  }
  cout << endl;
}
