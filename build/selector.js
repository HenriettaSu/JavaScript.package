/**
 * This file depends on 'Array.js' and 'Element.js'
 */
(function (global) {
    var supportCompare = document.compareDocumentPosition,
        deletedIds = [],
        push = deletedIds.push,
        $,
        eventCache = {},
        cacheToken = [],
        supportInnerHTML = (function () {
            var table = document.createElement('table'),
                tbody = document.createElement('tbody');
            table.appendChild(tbody);
            try {
                tbody.innerHTML = '<tr></tr>';
            } catch (e) {
                return false;
            } finally {
                table = null;
                tbody = null;
            }
            return true;
        })(),
        isUnderIE9 = (function () {
            return navigator.appName === 'Microsoft Internet Explorer' && parseInt(navigator.appVersion.split(';')[1].replace(/[ ]/g, '').replace('MSIE', '')) < 9;
        })();

    function getSelectorType (selector) {
        var l = selector.charAt(0),
            type,
            selectorName;
        if (l === '#') {
            type = 'id';
            selectorName = selector.substring(1);
        } else if (l.match(/[a-zA-Z]/) || selector === '*') {
            type = 'tag';
            selectorName = selector;
        } else if (l === '.') {
            type = 'class';
            selectorName = selector.substring(1);
        }
        return {
            type: type,
            selectorName: selectorName
        };
    }
    function getSibling (el, dir) {
        do {
            el = el[dir];
        } while (el && el.nodeType !== 1);
        return el;
    }
    function getDir (elem, dir) {
        var matched = [];
        while ((elem = elem[dir]) && elem.nodeType !== 9) {
            if (elem.nodeType === 1) {
                matched.push(elem);
            }
        }
        return matched;
    }
    function makeCache (el, evt, handler, delegate, selector) {
        var token,
            i,
            e,
            len,
            type = selector ? 'delegateEvents' : 'events',
            tempEventType,
            tempEvent,
            delegateEvent;
        if (selector) {
            delegateEvent = {
                handler: handler,
                delegate: delegate
            };
        }
        function noEvent () {
            tempEventType = eventCache[token][type] = {};
            if (selector) {
                tempEventType[evt] = {};
                tempEventType[evt][selector] = [delegateEvent];
            } else {
                tempEventType[evt] = [handler];
            }
        }
        for (i = 0; i < cacheToken.length; i++) {
            token = cacheToken[i];
            e = eventCache[token];
            if (e.el === el) { // 元素已經在緩存裡
                if (!e[type]) { // 緩存裡的元素沒有同樣的事件
                    noEvent();
                    return;
                }
                tempEvent = e[type][evt];
                if (selector) {
                    tempEvent[selector].push(delegateEvent);
                } else {
                    if ($.array.inArray([handler], tempEvent)) {
                        return;
                    }
                    (tempEvent || []).push(handler);
                }
                return;
            }
        }
        len = cacheToken[cacheToken.length - 1] >= 0 ? cacheToken[cacheToken.length - 1] : -1;
        token = len + 1;
        cacheToken.push(token);
        eventCache[token] = {
            el: el
        };
        noEvent();
    }
    function addEvent (el, evt, handler, useCapture) {
        if (el.addEventListener) {
            return el.addEventListener(evt, handler, useCapture);
        } else if (el.attachEvent) {
            return el.attachEvent('on' + evt, handler);
        }
        el['on' + evt] = handler;
    }
    function removeEvent (el, evt, handler, useCapture) {
        if (el.removeEventListener) {
            return el.removeEventListener(evt, handler, useCapture);
        } else if (el.detachEvent) {
            return el.detachEvent('on' + evt, handler);
        }
        el['on' + evt] = null;
    }
    function cleanEvent (el) {
        var i,
            e,
            token,
            events,
            evt,
            delegateEvents,
            delegateEvt,
            delegateEl,
            j,
            k,
            handler;
        for (i = 0; i < cacheToken.length; i++) {
            token = cacheToken[i];
            e = eventCache[token];
            if (e.el === el) {
                events = Object.keys(e.events);
                delegateEvents = Object.keys(e.delegateEvents);
                for (j = 0; j < events.length; j++) {
                    evt = events[j];
                    for (k = 0; k < e.events[evt].length; k++) {
                        handler = e.events[evt][k];
                        removeEvent(el, evt, handler);
                    }
                }
                for (j = 0; j < delegateEvents.length; j++) {
                    evt = delegateEvents[j];
                    delegateEvt = e.delegateEvents[evt];
                    for (delegateEl in delegateEvt) {
                        if (delegateEvt.hasOwnProperty(delegateEl)) {
                            for (k = 0; k < delegateEvt[delegateEl].length; k++) {
                                handler = delegateEvt[delegateEl][k].delegate;
                                removeEvent(el, evt, handler);
                            }
                        }
                    }
                }
                delete eventCache[token];
                cacheToken.splice(i, 1);
                break;
            }
        }
    }
    function destoryElement (el, destoryRoot) {
        var temp,
            child;
        while (child = el.firstChild) {
            if (child.nodeType === 1) {
                cleanEvent(child);
                $.element.remove(child);
            } else {
                temp = el.removeChild(child);
                temp = null;
            }
        }
        if (destoryRoot) {
            cleanEvent(el);
            temp = el.parentNode.removeChild(el);
            temp = null;
        }
    }
    function getInnerHTML (el) {
        var innerHTML = el.innerHTML,
            regOne,
            regTwo,
            text;
        if (!isUnderIE9) {
            return innerHTML;
        }
        // Support: IE < 9
        regOne = /(\s+\w+)\s*=\s*([^<>"\s]+)(?=[^<>]*\/>)/ig;
        regTwo = /"'([^'"]*)'"/ig;
        innerHTML = innerHTML.replace(regOne, '$1="$2"').replace(regTwo, '\"$1\"');
        text = innerHTML.replace(/<(\/?)(\w+)([^>]*)>/g, function (match, $1, $2, $3) {
            if ($1) {
                return '</' + $2.toLowerCase() + '>';
            }
            return ('<' + $2.toLowerCase() + $3 + '>').replace(/=(("[^"]*?")|('[^']*?')|([\w\-\.]+))([\s>])/g, function (match2, $1, $2, $3, $4, $5, position, all) {
                if ($4) {
                    return '="' + $4 + '"' + $5;
                }
                return match2;
            });
        });
        return text.replace(/<\/?([^>]+)>/g, function (l) {
            return l;
        });
    }
    function isArrayLike (obj) {
        var length = !!obj && 'length' in obj && obj.length,
            type = getType(obj);
        if (type === 'function') {
            return false;
        }
        return type === 'array' || length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj;
    }
    function eachDom (arr, cb) {
        var that = arr,
            i,
            el;
        for (i = 0; i < that.length; i++) {
            el = that[i];
            cb.call(el);
        }
    }
    function ById (selector, dom) {
        var ret = dom.getElementById(selector);
        return ret ? [ret] : [];
    }
    function ByClass (selector, dom) {
        var css,
            className,
            els,
            arr = [];
        if (dom.getElementsByClassName) {
            className = selector.replace('.', ' ');
            arr = dom.getElementsByClassName(className);
        } else {
            css = selector.split('.');
            els = dom.getElementsByTagName('*');
            eachDom(els, function () {
                var el = this,
                    classList = $.element.getClass(el).split(' ');
                if ($.array.inArray(css, classList)) {
                    arr.push(el);
                }
            });
        }
        return arr;
    }
    function ByTag (selector, dom) {
        var s,
            tag,
            tagList,
            i,
            a,
            b,
            className,
            eachTag,
            notMatch = [];
        if (selector.indexOf('.') < 0) {
            return dom.getElementsByTagName(selector);
        }
        s = selector.split('.');
        tag = s[0];
        s.shift();
        tagList = $.fn.merge([], dom.getElementsByTagName(tag));
        for (i = 0; i < s.length; i++) {
            className = s[i];
            a = 0;
            b = 0;
            while (eachTag = tagList[a++]) {
                if (!$.element.hasClass(eachTag, className)) {
                    b = notMatch.push(a - 1);
                }
            }
            while (b--) {
                tagList.splice(notMatch[b], 1);
            }
        }
        return tagList;
    }
    function byOneSelector (e, dom) {
        var tc = getSelectorType(e),
            type = tc.type,
            selectorName = tc.selectorName;
        switch (type) {
            case 'id':
                return ById(selectorName, dom);
            case 'tag':
                return ByTag(selectorName, dom);
            case 'class':
                return ByClass(selectorName, dom);
        }
    }
    function getNode (selector, dom) {
        var s,
            ss,
            i,
            eachS,
            e,
            ssObj = {},
            arr = [],
            temp;
        if (!selector) {
            return;
        }
        if (typeof selector === 'string') {
            s = selector.trim();
            if (s.indexOf(',') < 0) {
                return byOneSelector(s, dom);
            }
            ss = s.split(',');
            for (i = 0; i < ss.length; i++) {
                eachS = ss[i];
                e = eachS.trim();
                if (!ssObj[e]) {
                    temp = byOneSelector(e, dom);
                    ssObj[e] = true;
                    arr = $.fn.merge(arr, temp);
                }
            }
        } else if (selector.nodeType) {
            arr = this;
        }
        return $.fn.unique(arr);
    }
    function filterOrNot (els, selector, not) {
        var select = selector ? selector.trim() : '',
            arr = [],
            el;
        if (!select) {
            return not ? els : arr;
        }
        els.each(function () {
            el = this;
            if ($.element.is(el, select) === !not) {
                arr.push(el);
            }
        });
        return arr;
    }

    $ = (function (window) {
        var $ = function (selector, dom) {
            return new $.fn.init(selector, dom);
        };

        $.fn = $.prototype = {
            constructor: $,
            selector: '',
            length: 0,
            merge: function (first, second) {
                var len = +second.length,
                    j = 0,
                    i = first.length;
                if (len === second.length) {
                    while (j < len) {
                        first[i++] = second[j++];
                    }
                } else {
                    while (second[j] !== undefined) {
                        first[i++] = second[j++];
                    }
                }
                first.length = i;
                return first;
            },
            each: function (cb) {
                eachDom(this, cb);
            },
            unique: function (els) {
                var i = 0,
                    j = 0,
                    aIndex,
                    bIndex,
                    doEl = document,
                    hasDup = false,
                    el,
                    duplicates = [];
                els.sort(function (a, b) {
                    if (a === b) {
                        hasDup = true;
                    }
                    if (supportCompare) {
                        return a.compareDocumentPosition(b) & 4 ? -1 : 1;
                    }
                    aIndex = $.element.index(a, doEl);
                    bIndex = $.element.index(b, doEl);
                    return aIndex - bIndex;
                });
                if (hasDup) {
                    while (el = els[i++]) {
                        if (el === els[ i ]) {
                            j = duplicates.push(i);
                        }
                    }
                    while (j--) {
                        els.splice(duplicates[j], 1);
                    }
                }
                return els;
            },
            makeArray: function (arr, results) {
                var ret = results || [];
                if (arr !== null && arr !== undefined) {
                    if (isArrayLike(Object(arr))) {
                        this.merge(ret, typeof arr === 'string' ? [arr] : arr);
                    } else {
                        push.call(ret, arr);
                    }
                }
                return ret;
            },
            pushStack: function (els) {
                var ret = this.merge(this.constructor(), els);
                ret.prevObject = this;
                return ret;
            },
            concat: function (second) {
                return this.merge(this, second);
            },
            find: function (selector) {
                var that = this,
                    arr = [],
                    ret;
                if (!selector) {
                    return that;
                }
                that.each(function () {
                    arr = that.merge(arr, getNode(selector, this));
                });
                ret = that.length > 1 ? that.unique(arr) : arr;
                return that.pushStack(ret);
            },
            parent: function () {
                var that = this,
                    arr = [];
                that.each(function () {
                    arr.push($.element.parent(this));
                });
                return that.pushStack(that.unique(arr));
            },
            children: function (selector) {
                var that = this,
                    s = selector ? selector.trim() : '',
                    dom,
                    nodeArr,
                    i,
                    el,
                    arr = [];
                that.each(function () {
                    dom = this;
                    if (!s) {
                        arr = that.merge(arr, $.element.children(dom));
                    } else {
                        nodeArr = getNode(selector, dom) || [];
                        for (i = 0; i < nodeArr.length; i++) {
                            el = nodeArr[i];
                            if ($.element.parent(el) === dom) {
                                arr.push(el);
                            }
                        }
                    }
                });
                return that.pushStack(arr);
            },
            filter: function (selector) {
                return this.pushStack(filterOrNot(this, selector, false));
            },
            not: function (selector) {
                return this.pushStack(filterOrNot(this, selector, true));
            },
            eq: function (i) {
                var that = this,
                    len = that.length,
                    el = i >= 0 ? that[i] : that[len + i],
                    arr = [el];
                if (!el) {
                    arr = [];
                }
                return that.pushStack(arr);
            },
            first: function () {
                return this.pushStack([this[0]]);
            },
            last: function () {
                var that = this;
                return that.pushStack([that[that.length - 1]]);
            },
            on: function () {
                var that = this,
                    args = Array.prototype.slice.call(arguments);
                that.each(function () {
                    $.element.on.apply(this, [this].concat(args));
                });
                return that;
            },
            off: function () {
                var that = this,
                    args = Array.prototype.slice.call(arguments);
                that.each(function () {
                    $.element.off.apply(this, [this].concat(args));
                });
                return that;
            },
            remove: function () {
                var that = this;
                that.each(function () {
                    $.element.remove(this);
                });
            },
            addClass: function (css) {
                var that = this;
                that.each(function () {
                    $.element.addClass(this, css);
                });
                return that;
            },
            removeClass: function (css) {
                var that = this;
                that.each(function () {
                    $.element.removeClass(this, css);
                });
                return that;
            },
            toggleClass: function (css) {
                var that = this;
                that.each(function () {
                    $.element.toggleClass(this, css);
                });
                return that;
            },
            css: function (n, val) {
                var that = this;
                that.each(function () {
                    $.element.css(this, n, val);
                });
                return that;
            },
            append: function (html) {
                var that = this;
                that.each(function () {
                    $.element.append(this, html);
                });
                return that;
            },
            html: function (html) {
                var that = this;
                that.each(function () {
                    $.element.html(this, html);
                });
                return that;
            }
        };

        init = $.fn.init = function (selector, dom) {
            if (!selector) {
                return this;
            }
            this.selector = selector;
            return this.makeArray(getNode(selector, dom || document), this);
        };

        init.prototype = $.fn;

        $.extend = function (o, ext) {
            var obj = o || {},
                prop,
                isObject = false,
                type;
            for (prop in ext) {
                if (ext.hasOwnProperty(prop)) {
                    isObject = typeof this[prop] === 'object';
                    switch (isObject) {
                        case true:
                            type = Object.prototype.toString.call(ext[prop]);
                            if (type === '[object Array]') {
                                obj[prop] = [];
                            } else if (window.JSON && type !== '[object Function]') {
                                JSON.parse(JSON.stringify(obj));
                            } else {
                                obj[prop] = {};
                            }
                            $.extend(obj[prop], ext[prop]);
                            break;
                        default:
                            obj[prop] = ext[prop];
                    }
                }
            }
            return obj;
        };

        return $;
    })();

    $.extend($, {
        array: {
            inArray: function (aArr, bArr) { // 檢測元素（數組形式）是否存在於某數組中
                var i,
                    el;
                for (i = 0; i < aArr.length; i++) {
                    el = aArr[i];
                    if (bArr.indexOf(el) < 0) {
                        return false;
                    }
                }
                return true;
            },
            remove: function (arr, val) { // 刪除指定元素
                var index = arr.indexOf(val);
                if (index > -1) {
                    arr.splice(index, 1);
                }
            },
            distinct: function (arr) { // 刪除重複元素
                var obj = {},
                    ret = [],
                    i,
                    g;
                for (i = 0; i < arr.length; i++) {
                    g = arr[i];
                    if (!obj[g]) {
                        ret.push(g);
                        obj[g] = true;
                    }
                }
                return ret;
            },
            removeEmytp: function (arr) { // 清除空元素
                var i,
                    g,
                    ret = [];
                for (i = 0; i < arr.length; i++) {
                    g = arr[i];
                    if (g !== '') {
                        ret.push(g);
                    }
                }
                return ret;
            },
            replace: function (arr, val, newVal) { // 替換指定元素
                var i,
                    g;
                for (i = 0; i < arr.length; i++) {
                    g = arr[i];
                    if (g === val) {
                        arr.splice(i, 1, newVal);
                    }
                }
            }
        },
        element: {
            getClass: function (el) {
                return el.getAttribute('class') || '';
            },
            hasClass: function (el, selector) {
                var classList = el.classList,
                    className = selector ? selector.trim() : '';
                if (!className) {
                    return false;
                }
                if (classList) {
                    return classList.contains(className);
                }
                classList = $.element.getClass(el).trim().split(' ');
                return classList.indexOf(className) > -1;
            },
            addClass: function (el, css) {
                var classList = el.classList,
                    cssArry = css ? css.trim() ? css.trim().split(' ') : [] : [],
                    i,
                    className,
                    arry,
                    nClass;
                if (!cssArry) {
                    return;
                }
                if (classList) {
                    for (i = 0; i < cssArry.length; i++) {
                        className = cssArry[i];
                        if (!classList.contains(className)) {
                            classList.add(className);
                        }
                    }
                } else {
                    classList = $.element.getClass(el).split(' ');
                    arry = classList.concat(cssArry);
                    nClass = $.array.distinct(arry).join(' ').trim();
                    el.setAttribute('class', nClass);
                }
                return el;
            },
            removeClass: function (el, css) {
                var classList = el.classList || $.element.getClass(el).split(' '),
                    notSupport = classList.value === 'undefined',
                    cssArry = css ? css.trim() ? css.trim().split(' ') : [] : [],
                    i,
                    className;
                if (!classList || !cssArry) {
                    return;
                }
                for (i = 0; i < cssArry.length; i++) {
                    className = cssArry[i];
                    if (notSupport) {
                        $.array.remove(classList, className);
                    } else {
                        classList.remove(className);
                    }
                }
                if (notSupport) {
                    el.setAttribute('class', classList.join(' '));
                }
                return el;
            },
            toggleClass: function (el, css) {
                var cssArry = css ? css.trim() ? css.trim().split(' ') : [] : [],
                    i,
                    className;
                if (!cssArry) {
                    return;
                }
                for (i = 0; i < cssArry.length; i++) {
                    className = cssArry[i];
                    if ($.element.hasClass(el, className)) {
                        $.element.removeClass(el, className);
                    } else {
                        $.element.addClass(el, className);
                    }
                }
                return el;
            },
            css: function (el, n, val) {
                el.style[n] = val;
                return el;
            },
            is: function (el, selector) {
                var id = el.id,
                    tag = el.localName.toLowerCase(),
                    s = selector ? selector.trim() : '',
                    tc,
                    type;
                if (!s) {
                    return;
                }
                tc = getSelectorType(s);
                type = tc.type;
                switch (type) {
                    case 'id':
                        return '#' + id === s;
                    case 'tag':
                        return tag === s;
                    case 'class':
                        return $.element.hasClass(el, s.replace('.', ''));
                    default:
                        return false;
                }
            },
            parent: function (el) {
                return getSibling(el, 'parentNode');
            },
            children: function (el) {
                var arr = [],
                    childNodes,
                    i,
                    child;
                if (el.children) {
                    return el.children;
                }
                childNodes = el.childNodes;
                for (i = 0; i < childNodes.length; i++) {
                    child = childNodes[i];
                    if (child.nodeType === 1) {
                        arr.push(child);
                    }
                }
                return arr;
            },
            lastChild: function (el) {
                var e = el.lastChild;
                while (e.nodeType !== 1) {
                    e = e.previousSibling;
                }
                return e;
            },
            prev: function (el) {
                return getSibling(el, 'previousSibling');
            },
            next: function (el) {
                return getSibling(el, 'nextSibling');
            },
            prevAll: function (el) {
                return getDir(el, 'previousSibling');
            },
            nextAll: function (el) {
                return getDir(el, 'nextSibling');
            },
            index: function (el, target) {
                var obj = target ? target.getElementsByTagName('*') : $.element.children($.element.parent(el)),
                    i;
                for (i = 0; i < obj.length; i++) {
                    if (obj[i] === el) {
                        return i;
                    }
                }
            },
            on: function () {
                var args = arguments,
                    el = args[0],
                    evt = args[1],
                    isFun = typeof args[2] === 'function',
                    selector,
                    handler,
                    useCapture;
                if (isFun) {
                    handler = args[2];
                    useCapture = args[3];
                } else {
                    selector = args[2];
                    handler = args[3];
                    useCapture = args[4];
                }
                if (isFun) {
                    makeCache(el, evt, handler);
                    return addEvent(el, evt, handler, useCapture);
                }
                function delegateHandler (e) {
                    var event = e || window.event,
                        target = event.target || event.srcElement;
                    if ($.element.is(target, selector)) {
                        handler.apply(target, Array.prototype.slice.call(arguments));
                    }
                }
                makeCache(el, evt, handler, delegateHandler, selector);
                return addEvent(el, evt, delegateHandler, useCapture);
            },
            off: function () {
                var args = arguments,
                    el = args[0],
                    evt = args[1],
                    isFun = typeof arguments[2] === 'function',
                    selector,
                    handler,
                    useCapture,
                    i,
                    token,
                    e,
                    event,
                    j,
                    delegateEvents,
                    dEvt;
                if (isFun) {
                    handler = args[2];
                    useCapture = args[3];
                } else {
                    selector = args[2];
                    handler = args[3];
                    useCapture = args[4];
                }
                for (i = 0; i < cacheToken.length; i++) {
                    token = cacheToken[i];
                    e = eventCache[token];
                    if (e && e.el === el) {
                        if (!handler) {
                            event = e.events[evt];
                            if (event) {
                                for (j = 0; j < event.length; j++) {
                                    handler = event[j];
                                    removeEvent(el, evt, handler, useCapture);
                                }
                                e.events[evt] = [];
                                e.delegateEvents[evt] = [];
                            }
                        } else {
                            if (selector) {
                                delegateEvents = eventCache[token].delegateEvents[evt][selector];
                                for (j = 0; j < delegateEvents.length; j++) {
                                    dEvt = delegateEvents[j];
                                    if (dEvt.handler === handler) {
                                        $.array.remove(delegateEvents, dEvt);
                                        return removeEvent(el, evt, dEvt.delegate, useCapture);
                                    }
                                }
                            } else {
                                $.array.remove(e.events[evt], handler);
                                removeEvent(el, evt, handler, useCapture);
                            }
                        }
                        break;
                    }
                }
            },
            remove: function (el) {
                destoryElement(el, true);
            },
            empty: function (el) {
                destoryElement(el);
            },
            append: function (el, html) {
                var temp;
                if (supportInnerHTML) {
                    el.innerHTML += html;
                    return;
                }
                temp = document.createElement('div');
                temp.id = 'tempEl';
                el.appendChild(temp);
                temp.innerHTML = html;
                document.getElementById('tempEl').removeNode(false);
                temp = null;
            },
            html: function (el, html) {
                if (typeof html === 'undefined') {
                    return getInnerHTML(el);
                }
                $.element.empty(el);
                if (supportInnerHTML) {
                    el.innerHTML = html;
                } else {
                    $.element.append(el, html);
                }
            }
        },
        each: function (arr, cb) {
            eachDom(arr, cb);
        }
    });

    window.$ = $;
})(this);
