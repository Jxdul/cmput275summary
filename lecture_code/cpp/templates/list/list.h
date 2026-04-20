#include <iostream>




template <typename T>
class List {
  struct Node {
    T data;
    Node *next;
    Node(T data, Node *next);
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
  List &cons(T data);
  void setIth(int i, T elem);
  T &getIth(int i);
  T first();
  int getLen() { return len; }
  int size() { return len;}
  T &operator[](size_t i) { return getIth(i); }
};
#include <utility>

template <typename T>
List<T>::Node::Node(T data, Node *next) : data{data}, next{next} {}

template <typename T>
List<T>::Node::Node(const List::Node &o) : data{o.data},
                            next{o.next ? new Node{*o.next} : nullptr} {}

template <typename T>
List<T>::List() : len{0}, head{nullptr} {
}

template <typename T>
List<T>::~List() {
  delete head;
}

template <typename T>
List<T>::List(const List<T> &o) : len{o.len},
                    head{o.head ? new Node{*o.head} : nullptr} {
}

template <typename T>
List<T>::List(List<T> &&o) : len{o.len}, head{o.head} {
  // o is an rvalue, it's about to be destroyed that's /why/ we don't want
  // bother copying it! But if it gets destroyed then its destructor will run!
  // This will delete the list we just stole!
  // So, we have to cover our tracks
  o.head = nullptr;
  o.len = 0;
}

template <typename T>
List<T>& List<T>::operator=(const List<T> &o) {
  List<T> tmp{o};
  swap(tmp); // this->swap(tmp); same thing
  return *this;
}

template <typename T>
List<T>& List<T>::operator=(List<T> &&o) {
  swap(o);
  return *this;
}

template <typename T>
List<T>::Node::~Node() {
  delete next;
}

template <typename T>
void List<T>::swap(List<T> &o) {
  std::swap(len, o.len);
  std::swap(head, o.head);

}

template <typename T>
List<T>& List<T>::cons(T data) {
  head = new Node{data, head};
  ++len;
  return *this;
}

template <typename T>
void List<T>::setIth(int i, T elem) {
  Node *cur = head;
  for (int j = 0; j < i; ++j, cur=cur->next);
  cur->data = elem;
}

template <typename T>
T &List<T>::getIth(int i) {
  Node *cur = head;
  for (int j = 0; j < i; ++j, cur=cur->next);
  return cur->data;
}

template <typename T>
T List<T>::first() {
  return head->data;
}

