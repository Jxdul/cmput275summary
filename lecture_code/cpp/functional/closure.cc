#include <iostream>
using namespace std;


int main() {
  int x = 7;
  int y = 2;
  auto g = [x](){ cout << "g(): " << x << endl;}; // x captured by //value//
  auto f = [&x,&y](){ cout << "f(): " <<  x*y << endl;}; // x and y captured by //reference//
  auto all = [=]() { cout << "all(): " << x << ", " << y << endl;};
  // Above means capture /everything/ by value
  auto refs = [&]() { cout << "refs(): " << x << ", " << y << endl;};
  // The above def'n of refs asks to capture /everything/ by reference.

  // Generally... I would avoid "capture all" clauses and would be explicit
  // about what I want to capture. Just a safer practice.
  g();
  f();
  all();
  refs();
  x = 10;
  y = 3;
  f();
  g();
  all();
  refs();
}
