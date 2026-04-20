#include <iostream>
#include <iomanip>
#include <cwctype>
using namespace std;

int main() {
  char c;
  char prev = ' ';
  int lc, wc, cc;
  lc = wc = cc = 0;
  cin >> noskipws;
  while (cin >> c) {
    if (iswspace(prev) && !iswspace(c)) ++wc;
    if (c == '\n') ++lc;
    ++cc;
    prev = c;
  }
  cout << '\t' << lc << '\t' << wc << '\t' << cc << endl;
}
