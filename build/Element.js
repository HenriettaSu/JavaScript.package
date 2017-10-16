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
(function (global) {
    var eventCache = {},
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

    function makeCache (el, evt, handler) {
        var token,
            i,
            e,
            len,
            evtName;
        for (i = 0; i < cacheToken.length; i++) {
            token = cacheToken[i];
            e = eventCache[token];
            if (e.el === el) {
                evtName = eventCache[token].events[evt] || [];
                evtName.push(handler);
                return;
            }
        }
        len = cacheToken[cacheToken.length - 1] >= 0 ? cacheToken[cacheToken.length - 1] : -1;
        token = len + 1;
        cacheToken.push(token);
        eventCache[token] = {
            el: el,
            events: {}
        };
        eventCache[token].events[evt] = [handler];
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
            j,
            handler;
        for (i = 0; i < cacheToken.length; i++) {
            token = cacheToken[i];
            e = eventCache[token];
            if (e.el === el) {
                events = e.events;
                Object.keys(events).forEach(function (evt) {
                    for (j = 0; j < events[evt].length; j++) {
                        handler = events[evt][j];
                        removeEvent(el, evt, handler);
                    }
                });
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
                child.destory();
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
    Element.prototype.getClass = function () {
        return this.getAttribute('class') || '';
    };
    Element.prototype.hasClass = function (selector) {
        var that = this,
            classList = that.classList,
            className = selector ? selector.trim() : '';
        if (!className) {
            return false;
        }
        if (classList) {
            return classList.contains(className);
        }
        classList = that.getClass().trim().split(' ');
        return classList.indexOf(className) > -1;
    };
    Element.prototype.addClass = function (css) {
        var that = this,
            classList = that.classList,
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
            classList = that.getClass().split(' ');
            arry = classList.concat(cssArry);
            nClass = arry.distinct().join(' ').trim();
            that.setAttribute('class', nClass);
        }
        return that;
    };
    Element.prototype.removeClass = function (css) {
        var that = this,
            classList = that.classList || that.getClass().split(' '),
            cssArry = css ? css.trim() ? css.trim().split(' ') : [] : [],
            i,
            className;
        if (!classList || !cssArry) {
            return;
        }
        for (i = 0; i < cssArry.length; i++) {
            className = cssArry[i];
            classList.remove(className);
        }
        if (typeof classList.value === 'undefined') {
            that.setAttribute('class', classList.join(' '));
        }
        return that;
    };
    Element.prototype.toggleClass = function (css) {
        var that = this,
            cssArry = css ? css.trim() ? css.trim().split(' ') : [] : [],
            i,
            className;
        if (!cssArry) {
            return;
        }
        for (i = 0; i < cssArry.length; i++) {
            className = cssArry[i];
            if (that.hasClass(className)) {
                that.removeClass(className);
            } else {
                that.addClass(className);
            }
        }
        return that;
    };
    Element.prototype.css = function (n, val) {
        this.style[n] = val;
        return this;
    };
    Element.prototype.is = function (selector) {
        var that = this,
            id = that.id,
            tag = that.localName.toLowerCase(),
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
                return that.hasClass(s.replace('.', ''));
            default:
                return false;
        }
    };
    Element.prototype.parent = function () {
        return getSibling(this, 'parentNode');
    };
    Element.prototype.allChildren = function () {
        var that = this,
            arr = [],
            childNodes,
            i,
            child;
        if (that.children) {
            return that.children;
        }
        childNodes = that.childNodes;
        for (i = 0; i < childNodes.length; i++) {
            child = childNodes[i];
            if (child.nodeType === 1) {
                arr.push(child);
            }
        }
        return arr;
    };
    Element.prototype.getLastChild = function () {
        var e = this.lastChild;
        while (e.nodeType !== 1) {
            e = e.previousSibling;
        }
        return e;
    };
    Element.prototype.prev = function () {
        return getSibling(this, 'previousSibling');
    };
    Element.prototype.next = function () {
        return getSibling(this, 'nextSibling');
    };
    Element.prototype.prevAll = function () {
        return getDir(this, 'previousSibling');
    };
    Element.prototype.nextAll = function () {
        return getDir(this, 'nextSibling');
    };
    Element.prototype.index = function (el) {
        var obj = el ? el.getElementsByTagName('*') : this.parent().allChildren(),
            i;
        for (i = 0; i < obj.length; i++) {
            if (obj[i] === this) {
                return i;
            }
        }
    };
    Element.prototype.on = function (evt, handler, useCapture) {
        var that = this;
        makeCache(that, evt, handler);
        if (that.addEventListener) {
            return that.addEventListener(evt, handler, useCapture);
        } else if (that.attachEvent) {
            return that.attachEvent('on' + evt, handler);
        }
        that['on' + evt] = handler;
    };
    Element.prototype.off = function (evt, handler, useCapture) {
        var that = this,
            i,
            token,
            e,
            events,
            j;
        for (i = 0; i < cacheToken.length; i++) {
            token = cacheToken[i];
            e = eventCache[token];
            if (e && e.el === that) {
                if (!handler) {
                    events = e.events;
                    for (j = 0; j < events[evt].length; j++) {
                        handler = events[evt][j];
                        removeEvent(that, evt, handler, useCapture);
                    }
                    eventCache[token].events[evt] = [];
                } else {
                    eventCache[token].events[evt].remove(handler);
                    removeEvent(that, evt, handler, useCapture);
                }
                break;
            }
        }
    };
    Element.prototype.destory = function () {
        destoryElement(this, true);
    };
    Element.prototype.empty = function () {
        destoryElement(this);
    };
    Element.prototype.append = function (html) {
        var that = this,
            temp;
        if (supportInnerHTML) {
            that.innerHTML += html;
            return;
        }
        temp = document.createElement('div');
        temp.id = 'tempEl';
        that.appendChild(temp);
        temp.innerHTML = html;
        document.getElementById('tempEl').removeNode(false);
        temp = null;
    };
    Element.prototype.html = function (html) {
        var that = this;
        if (typeof html === 'undefined') {
            return getInnerHTML(that);
        }
        that.empty();
        if (supportInnerHTML) {
            that.innerHTML = html;
        } else {
            that.append(html);
        }
    };
})(this);
