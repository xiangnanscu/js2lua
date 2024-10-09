local arr = array {};
do
  local i = 0
  while i <= #arr do
    print(i)

    i = i + 1
  end
end;
do
  i = 0
  while i < 10 do
    print(1)

    i = i + 2
  end
end;
for _, e in ipairs(arr) do
  print(e); break
end;
for _, esPairs in ipairs(arr) do
  local a, b = unpack(esPairs);
  if b == 1 then goto continue end; print(a)
  ::continue::
end;
for key, __ in pairs(arr)
do
  print(key)
end;
while 1 do
  print("a")
end
