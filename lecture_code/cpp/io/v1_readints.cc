#include <iostream>
using namespace std;
int main() {
  int x = 0;
  int total = 0;
  cin >> x;
  while (!cin.fail()) {
    total += x;
    cin >> x;
  }
  cout << "Total: " << total << endl;
}
