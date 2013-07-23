/// <reference path="testFlightData.js" />
/// <reference path="../lib/kino.razor.js" />

var benchmark = (function () {
    var bm = function (fn, loop) {
        ///<summary>
        ///性能测试
        ///</summary>
        ///<param name="fn" type="Function">
        ///
        ///</param>
        ///<param name="loop" type="Number">
        ///
        ///</param>

        var _loop = loop || 1;
        var startTime = new Date();
        for (var i = 0; i < _loop; i++)
            fn();
        var endTime = new Date();
        return { startTime: startTime, endTime: endTime, timespan: endTime.getTime() - startTime.getTime() };
    }

    if (typeof module != 'undefined' && module.exports) {
        module.exports = bm;
    }

    return bm;
})();

var addTestResult = function(fn, loop){
    var result = benchmark(fn, loop);
    var testRecord = document.createElement("div");
    testRecord.innerHTML = result.timespan;
    document.getElementById("benchmark_panel").appendChild(testRecord);
};

window.onload = function () {
    var tempStr = document.getElementById("temp_flight_list").innerHTML;
    var tempFn = kino.razor(tempStr);

    addTestResult(function () {

        kino.razor(tempFn, {
            flightInfo: testFlightData,
            buttonValue: "预订",
            getShowPrice: function () { return ""; },
            getFlyTimeStr: function () { return ""; },
            getDiscount: function () { return ""; }
        });

    }, 1000);
};

