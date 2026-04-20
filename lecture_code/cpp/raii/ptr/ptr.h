

class Intptr {
  int *p;
  int *count;
  void swap(Intptr &o);
 public:
  Intptr(int x);
  Intptr();
  ~Intptr(); // Destructor
  Intptr(const Intptr &o); // Copy Ctor
  Intptr &operator=(const Intptr &o); // Copy Assignment Operator
  Intptr(Intptr &&o); // Move Ctor
  Intptr &operator=(Intptr &&o); // Move assignment operator

  int &operator*();
};

