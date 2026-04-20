#include <iostream>
#include "list.h"
#include <utility>
using namespace std;

List::Node::Node(int data, Node *next) : data{data}, next{next} {}

List::Node::Node(const List::Node &o) : data{o.data},
                            next{o.next ? new Node{*o.next} : nullptr} {}

List::List() : len{0}, head{nullptr} {
  cout << "List default ctor called" << endl;
}

List::~List() {
  delete head;
}

List::List(const List &o) : len{o.len},
                    head{o.head ? new Node{*o.head} : nullptr} {
  cout << "List copy ctor called" << endl;
}

List::List(List &&o) : len{o.len}, head{o.head} {
  // o is an rvalue, it's about to be destroyed that's /why/ we don't want
  // bother copying it! But if it gets destroyed then its destructor will run!
  // This will delete the list we just stole!
  // So, we have to cover our tracks
  o.head = nullptr;
  o.len = 0;
}

List& List::operator=(const List &o) {
  List tmp{o};
  swap(tmp); // this->swap(tmp); same thing
  return *this;
}

List& List::operator=(List &&o) {
  swap(o);
  return *this;
}

List::Node::~Node() {
  delete next;
}

void List::swap(List &o) {
  std::swap(len, o.len);
  std::swap(head, o.head);

}

List& List::cons(int data) {
  head = new Node{data, head};
  ++len;
  return *this;
}
void List::setIth(int i, int elem) {
  Node *cur = head;
  for (int j = 0; j < i; ++j, cur=cur->next);
  cur->data = elem;
}
int List::getIth(int i) {
  Node *cur = head;
  for (int j = 0; j < i; ++j, cur=cur->next);
  return cur->data;
}

int List::first() {
  return head->data;
}


ostream& operator<<(ostream &out, const List &l) {
  if (l.len == 0) {
    return out << "[]";
  }
  List::Node *cur = l.head;
  out << "[" << cur->data;
  for (cur = cur->next; cur; cur=cur->next) {
    out << ", " << cur->data;
  }
  return out << "]";
}
