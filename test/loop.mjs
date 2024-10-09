const arr = [];
for (let i = 0; i <= arr.length; i++) {
  print(i);
}
for (i = 0; i < 10; i = i + 2) {
  print(1);
}
for (const e of arr) {
  print(e);
  break;
}
for (const [a, b] of arr) {
  if (b === 1) {
    continue;
  }
  print(a);
}

for (const key in arr) {
  print(key);
}

while (1) {
  print("a");
}
