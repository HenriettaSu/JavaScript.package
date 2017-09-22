function getType (obj) {
    var class2type = {},
        toString = class2type.toString;
    if (obj === null || obj === undefined) {
        return obj + '';
    } else if (Object.prototype.toString.call(obj) === '[object Array]') {
        return 'array';
    }
    return typeof obj === 'object' || typeof obj === 'function' ? class2type[toString.call(obj)] || 'object' : typeof obj;
}
function getEvent () {
    var handler,
        e;
    if (window.event) {
        return window.event;
    }
    handler = getEvent.caller;
    do {
        e = handler.arguments[0];
        if (e) {
            if (e.constructor === Event || e.constructor === MouseEvent || typeof e === 'object' && e.preventDefault && e.stopPropagation) {
                return e;
            }
        }
    } while (handler = handler.caller);
    return null;
}
