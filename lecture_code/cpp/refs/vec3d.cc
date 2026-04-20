#include <iostream>
using namespace std;
struct Vec3D {
  int x, y, z;
};

void printVec(Vec3D v) {
  cout << "{" << v.x << ", " << v.y << ", " << v.z << "}";
}

Vec3D operator*(Vec3D v, int s) {
  Vec3D result = v;
  result.x = result.x*s;
  result.y = result.y*s;
  result.z = result.z*s;
  return result;
}

Vec3D operator*(int s, Vec3D v) {
  return v*s;
}

Vec3D operator+(Vec3D lhs, Vec3D rhs) {
  Vec3D result = {.x=lhs.x+rhs.x, .y=lhs.y+rhs.y, .z=lhs.z+rhs.z};
  return result;
}

int operator*(Vec3D lhs, Vec3D rhs) {
  return lhs.x*rhs.x + lhs.y*rhs.y + lhs.z*rhs.z;
}

istream& operator>>(istream &in, Vec3D &rhs) {
  char c;
  in >> std::ws; // Eat up leading whitespace
  if (in.peek() != '[') {
    in.setstate(std::ios::failbit);
    return in;
  }
  in >> c; // Remove the found square bracket
  in >> rhs.x;
  if (!in) return in;
  in >> std::ws;
  if (in.peek() != ',') { // Next char after first int should be comma
    in.setstate(std::ios::failbit);
    return in;
  }
  in >> c; // Remove the found comma
  in >> rhs.y;
  if (!in) return in;
  in >> std::ws;
  if (in.peek() != ',') {
    in.setstate(std::ios::failbit);
    return in;
  }
  in >> c; // Remove comma
  in >> rhs.z;
  if (!in) return in;
  in >> std::ws;
  if (in.peek() != ']') {
    in.setstate(std::ios::failbit);
    return in;
  }
  return in >> c;
}

ostream& operator<<(ostream &out, const Vec3D &v) {
  return out << "[" << v.x << ", " << v.y <<", " <<v.z << "]";
}


int main() {
  Vec3D v1 = {.x = 5, .y = 10, .z= 15};
  Vec3D v2 = {.x = 1, .y = 2, .z = 3};
  cout << "v1: " << v1 << endl;
  cout << "v2: " << v2 << endl;
  cout << "v1*2: ";
  cout << v1 <<  endl;
  v1 = 3*v1;
  cout << "After v1 = 3*v1" << endl;
  cout << "v1: " << v1  << endl;
  cout << "v2: " << v2 << endl;
  cout << "v1 + v2: " << v1+v2 << endl;
  cout << "v1*v2: " << v1*v2 << endl;
  cout << 3 + 5 << endl;
  Vec3D w;
  cin >> w;
  cout << w << endl;
}
