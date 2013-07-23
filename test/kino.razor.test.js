/// <reference path="../lib/kino.razor.js" />
/// <reference path="qunit/qunit.js" />


module("razor", {
    setup: function () {
        kino.razor.use('@');
    }
});

test("should convert single viariable", function () {
    var str = kino.razor("Hey, @name!", { name: 'kino' });
    equal(str, "Hey, kino!");
});

test("multiple variables", function () {
    var str = kino.razor("Hey, @a, @b, @c!", { a: 1, b: 2, c: 3 });
    equal(str, "Hey, 1, 2, 3!");
});

test("handle missing vlaue", function () {
    var templateStr = "Hey, @abc";
    var str = kino.razor(templateStr, {});
    equal(str, "Hey, ");
});

test("variables value like @abc", function () {
    var str = kino.razor("Hey, @a, @b, @c!", { a: "@b", b: "@c", c: "@a" });
    equal(str, "Hey, @b, @c, @a!");
});

test("javascript block test", function () {
    var templateStr = "@{var name='kino';}this is @name";
    var str = kino.razor(templateStr, {});
    equal(str, "this is kino");
});

test("condition syntax test", function () {
    var templateStr = "@if(1==0){<span>if you see this words,your test was failed!</span>}";
    var str = kino.razor(templateStr, {});
    equal(str, "");

    templateStr = "@if(1==0){hello}else{world}";
    str = kino.razor(templateStr, {});
    equal(str, 'world');

    templateStr = "@if(1==0){hello}else if(1==1){kino}else{world}";
    str = kino.razor(templateStr, {});
    equal(str, 'kino');
});

test("loop test", function () {
    var templateStr = "@for(var i = 0; i < 3; i++){<span>@i</span>}";
    var str = kino.razor(templateStr, {});
    equal(str, "<span>0</span><span>1</span><span>2</span>");

    templateStr = "@{var i = 3;}@while(i--){<span>@i</span>}";
    str = kino.razor(templateStr, {});
    equal(str, "<span>2</span><span>1</span><span>0</span>");
});


test("escape test", function () {
    var templateStr = "<input yyy='@Html.escape(test)' xxx=\"@Html.escape(otherAttr)\" />";
    var str = kino.razor(templateStr, { test: "kino's test", otherAttr: "\"one more test\"" });
    equal(str, "<input yyy='kino&#x27;s test' xxx=\"&quot;one more test&quot;\" />");
});

test("array param test", function () {
    var templateStr = "@for(var i = 0; i < data.length; i++){<span>@data[i]</span>}";
    var str = kino.razor(templateStr, {
        data: [1, 2, 3]
    });
    equal(str, "<span>1</span><span>2</span><span>3</span>");
});


test("mixture test", function () {
    var str = "<select>";
    str += "@for(var i = 0; i < data.length; i++){";
    str += "<option value='@data[i]'@if(selectedIndex == i){ selected }>@data[i]</option>";
    str += "}</select>";

    var html = kino.razor(str, {
        selectedIndex: 2,
        data: [1, 2, 3]
    });

    var equalStr = "<select><option value='1'>1</option><option value='2'>2</option>";
    equalStr += "<option value='3' selected >3</option></select>";
    equal(html, equalStr);
});


test("Given '@@' and '@}' then it should out put '@' and '}' character", function () {
    var templateStr = "{@name@@gmail.com@}";
    var str = kino.razor(templateStr, { name: 'kino' });
    equal(str, '{kino@gmail.com}');

    var templateStr2 = "{hello @@ and @}}";
    var str2 = kino.razor(templateStr2, { name: 'kino' });
    equal(str2, '{hello @ and }}');
});

test("pass one parameter to kino.razor() should return a template function", function () {
    var razor = kino.razor("hello!@name");
    equal(typeof razor, 'function');
});

test("Given a template function to kino.razor() then it should return a convented string", function () {
    var tf = kino.razor("hello!@name");
    var str = kino.razor(tf, { name: 'kino' });
    equal(str, 'hello!kino');
});

test("It should use new XXX() as variable", function () {
    var str = kino.razor("now is @new Date().getTime()", {});
    equal(/^now\sis\s\d+$/.test(str), true);
});



test("use custom symbol instead of '@'", function () {
    kino.razor.use("&");
    var str = kino.razor("&name@&email", { name: "kinogam", email: "gmail.com" });
    equal(str, "kinogam@gmail.com");

    kino.razor.use("$");
    var str = kino.razor("$name@$email", { name: "hello", email: "gmail.com" });
    equal(str, "hello@gmail.com");


});

test("should use style like @(name)", function () {
    var str = kino.razor("Hey, zzz@(name)zzz!", { name: 'kino' });
    equal(str, "Hey, zzzkinozzz!");
});

test("@(i) style should support operation", function () {
    var str = kino.razor("@(i+1)", { i: 1 });
    equal(str, "2");
});


module("bug fix", {
    setup: function () {
        kino.razor.use("@");
    }
});


test("fix bug with ')'", function () {
    var str = kino.razor("Address:(@Address)", { Address: "test load" });
    equal(str, "Address:(test load)");
});

test("support variable name like @rid_child", function () {
    var templateStr = "@{var r_child_id = 'rid_1';}<hello>@r_child_id</hello>";
    var result = kino.razor(templateStr, {});
    equal(result, "<hello>rid_1</hello>");
});
