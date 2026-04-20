#include <vector>
#include <memory>
#include <iostream>

using namespace std;

int main() {
  vector<int> v{1, 2, 3, 4};
  for (int i = 0; i < v.size(); ++i) {
    cout << v[i] << endl;
  }
  v.emplace_back(10);
  for (int i = 0; i < v.size(); ++i) {
    cout << v[i] << endl;
  }
  shared_ptr<vector<int>> sp = make_shared<vector<int>>(10,2);
  shared_ptr<vector<int>> shallowCp = sp;
  (*shallowCp)[0] = 7;
  for (int i = 0; i < sp->size(); ++i) {
    cout << (*sp)[i] << endl;
  }
  unique_ptr<int> up = make_unique<int>(7);
  cout << *up << endl;
  *up = *up*2;
  cout << *up << endl;
  // copy ctor for unique pointers is deleted!!! Does not work!
  //unique_ptr<int> sup{up};
}
