#include <iostream>
using namespace std;

struct Rational {
  int num, den;
};
// Further practice, make sure the results of addition
// and multiplication are always in their simplest form
Rational operator*(Rational lhs, Rational rhs) {
  Rational ret;
  ret.num = lhs.num*rhs.num;
  ret.den = lhs.den*rhs.den;
  return ret;
}

Rational operator+(Rational lhs, Rational rhs) {
  Rational ret;
  ret.num = lhs.num*rhs.den + rhs.num*lhs.den;
  ret.den = lhs.den*rhs.den;
  return ret;
}

ostream& operator<<(ostream& out, const Rational &rhs) {
  return out << "(" << rhs.num << "/" << rhs.den << ")";
}

istream& operator>>(istream& in, Rational &rhs) {
  in >> rhs.num;
  if (!in) return in;
  in >> std::ws;
  char c;
  if (in.peek() != '/') {
    in.setstate(std::ios::failbit);
    return in;
  }
  in >> c;
  in >> rhs.den;
  return in;
}



int main() {
  Rational r, q;
  cin >> r >> q;
  cout << r << "*" << q << ": " << r*q << endl;
  cout << r << "+" << q << ": " << r+q << endl;
}
