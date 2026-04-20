#include <iostream>
#include <functional>
using namespace std;

std::function<int(int)> badderGenerator(int x) {
  return [&x](int y) { return x+y;}; // BAD! Capturing x by reference
  // when x is a local variable!!! As soon as this function returns the
  // returned function object stores a dangling reference!
}

std::function<int(int)> adderGenerator(int x) {
  return [x](int y) { return x+y;};
}


int main() {
  auto f = adderGenerator(5);
  cout << "f(3): " << f(3) << endl;
  auto g = adderGenerator(7);
  cout << "f(3): " << f(3) << endl;
  cout << "g(3): " << g(3) << endl;
}
