#include <iostream>
using namespace std;
#include "list.h"

template <typename T>
ostream &operator<<(ostream &out, List<T> l) {
  if (l.getLen() == 0) return out << "()";
  out << "(" << l.getIth(0);
  for (int i = 1; i < l.getLen(); ++i) out << ", " <<l.getIth(i);
  return out << ")";
}

int main() {
  List<int> l;
  l.cons(1).cons(2).cons(3);
  cout << l << endl;
  List<float> x;
  x.cons(2.5).cons(3.7).cons(7.7);
  cout << x << endl;
  List<List<int>> dl;
  List<int> q;
  q.cons(4).cons(5).cons(6);
  List<int> z;
  z.cons(7).cons(8).cons(9).cons(10).cons(11);
  dl.cons(z).cons(q).cons(l);
  cout << dl << endl;
  List<List<List<int>>> tl;
  tl.cons(dl).cons(dl).cons(dl);
  cout << tl << endl;
}
