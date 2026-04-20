#include <iostream>
// Typically you should /NOT/ employ using statements
// within the global space of your header files.
// Since the client will include your header file (which copies
// and pastes its contents) that will force the client to also
// use that namespace, polluting their global namespace when they
// might have identifiers which clash!!!!
class Rect {
  int x, y, w, h;
 public:
  Rect(int x, int y, int w, int h);
  Rect();
  int area();
  // Should not be a reference!!!
  int &getWidth();
  void setWidth(int nw);
  friend std::ostream &operator<<(std::ostream &, const Rect &);
};

