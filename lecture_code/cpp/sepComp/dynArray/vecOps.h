#ifndef VECOPS_H_
#define VECOPS_H_
#include <iostream>
#include "list.h"

class Vec {
  List l;
 public:
  Vec(int x, int y, int z);
  Vec operator+(Vec &o);
  friend std::ostream& operator<<(std::ostream &, Vec o);
};

#endif
