

class floatptr {
  float *p;
  int *count;
  void swap(floatptr &o);
 public:
  floatptr(float x);
  floatptr();
  ~floatptr(); // Destructor
  floatptr(const floatptr &o); // Copy Ctor
  floatptr &operator=(const floatptr &o); // Copy Assignment Operator
  floatptr(floatptr &&o); // Move Ctor
  floatptr &operator=(floatptr &&o); // Move assignment operator

  float &operator*();
};

