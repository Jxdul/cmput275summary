#include <iostream>
#include <string>
#include <sstream>
using namespace std;

int main(int argc, char **argv) {
  if (argc < 2) {
    return 1;
  }
  // How to check if our argv[1] is an integer
  // and turn it into an int in C++ (not C)
  // and print it out multiplied by 2
  string s{argv[1]};
  istringstream ss{s}; // Input string stream, so construct a stream from the string s
  // so ss is now a stream I can read from with the input operator!
  int x;
  if (ss >> x) {  // If the read didn't fail, print out twice the int
    cout << x*2 << endl;
  } else { // If the read did fail, complain!
    cout << "I expected an int as the second argument you gave me: " << s << endl;
  }
}
