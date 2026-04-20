#include <stdlib.h>
#include <stdio.h>
int main() {
  float *arr = malloc(sizeof(int)*4); // If size of float and int are same we can get away this
  // but probably /not/ what we meant to do!
  int *p = malloc(sizeof(char)*11); // This is really bad! char is 1 byte, so we are allocating
  // 11 bytes but saying this a pointer to an integer. So if we treat p like an array it stores
  // 2.75 ints... not good!

  // Malloc does not know what type it is allocating it, just knows the argument we give it
  // which is a size_t that represents the number of bytes to allocate!

  // However, compiler let's us do the above because malloc is a function and c is statically
  // typed so malloc can be defined to have only one return type. That type is void *, and in
  // C a void * can be implicitly cast to /any/ type of pointer.
  free(arr);
  free(p);
  // C let's us get into trouble by casting pointers this way...
  int x = 5;
  void *pv = &x;
  float *px = pv;
  *px = 5.0;
  printf("%d\n", x);
}
