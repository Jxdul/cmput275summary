#include <iostream>

class List {
  struct Node {
    int data;
    Node *next;
    Node(int data, Node *next);
    ~Node();
    Node(const Node &o);
  };
  int len;
  Node *head;
  void swap(List &o);
 public:
  List(); // default ctor
  List(const List &l); // copy ctor
  List(List &&o); // move constructor
  ~List(); // destructor
  List &operator=(const List &o);
  List &operator=(List &&o);
  List &cons(int data);
  void setIth(int i, int elem);
  int getIth(int i);
  int first();
  friend std::ostream& operator<<(std::ostream&, const List &l);
  int getLen() { return len; }
};
