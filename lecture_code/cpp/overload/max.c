int max(int a, int b) {
  return a > b ? a : b;
}

float max(float a, float b) {
  return a > b ? a : b;
}


int main() {
  int a = 5, b = 10;
  float x = 3, y = 3.5;
  max(x,y);
  max(a,b);
}

