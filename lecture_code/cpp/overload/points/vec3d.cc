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


int main() {
  Vec3D v1 = {.x = 5, .y = 10, .z= 15};
  Vec3D v2 = {.x = 1, .y = 2, .z = 3};
  cout << "v1: "; printVec(v1); cout << endl;
  cout << "v2: "; printVec(v2); cout << endl;
  cout << "v1*2: ";
  printVec(v1*2); cout << endl;
  v1 = 3*v1;
  cout << "After v1 = 3*v1" << endl;
  cout << "v1: "; printVec(v1); cout << endl;
  cout << "v2: "; printVec(v2); cout << endl;
  cout << "v1 + v2: "; printVec(v1+v2); cout << endl;
  cout << "v1*v2: " << v1*v2 << endl;
  cout << 3 + 5 << endl;
}
