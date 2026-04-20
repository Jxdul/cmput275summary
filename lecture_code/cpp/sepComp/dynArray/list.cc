#include <iostream>
#include "list.h"
#include <utility>
using namespace std;

List::List() : len{0}, cap{4}, arr{new int[cap]} {
}

List::~List() {
  delete[] arr;
}

List::List(const List &o) : len{o.len}, cap{o.cap},
                    arr{new int[cap]} {
  for (int i = 0; i < len; ++i) arr[i] = o.arr[i];
}

List::List(List &&o) : len{o.len}, cap{o.cap}, arr{o.arr} {
  o.arr = nullptr;
  // The way my code is written the below two lines are not /necessary/ for correctness
  // BUT we should always leave our objects in a valid state (which means our invariants hold)
  // My List class here has an invariant that len represents how many items are actually in the
  // array and capacity represents the actual size of the array. Since I am setting the array
  // to nullptr to avoid the temporary deleting the data I just stole when it goes out of scope
  // I SHOULD do the below as well to make sure the temporary still holds List invariants
  o.len = 0;
  o.cap = 0;
}

List& List::operator=(const List &o) {
  List tmp{o};
  swap(tmp); // this->swap(tmp); same thing
  return *this;
}

List& List::operator=(List &&o) {
  swap(o);
  return *this;
}


void List::swap(List &o) {
  std::swap(len, o.len);
  std::swap(cap, o.cap);
  std::swap(arr, o.arr);
}

List& List::push_back(int data) {
  if (len == cap) {
    int *newArr = new int[cap*2];
    for (int i = 0; i < len; ++i) newArr[i] = arr[i];
    cap = cap*2;
    delete[] arr;
    arr = newArr;
  }
  arr[len++] = data;
  return *this;
}

int &List::operator[](int i) {
  return arr[i];
}

int List::first() {
  return arr[0];
}


ostream& operator<<(ostream &out, const List &l) {
  if (l.len == 0) {
    return out << "[]";
  }
  out << "[" << l.arr[0];
  for (int i = 1; i < l.len; ++i) {
    out << ", " << l.arr[i];
  }
  return out << "]";
}


int* List::begin() {
  return arr;
}

int* List::end() {
  return arr+len;
}

