/**
 * This file depends on 'Array.js' and 'Element.js'
 */
var supportCompare = document.compareDocumentPosition,
    deletedIds = [],
    push = deletedIds.push,
    $;

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
                classList = el.getClass().split(' ');
            if (css.inArray(classList)) {
                arr.push(el);
            }
        });
    }
    return arr;
}
function ByTag (selector, dom) {
    var s = selector.split('.'),
        tag = s[0],
        tagList = dom.getElementsByTagName(tag),
        i,
        a,
        b,
        className,
        eachTag,
        notMatch = [];
    if (s.length === 1) {
        return tagList;
    }
    s.shift();
    tagList = $.fn.merge([], tagList);
    for (i = 0; i < s.length; i++) {
        className = s[i];
        a = 0;
        b = 0;
        while (eachTag = tagList[a++]) {
            if (!eachTag.hasClass(className)) {
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
        selectorName = tc.selectorName,
        temp;
    switch (type) {
        case 'id':
            temp = ById(selectorName, dom);
            break;
        case 'tag':
            temp = ByTag(selectorName, dom);
            break;
        case 'class':
            temp = ByClass(selectorName, dom);
            break;
    }
    return temp;
}
function getNode (selector, dom) {
    var s = selector ? selector.trim() : '',
        ss,
        i,
        eachS,
        e,
        ssObj = {},
        arr = [],
        temp;
    if (!s) {
        return;
    }
    if (s.indexOf(',') < 0) {
        return byOneSelector(s, dom);
    }
    ss = selector.split(',');
    for (i = 0; i < ss.length; i++) {
        eachS = ss[i];
        e = eachS.trim();
        if (!ssObj[e]) {
            temp = byOneSelector(e, dom);
            ssObj[e] = true;
            arr = $.fn.merge(arr, temp);
        }
    }
    return $.fn.unique(arr);
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
                    first[ i++ ] = second[ j++ ];
                }
            } else {
                while (second[ j ] !== undefined) {
                    first[ i++ ] = second[ j++ ];
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
                aIndex = a.index(doEl);
                bIndex = b.index(doEl);
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
                arr.push(this.parent());
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
                    arr = that.merge(arr, dom.allChildren());
                } else {
                    nodeArr = getNode(selector, dom) || [];
                    for (i = 0; i < nodeArr.length; i++) {
                        el = nodeArr[i];
                        if (el.parent() === dom) {
                            arr.push(el);
                        }
                    }
                }
            });
            return that.pushStack(arr);
        },
        not: function (selector) {
            var that = this,
                select = selector ? selector.trim() : '',
                el,
                arr = [];
            if (!select) {
                return that;
            }
            that.each(function () {
                el = this;
                if (!el.is(select)) {
                    arr.push(el);
                }
            });
            return that.pushStack(arr);
        },
        last: function () {
            return this.makeArray(this[this.length - 1], this.constructor());
        },
        on: function (evt, fn, useCapture) {
            var that = this;
            that.each(function () {
                this.addEvent(evt, fn, useCapture);
            });
            return that;
        },
        off: function (evt, fn, useCapture) {
            var that = this;
            that.each(function () {
                this.removeEvent(evt, fn, useCapture);
            });
            return that;
        },
        remove: function () {
            var that = this;
            that.each(function () {
                this.remove();
            });
        },
        addClass: function (css) {
            var that = this;
            that.each(function () {
                this.addClass(css);
            });
            return that;
        },
        removeClass: function (css) {
            var that = this;
            that.each(function () {
                this.removeClass(css);
            });
            return that;
        },
        toggleClass: function (css) {
            var that = this;
            that.each(function () {
                this.toggleClass(css);
            });
            return that;
        },
        css: function (n, val) {
            var that = this;
            that.each(function () {
                this.css(n, val);
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

    $.each = function (arr, cb) {
        eachDom(arr, cb);
    };

    return $;
})();
