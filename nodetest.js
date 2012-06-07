var razor = require("./lib/kino.razor.js");

var x = razor("hello @name", {name: "kinogam"});
console.log(x);