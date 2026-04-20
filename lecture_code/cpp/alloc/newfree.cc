
int main() {
  int *p = new int;
  // int *p = new float; // Error! can't treat a float pointer like an int pointer!
  int *arr = new int[100]; // Enough space for 100 ints

  delete p;
  delete arr;
}
