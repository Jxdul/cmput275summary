#include <iostream>
using namespace std;
struct Silly {
  char c;
};

void operator*(Silly lhs, int rhs) {
  for (int i = 0 ; i < rhs; ++i) {
    cout << lhs.c;
  }
}


int main() {
  Silly s {.c='x'};
  Silly v {.c='a'};
  s*3;
  v*5;
}
