#include <stdio.h>
// Note! Absolutely paths are not ideal because moving this
// code to another computer (or in fact even just another user) in
// this case won't work!
#include "/cshome/rhackman/W26-CMPUT275/lib/list.h"

void printList2(struct List *l) {
  for (int i = 0; i < length(l); ++i) {
    printf("%d\n", ith(l, i));
  }
}

int main() {
  struct List *l = empty();
  int x;
  while (scanf("%d", &x) == 1) {
    cons(x, l);
  }
  printList(l);
  printf("\n");
  for (int i = 0; i < length(l); ++i) {
    setIth(l, i, ith(l, i)+1);
  }

  removeIth(l, 1);
  printList(l);
  printf("\n");
  l = freeList(l);
}
