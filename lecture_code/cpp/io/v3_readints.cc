#include <iostream>
using namespace std;
int main() {
  int x = 0;
  int total = 0;
  while (cin>>x) {
    total += x;
  }
  cout << "Total: " << total << endl;
}
