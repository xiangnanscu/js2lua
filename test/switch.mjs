const c = 'v2'

switch (c) {
  case 'v1':
    print(1)
    break;
  default:
    break;
}

switch (c) {
  case 'v1':
    print(1)
    break
  case 'v2':
  case 'v3':
    print(2)
    break
  default:
    break;
}