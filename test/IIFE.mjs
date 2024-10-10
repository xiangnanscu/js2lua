(() => {
  print(1)
})();

(function() {
  print(2)
})();

(() => {
  print(1)
})()
(function() {
  print(2)
})();