
// takes two objects and compares key-value pairs for equality
function areObjectsEqual(obj1, obj2) {
  var keys = Object.keys(obj1);
  // for each key in object 1
  for (var key of keys) {
    // if the value does not match both objects ...
    if (obj1[key] !== obj2[key]) {
      // ... return false
      return false;
    };
  };
};

arrArr.some(function(obj) {
  return obj.candy === "cane" })