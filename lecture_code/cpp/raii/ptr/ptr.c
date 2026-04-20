#include "ptr.h"
#include <iostream>
#include <utility>
using namespace std;


// we have a int * field name p
// an int field named count
Intptr::Intptr(int x) : p{new int{x}}, count{new int{1}} {
  cout << "Constructed a new intptr with value: " << *p << endl;
  cout << "Points at: " << p << endl;
  cout << "Count is: " << *count << endl;
}

Intptr::Intptr() : p{new int{0}}, count{new int{1}} {
  cout << "Constructed a new intptr with value: " << *p << endl;
  cout << "Points at: " << p << endl;
  cout << "Count is: " << *count << endl;
}

Intptr::~Intptr() {
  cout << "Destructing an intptr with ptr: " << p << endl;
  cout << "The current count including me is: " << *count << endl;
  --*count;
  if (!*count) {
    delete p;
    delete count;
  }
}

Intptr::Intptr(const Intptr &o) : p{o.p}, count{o.count} {
  cout << "Copy constructed point with pointer: " << p << endl;
  cout << "Count was: " << *o.count;
  ++*count;
  cout << " now: " << *count << endl;
}

void Intptr::swap(Intptr &o) {
  std::swap(p, o.p);
  std::swap(count, o.count);
}

Intptr &Intptr::operator=(const Intptr &o) {
  Intptr tmp{o};
  swap(tmp);
  return *this;
}

Intptr::Intptr(Intptr &&o) : p{o.p}, count{o.count} {
  ++*count;
}

Intptr &Intptr::operator=(Intptr &&o) {
  swap(o);
  return *this;
}

int &Intptr::operator*() {
  return *p;
}
