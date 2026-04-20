#include <iostream>
using namespace std;

struct Student {
  int numCourses;
  float gpa;
  const int sID;
  Student(int numCourses, float gpa, const int sID) : numCourses{numCourses},
    gpa{gpa > 0 ? gpa : 0}, sID{sID} {}
};


int main() {
  Student s{7, 2.9, 1111111};
  cout << s.numCourses << " " << s.gpa << " " << s.sID << endl;
}
