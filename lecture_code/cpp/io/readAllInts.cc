#include <iostream>
using namespace std;
int main() {
  int x = 0;
  int total = 0;
  while (1) {
    if (cin >> x) {
      total += x;
      cout << "I saw " << x << endl;
    } else {
      // My integer read failed...
      // Need to figure out /why/ (EOF or just non-int character)
      // And then need to react accordingly
      if (cin.eof()) break;
      cin.clear();
      cin.ignore(); // removes immediate next character from the stream ("ignores" it)
    }
  }
  cout << "Total: " << total << endl;
}
