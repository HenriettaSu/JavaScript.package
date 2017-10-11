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
(function (global) {
    Element.prototype.remove = Element.prototype.remove || function () {
            this.parentNode.removeChild(this);
        };
    Element.prototype.append = function (html) { // TODO
        var that = this,
            div;
        try {
            that.innerHTML += html;
        } catch (e) {
            div = document.createElement('div');
            div.innerHTML = html;
            that.appendChild(div);
            div = null;
        }
    };
    Element.prototype.html = function (html) {
        var that = this,
            innerHtml = that.innerHTML,
            div;
        if (!html) {
            return innerHtml;
        }
        while (that.firstChild) {
            that.removeChild(that.firstChild);
        }
        try {
            that.innerHTML = html;
        } catch (e) {
            // TODO
        }
    };
    Element.prototype.on = function (evt, fn, useCapture) {
        var that = this;
        if (that.addEventListener) {
            that.addEventListener(evt, fn, useCapture);
            return true;
        } else if (that.attachEvent) {
            return that.attachEvent('on' + evt, fn);
        }
        that['on' + evt] = fn;
    };
    Element.prototype.off = function (evt, fn, useCapture) {
        var that = this;
        if (that.removeEventListener) {
            that.removeEventListener(evt, fn, useCapture);
            return true;
        } else if (that.detachEvent) {
            return that.detachEvent('on' + evt, fn);
        }
        that['on' + evt] = null;
    };
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
})(this);
