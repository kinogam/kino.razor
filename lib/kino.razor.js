/// <reference path="../test/require.js" />

/*
 * JavaScript kino.razor 1.1.1
 * https://github.com/kinogam/kino.razor
 *
 * Copyright 2013, Kinogam
 *
 * Licensed under the GNU-AGPL license:
 * http://www.gnu.org/licenses/agpl-3.0.txt
 */

(function (exports) {
    'use strict';

    var _symbol = '@', _isEnableEmptyValue = true;

    var razor = function (template, model) {
        ///<summary>
        ///获取模板函数
        ///</summary>
        ///<param name="template" type="String">template string or template function</param>
        ///<param  name="model" type="[optional]Object">
        ///model
        ///</param>
        ///<param name="options" type="Object">
        ///options
        ///</param>
        ///<returns type="Function" />

        if (arguments.length == 1)
            return _getTemplateFunction(template);
        else {
            var func;
            if (typeof template === 'function')
                func = template;
            else
                func = _getTemplateFunction(template);
            return func.call(null, razor.HtmlHelper, model);
        }
    };

    var _getTemplateFunction = function (template, model) {
        var parseModel = {
            segments: [],
            segmentIndex: 0,
            conditionOpeningBraceCount: 0
        };

        //获取字符串和变量片段
        var segments = SegmentHelper.parse(parseModel, template);

        //获取模版函数正文
        var functionContent = ContentHandler.toFunctionContent(segments);

        return new Function('Html', 'm', functionContent);
    };

    razor.HtmlHelper = {
        escape: function (value) {
            return ('' + value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
        }
    };

    //片段类型枚举
    var SegmentTypeEnum = {
        String: 0,
        Variable: 1,
        ScriptBlock: 2
    };

    //正则集合
    var RegexCollection = {
        VariableFirstChar: /^[\(_a-zA-Z]/,
        Variable: /^(?:(?:\()(?:new\s+)?[_a-zA-Z0-9]+(?:\.|[-\+*\/^=<>?:]|[\[\(][^\]\)]*[\]\)]|[_a-zA-Z0-9]+)*(?:\))|(?:new\s+)?[_a-zA-Z0-9]+(?:\.|[\[\(][^\]\)]*[\]\)]|[_a-zA-Z0-9]+)*)/,
        ConditionAndLoop: /^(?:if|for|while)\s*\(/,
        ElseCondition: /^[\s\r\n\t]*else(?:\s*{|[\s\t]+if\()?/
    };

    //片段处理
    var SegmentHelper = {
        parse: function (parseModel, templateString) {

            var len = templateString.length;

            for (var i = 0; i < len; i++) {

                //从关键符号开始匹配
                var currentChar = templateString.substr(i, 1);

                if (currentChar === _symbol) {
                    //将前面的内容添加到片段数组
                    this._handleString(parseModel, templateString, parseModel.segmentIndex, i - parseModel.segmentIndex);

                    //获取关键符号的下个字符
                    var nextChar = templateString.substr(i + 1, 1);

                    if (nextChar === _symbol) {
                        this._handleEscape(parseModel, _symbol, parseModel.segmentIndex);
                        i = parseModel.segmentIndex - 1;
                    }
                    else if (nextChar === '}') {
                        this._handleEscape(parseModel, nextChar, parseModel.segmentIndex);
                        i = parseModel.segmentIndex - 1;
                    }
                    else if (nextChar === '{') {
                        //脚本块模式
                        this._handleScriptBlock(parseModel, templateString, i + 1);
                        //更新索引
                        i = parseModel.segmentIndex - 1;
                    }
                    else if (RegexCollection.VariableFirstChar.test(nextChar)) {

                        if (RegexCollection.ConditionAndLoop.test(templateString.substr(i + 1))) {
                            //条件或循环模式
                            this._handleCondition(parseModel, templateString, i + 1);
                        }
                        else {
                            //变量模式
                            this._handleVariable(parseModel, templateString, i + 1);
                        }
                        i = parseModel.segmentIndex - 1;
                    }
                }
                else if (currentChar === '}' && parseModel.conditionOpeningBraceCount > 0) {
                    //处理 } 符号闭合
                    this._handleCloseBrace(parseModel, templateString, i);

                    //如果后面的字符为\r \n 空格，然后接else 和 else if的话，则进行后续的逻辑处理
                    if (RegexCollection.ElseCondition.test(templateString.substr(parseModel.segmentIndex))) {
                        this._handleCondition(parseModel, templateString, i + 1);
                    }

                    i = parseModel.segmentIndex - 1;
                }
            }

            if (parseModel.segmentIndex < len) {
                this._handleString(parseModel, templateString, parseModel.segmentIndex, len - parseModel.segmentIndex);
            }

            return parseModel.segments;

        },
        _handleString: function (parseModel, templateString, startIndex, len) {
            if (len == 0) {
                return;
            }

            parseModel.segments[parseModel.segments.length] = {
                segmentType: SegmentTypeEnum.String,
                content: templateString.substr(startIndex, len)
            };
            parseModel.segmentIndex = startIndex + len;
        },
        _handleEscape: function (parseModel, char, index) {
            parseModel.segmentIndex = index + 2;
            parseModel.segments[parseModel.segments.length] = {
                segmentType: SegmentTypeEnum.String,
                content: char
            };
        },
        _handleVariable: function (parseModel, templateString, index) {
            var templateStringRemain = templateString.substr(index);
            var variableString = RegexCollection.Variable.exec(templateStringRemain)[0];

            //更新片段索引
            parseModel.segmentIndex = index + variableString.length;

            //将变量块添加到片段数组
            parseModel.segments[parseModel.segments.length] = {
                segmentType: SegmentTypeEnum.Variable,
                content: variableString
            };
        },
        _handleScriptBlock: function (parseModel, templateString, index) {
            //获取变量长度
            var variableLength = this._getScriptBlockLength(templateString, index);

            //更新片段索引
            parseModel.segmentIndex = index + variableLength;

            //将变量块添加到片段数组
            parseModel.segments[parseModel.segments.length] = {
                segmentType: SegmentTypeEnum.ScriptBlock,
                content: templateString.substr(index + 1, variableLength - 2)
            };

            parseModel.conditionOpeningBraceCount++;
        },
        _getScriptBlockLength: function (templateString, index) {
            var openingBraceCount = 0;
            for (var i = index; i < templateString.length; i++) {
                var currentChar = templateString.substr(i, 1);
                if (currentChar === '{') {
                    openingBraceCount++;
                }
                else if (currentChar === '}') {
                    if (--openingBraceCount === 0) {
                        return i - index + 1;
                    }
                    else {
                        openingBraceCount--;
                    }
                }
            };
            throw "no matches found }";
        },
        _handleCondition: function (parseModel, templateString, index) {
            var templateStringRemain = templateString.substr(index);
            var openningBraceIndex = templateStringRemain.indexOf('{');
            parseModel.segments[parseModel.segments.length] = {
                segmentType: SegmentTypeEnum.ScriptBlock,
                content: templateStringRemain.substr(0, openningBraceIndex + 1)
            };
            parseModel.segmentIndex = index + openningBraceIndex + 1;
            parseModel.conditionOpeningBraceCount++;
        },
        _handleCloseBrace: function (parseModel, templateString, index) {
            //将前面的内容添加到片段数组
            this._handleString(parseModel, templateString, parseModel.segmentIndex, index - parseModel.segmentIndex);

            //将 } 加入 script block 片段
            parseModel.segments[parseModel.segments.length] = {
                segmentType: SegmentTypeEnum.ScriptBlock,
                content: templateString.substr(index, 1)
            };

            parseModel.segmentIndex = index + 1;
            parseModel.conditionOpeningBraceCount--;
        }
    };







    var ContentHandler = {
        escape: function (code) {
            return code.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/[\n\r]/g, '');
        },
        toFunctionContent: function (segments) {
            var content = ["var __c=[];with(m||{}){"];
            for (var i = 0; i < segments.length; i++) {
                if (segments[i].segmentType === SegmentTypeEnum.String) {
                    content[content.length] = "__c[__c.length] = '" + this.escape(segments[i].content) + "';";
                }
                else if (segments[i].segmentType === SegmentTypeEnum.Variable) {
                    var variable = segments[i].content;
                    if (_isEnableEmptyValue) {
                        content[content.length] = "if(typeof " + variable + " !== 'undefined'){__c[__c.length] = " + variable + ";}";
                    }
                    else {
                        content[content.length] = "__c[__c.length] = " + variable + ";";
                    }
                }
                else if (segments[i].segmentType === SegmentTypeEnum.ScriptBlock) {
                    content[content.length] = segments[i].content;
                }
            }
            content[content.length] = "};return __c.join('');";
            return content.join('');
        }
    };




    razor.use = function (symbol) {
        _symbol = symbol;
        return this;
    };

    razor.enableEmptyValue = function (isEnableEmptyValue) {
        _isEnableEmptyValue = isEnableEmptyValue;
        return this;
    };

    // Module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = razor;
    }
    else {
        exports.kino = exports.kino ? exports.kino : {};
        exports.kino.razor = razor;
    }

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return razor;
        });
    }

})(this);