/**
 * Created by Henrie on 8/9/2017.
 */
(function (global) {
    Array.prototype.forEach = Array.prototype.forEach || function (fun) { // 兼容forEach
        var len = this.length,
            thisp,
            i;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }
        thisp = arguments[1];
        for (i = 0; i < len; i++) {
            if (i in this) {
                fun.call(thisp, this[i], i, this);
            }
        }
    };
    Array.prototype.inArray = function (arr) { // 檢測元素（數組形式）是否存在於某數組中
        var that = this,
            el;
        for (i = 0; i < that.length; i++) {
            el = that[i];
            if (arr.indexOf(el) < 0) {
                return false;
            }
        }
        return true;
    };
    Array.prototype.remove = function (val) { // 刪除指定元素
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
    Array.prototype.distinct = function () { // 刪除重複元素
        var obj = {},
            arr = [],
            i,
            g;
        for (i = 0; i < this.length; i++) {
            g = this[i];
            if (!obj[g]) {
                arr.push(g);
                obj[g] = true;
            }
        }
        return arr;
    };
    Array.prototype.removeEmytp = function () { // 清除空元素
        var i,
            g,
            arr = [];
        for (i = 0; i < this.length; i++) {
            g = this[i];
            if (g !== '') {
                arr.push(g);
            }
        }
        return arr;
    };
    Array.prototype.replace = function (val, newVal) { // 替換指定元素
        var i,
            g;
        for (i = 0; i < this.length; i++) {
            g = this[i];
            if (g === val) {
                this.splice(i, 1, newVal);
            }
        }
    };
})(this);
