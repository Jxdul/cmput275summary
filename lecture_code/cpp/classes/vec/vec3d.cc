#include <iostream>
using namespace std;
struct Vec3D {
  int x, y, z;
  // When overloading an operator as a method
  // the /first/ operand is implicitly the object
  // pointed at by the this pointer
  Vec3D operator*(int s) {
    Vec3D result = *this;
//  Vec3D result{*this}; // same!!
    result.x = result.x*s;
    result.y = result.y*s;
    result.z = result.z*s;
    return result;
  }
  /*
  // Scalar multiplication with the first operand being
  // an int CANNOT be defined as a member function.
  // The implicit this object is /always/ the first operand
  // for operators overloaded as a member!!
  Vec3D operator*(int s, Vec3D v) {
    return v*s;
  }
  */

  Vec3D operator+(Vec3D rhs) {
    Vec3D result = {.x=x+rhs.x, .y=y+rhs.y, .z=z+rhs.z};
    return result;
  }

  int operator*(Vec3D rhs) {
    return x*rhs.x + y*rhs.y + z*rhs.z;
  }

};

Vec3D operator*(int s, Vec3D v) {
  return v*s;
}

void printVec(const Vec3D &v1) {
  cout << "[" << v1.x << ", " << v1.y <<", " << v1.z << "]";
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
