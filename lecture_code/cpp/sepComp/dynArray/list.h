#ifndef LIST_H_
#define LIST_H_
#include <iostream>

class List {
  int len;
  int cap;
  int *arr;
  void swap(List &o);
 public:
  List(); // default ctor
  List(const List &l); // copy ctor
  List(List &&o); // move constructor
  ~List(); // destructor
  List &operator=(const List &o);
  List &operator=(List &&o);
  List &push_back(int data);
  int& operator[](int i);
  int first();
  friend std::ostream& operator<<(std::ostream&, const List &l);
  int size() { return len; }
  int *begin();
  int *end();
};
#endif
