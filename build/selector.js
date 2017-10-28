/**
 * 數組、元素、對象，選擇器
 */
(function (global) {
    var supportCompare = document.compareDocumentPosition,
        deletedIds = [],
        push = deletedIds.push,
        $,
        eventCache = {},
        cacheToken = [],
        handlerCache = [],
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

    // events
    function makeCache (el, evt, h, delegate, s) {
        var token,
            i,
            j,
            k,
            e,
            tokenMax,
            tempEvent,
            handler,
            handlerIndex = handlerCache.indexOf(h);
        if (handlerIndex < 0) {
            handlerCache.push(h);
            handlerIndex = handlerCache.length - 1;
        }
        handler = s ? {
            selector: s,
            handler: handlerCache[handlerIndex],
            delegate: delegate
        } : {
            selector: 'noSelector',
            handler: handlerCache[handlerIndex]
        };
        for (i = 0; i < cacheToken.length; i++) {
            if (cacheToken[i].el === el) { // 元素已經在緩存裡
                token = cacheToken[i].token;
                e = eventCache[token];
                if (!e.events[evt]) { // 沒有這個事件
                    e.events[evt] = [handler];
                    e.eventsArr.push(evt);
                    return;
                }
                tempEvent = e.events[evt];
                if (!s) {
                    for (j = 0; j < tempEvent.length; j++) {
                        k = tempEvent[j];
                        if (k.selector === 'noSelector' && k.handler === h) {
                            return;
                        }
                    }
                }
                tempEvent.push(handler);
                return;
            }
        }
        tokenMax = cacheToken[cacheToken.length - 1] ? cacheToken[cacheToken.length - 1].token : -1;
        token = tokenMax + 1;
        cacheToken.push({
            token: token,
            el: el
        });
        eventCache[token] = {
            el: el,
            events: {}
        };
        eventCache[token].events[evt] = [handler];
        eventCache[token].eventsArr = [evt];
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
            j,
            k,
            e,
            token,
            evt,
            eventsArr,
            evtType,
            selector,
            handler;
        for (i = 0; i < cacheToken.length; i++) {
            if (cacheToken[i].el === el) {
                token = cacheToken[i].token;
                e = eventCache[token];
                eventsArr = e.eventsArr;
                for (j = 0; j < eventsArr.length; j++) {
                    evt = eventsArr[j];
                    evtType = e.events[evt];
                    for (k = 0; k < evtType.length; k++) {
                        handler = evtType[k].selector === 'noSelector' ? evtType[k].handler : evtType[k].delegate;
                        removeEvent(el, evt, handler);
                    }
                }
                eventCache[token] = null;
                cacheToken.splice(i, 1);
                break;
            }
        }
    }
    function destoryElement (el, destoryRoot) {
        var i,
            children = el.getElementsByTagName('*'),
            len = children.length,
            child,
            temp;
        for (i = len - 1; i >= 0; i--) {
            child = children[i];
            cleanEvent(child);
            temp = child.parentNode.removeChild(child);
            temp = null;
        }
        if (destoryRoot) {
            cleanEvent(el);
            if (el.parentNode) {
                temp = el.parentNode.removeChild(el);
                temp = null;
            }
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

    // selector
    function isArrayLike (obj) {
        var length = !!obj && 'length' in obj && obj.length,
            type = getType(obj);
        if (type === 'function') {
            return false;
        }
        return type === 'array' || length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj;
    }
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
            empty: function () {
                var that = this;
                that.each(function () {
                    $.element.empty(this);
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
                    j,
                    token,
                    e,
                    event,
                    content,
                    handlerType;
                if (isFun) {
                    selector = 'noSelector';
                    handler = args[2];
                    useCapture = args[3];
                } else {
                    selector = args[2];
                    handler = args[3];
                    useCapture = args[4];
                }
                for (i = 0; i < cacheToken.length; i++) {
                    token = cacheToken[i].token;
                    if (cacheToken[i].el === el) {
                        e = eventCache[token];
                        if (!e.events[evt]) {
                            return;
                        }
                        event = e.events[evt];
                        for (j = 0; j < event.length; j++) {
                            content = event[j];
                            handlerType = content.selector === 'noSelector' ? 'handler' : 'delegate';
                            if (!handler) { // 移除某個事件的所有綁定
                                removeEvent(el, evt, content[handlerType], useCapture);
                            } else if (content.selector === selector && content.handler === handler) {
                                removeEvent(el, evt, content[handlerType], useCapture);
                                event.splice(j, 1);
                                return;
                            }
                        }
                        if (!handler) {
                            e.events[evt] = [];
                            break;
                        }
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
        inArray: function (el, arr) {
            return arr.indexOf(el) >= 0;
        },
        each: function (arr, cb) {
            eachDom(arr, cb);
        }
    });

    window.$ = $;
})(this);
