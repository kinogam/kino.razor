[kino.razor](#) - an easy to use,razor style javascript template tool 
==================================================
How to use
--------------------------------------

use bower
```js
    bower install razor --save
```

use on a webpage
```html
	<script type="text/javascript" src="kino.razor.js"></script>
	//or minjs
	<script type="text/javascript" src="kino.razor.min.js"></script>
```

install in node.js
```js
	npm install razor
```

require js
```js
var razor = require("razor");
```

you can pass two parameters to kino.razor then get a converted string:
```js
	var str = kino.razor("Hey, @name!", { name: 'kino' });
	//result: "Hey, kino!"
```

pass one parameter to kino.razor() should return a template function
```js
    var r = kino.razor("hello!@name");
	//type of r is function
```


and automatic handle missing parameters
```js
	var templateStr = "Hey, @xxx";
    var str = kino.razor(templateStr, {});
	//result: "Hey, "
```

given a template function to kino.razor() then it should return a convented string(recommond,and get good performance)
```js
    var tf = kino.razor("hello!@name");
    var str = kino.razor(tf, { name: 'kino' });
	//result: "hello!kino"
```

set javascript code block
```js
    var templateStr = "@{var fname='kino';}this is @fname @lname";
    var str = kino.razor(templateStr, {lname:'jack'});
	//result: "this is kino jack"
```

use condition syntax
```js
    var templateStr = "@if(1==0){<span>if you see this word,your test is failed</span>}";
    var str = kino.razor(templateStr, {});
	//result: ""
```

loop, like while and for
```js
    var templateStr = "@for(var i = 0; i < 3; i++){<span>@i</span>}";
    var str = kino.razor(templateStr, {});
	//result: "<span>0</span><span>1</span><span>2</span>"

    templateStr = "@{var i = 3;}@while(i--){<span>@i</span>}";
    str = kino.razor(templateStr, {});
	//result: "<span>2</span><span>1</span><span>0</span>"
```

use @Html.escape for escape string to html
```js
    var templateStr = "<input yyy='@Html.escape(test)' xxx=\"@Html.escape(otherAttr)\" />";
    var str = kino.razor(templateStr, { test: "kino's test", otherAttr: "\"one more test\"" });
	//result: "<input yyy='kino&#x27;s test' xxx=\"&quot;one more test&quot;\" />"
```

@@ and @} will be escaped as @ and }
```js
    var templateStr = "{@name@@gmail.com@}";
    var str = kino.razor(templateStr, { name: 'kino' });
	//result: '{kino@gmail.com}'
```

use custom symbol instead of '@'
```js
    kino.razor.use("&");
    var str = kino.razor("&name@&email", { name: "kinogam", email: "gmail.com" });
    //"kinogam@gmail.com"

	kino.razor.use("$");
    var str = kino.razor("$name@$email", { name: "kinogam", email: "gmail.com" });
    //"kinogam@gmail.com"
``` 
support style @(name):
```js
	var str = kino.razor("Hey, zz@(name)zz!", { name: 'kino' });
	//result: "Hey, zzkinozz!"
```
