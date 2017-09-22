(function (global) {
    Object.prototype.clone = function (o) { // 拷貝對象
        var obj = o || {},
            prop,
            isObject = false,
            type;
        for (prop in this) {
            if (this.hasOwnProperty(prop)) {
                isObject = typeof this[prop] === 'object';
                switch (isObject) {
                    case true:
                        type = Object.prototype.toString.call(this[prop]);
                        if (type === '[object Array]') {
                            obj[prop] = [];
                        } else if (window.JSON && type !== '[object Function]') {
                            JSON.parse(JSON.stringify(obj));
                        } else {
                            obj[prop] = {};
                        }
                        this[prop].clone(obj[prop]);
                        break;
                    default:
                        obj[prop] = this[prop];
                }
            }
        }
        return obj;
    };
    Object.prototype.extend = function () { // 擴展對象
        var result = this,
            i,
            g,
            length = arguments.length;
        for (i = 0; i < length; i++) {
            g = arguments[i];
            result = g.clone(result);
        }
        return result;
    };
})(this);
