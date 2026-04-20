#include <iostream>
using namespace std;
int * operator*(int *lhs, int *rhs) {
  cout << "Look ma, I'm multiplying pointers!" << endl;
}

int main() {
  int x = 5;
  int y = 10;
  (&x)*(&y);
}
