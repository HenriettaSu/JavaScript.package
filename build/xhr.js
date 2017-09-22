function createXmlHttpRequest () { // 創建XMLHttpRequest對象
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : null;
    return xhr;
}
function creatAjax (option) { // 發起ajax請求
    var xhr = createXmlHttpRequest(),
        responseText = xhr.responseText,
        opt = {
            contentType: 'application/x-www-form-urlencoded',
            data: null,
            method: 'GET',
            async: true
        }.extend(option);
    switch (opt.async) {
        case false:
            break;
        default:
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    opt.success(responseText);
                } else {
                    opt.error(responseText);
                }
            };
    }
    xhr.open(method, url + Math.random(), opt.async);
    switch (opt.method) {
        case 'GET':
            break;
        case 'POST':
            xhr.setRequestHeader('Content-Type', opt.contentType);
    }
    xhr.send(opt.data);
}
