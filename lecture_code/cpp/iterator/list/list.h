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
  int& operator[](int i);
  int first();
  friend std::ostream& operator<<(std::ostream&, const List &l);
  int size() { return len; }
// Iterator pattern below
  class iterator {
    Node *cur;
    iterator(Node *n) : cur{n} {}
   public:
    iterator& operator++();
    int& operator*();
    bool operator!=(const iterator &);
    friend class List;
  };
  iterator begin();
  iterator end();
};
