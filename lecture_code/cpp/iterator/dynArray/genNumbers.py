from random import randint
import sys

n = int(sys.argv[1])

for i in range(n):
  print(randint(-100*n, 100*n))
