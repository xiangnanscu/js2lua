// NOTE: both i++ and ++i means ++i to lua, don't use i++ in expression context!
// in statement context, use i = i ? 1
i++;
--i;
// otherwise use a callback
let a = --i
let b = i++
if (--i) {
  print(i)
}

