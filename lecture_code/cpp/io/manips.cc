#include <iomanip>
#include <iostream>
int main() {
  std::cout << std::hex << 1997 << std::endl;
  std::cout << 52 << std::endl;
  std::cout << std::dec << 52 << std::endl;
  int x;
  std::cin >> std::hex >> x;
  std::cout << x << std::endl;
}
