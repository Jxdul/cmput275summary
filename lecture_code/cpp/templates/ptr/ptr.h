
#include <iostream>
#include <utility>

template <typename T>
class sharedptr {
  T *p;
  int *count;
  void swap(sharedptr &o);
 public:
  sharedptr(T x) : p{new T{x}}, count{new int{1}} {
    std::cout << "Constructed a new sharedptr with value: " << *p << std::endl;
    std::cout << "Points at: " << p << std::endl;
    std::cout << "Count is: " << *count << std::endl;
  }
  sharedptr();
  ~sharedptr(); // Destructor
  sharedptr(const sharedptr &o); // Copy Ctor
  sharedptr &operator=(const sharedptr &o); // Copy Assignment Operator
  sharedptr(sharedptr &&o); // Move Ctor
  sharedptr &operator=(sharedptr &&o); // Move assignment operator

  T &operator*();
};



template <typename T>
sharedptr<T>::sharedptr() : p{new T{}}, count{new int{1}} {

}

template <typename T>
sharedptr<T>::~sharedptr() {
  std::cout << "Destructing an sharedptr with ptr: " << p << std::endl;
  std::cout << "The current count including me is: " << *count << std::endl;
  --*count;
  if (!*count) {
    delete p;
    delete count;
  }
}

template <typename T>
sharedptr<T>::sharedptr(const sharedptr<T> &o) : p{o.p}, count{o.count} {
  std::cout << "Copy constructed point with pointer: " << p << std::endl;
  std::cout << "Count was: " << *o.count;
  ++*count;
  std::cout << " now: " << *count << std::endl;
}

template <typename T>
void sharedptr<T>::swap(sharedptr<T> &o) {
  using namespace std;
  swap(p, o.p);
  swap(count, o.count);
}

template <typename T>
sharedptr<T> &sharedptr<T>::operator=(const sharedptr<T> &o) {
  sharedptr<T> tmp{o};
  swap(tmp);
  return *this;
}

template <typename T>
sharedptr<T>::sharedptr(sharedptr<T> &&o) : p{o.p}, count{o.count} {
  ++*count;
}

template <typename T>
sharedptr<T> &sharedptr<T>::operator=(sharedptr<T> &&o) {
  swap(o);
  return *this;
}

template <typename T>
T &sharedptr<T>::operator*() {
  return *p;
}
