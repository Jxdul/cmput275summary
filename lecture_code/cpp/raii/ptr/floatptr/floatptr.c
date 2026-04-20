#include "ptr.h"
#include <iostream>
#include <utility>
using namespace std;


// we have a int * field name p
// an int field named count
floatptr::floatptr(int x) : p{new float{x}}, count{new int{1}} {
  cout << "Constructed a new floatptr with value: " << *p << endl;
  cout << "Points at: " << p << endl;
  cout << "Count is: " << *count << endl;
}

floatptr::floatptr() : p{new float{0}}, count{new int{1}} {
  cout << "Constructed a new floatptr with value: " << *p << endl;
  cout << "Points at: " << p << endl;
  cout << "Count is: " << *count << endl;
}

floatptr::~floatptr() {
  cout << "Destructing an floatptr with ptr: " << p << endl;
  cout << "The current count including me is: " << *count << endl;
  --*count;
  if (!*count) {
    delete p;
    delete count;
  }
}

floatptr::floatptr(const floatptr &o) : p{o.p}, count{o.count} {
  cout << "Copy constructed point with pointer: " << p << endl;
  cout << "Count was: " << *o.count;
  ++*count;
  cout << " now: " << *count << endl;
}

void floatptr::swap(floatptr &o) {
  std::swap(p, o.p);
  std::swap(count, o.count);
}

floatptr &floatptr::operator=(const floatptr &o) {
  floatptr tmp{o};
  swap(tmp);
  return *this;
}

floatptr::floatptr(floatptr &&o) : p{o.p}, count{o.count} {
  ++*count;
}

floatptr &floatptr::operator=(floatptr &&o) {
  swap(o);
  return *this;
}

float &floatptr::operator*() {
  return *p;
}
