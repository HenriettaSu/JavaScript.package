Array.prototype.forEach=Array.prototype.forEach||function(r){var t,i,o=this.length;if("function"!=typeof r)throw new TypeError;for(t=arguments[1],i=0;i<o;i++)i in this&&r.call(t,this[i],i,this)},Array.prototype.inArray=function(r){var t,o=this;for(i=0;i<o.length;i++)if(t=o[i],r.indexOf(t)<0)return!1;return!0},Array.prototype.remove=function(r){var t=this.indexOf(r);t>-1&&this.splice(t,1)},Array.prototype.distinct=function(){var r,t,i={},o=[];for(r=0;r<this.length;r++)i[t=this[r]]||(o.push(t),i[t]=!0);return o},Array.prototype.removeEmytp=function(){var r,t,i=[];for(r=0;r<this.length;r++)""!==(t=this[r])&&i.push(t);return i},Array.prototype.replace=function(r,t){var i;for(i=0;i<this.length;i++)this[i]===r&&this.splice(i,1,t)};
function getSelectorType(t){var e,n,r=t.charAt(0);return"#"===r?(e="id",n=t.substring(1)):r.match(/[a-zA-Z]/)||"*"===t?(e="tag",n=t):"."===r&&(e="class",n=t.substring(1)),{type:e,selectorName:n}}!function(t){function e(t){var e,n,r=t.innerHTML;return o?(e=/(\s+\w+)\s*=\s*([^<>"\s]+)(?=[^<>]*\/>)/gi,n=/"'([^'"]*)'"/gi,r=r.replace(e,'$1="$2"').replace(n,'"$1"'),r.replace(/<(\/?)(\w+)([^>]*)>/g,function(t,e,n,r){return e?"</"+n.toLowerCase()+">":("<"+n.toLowerCase()+r+">").replace(/=(("[^"]*?")|('[^']*?')|([\w\-\.]+))([\s>])/g,function(t,e,n,r,i,o,s,l){return i?'="'+i+'"'+o:t})}).replace(/<\/?([^>]+)>/g,function(t){return t})):r}function n(t,e){do{t=t[e]}while(t&&1!==t.nodeType);return t}function r(t,e){for(var n=[];(t=t[e])&&9!==t.nodeType;)1===t.nodeType&&n.push(t);return n}var i=function(){var t=document.createElement("table"),e=document.createElement("tbody");t.appendChild(e);try{e.innerHTML="<tr></tr>"}catch(n){return t=null,e=null,!1}return t=null,e=null,!0}(),o="Microsoft Internet Explorer"===navigator.appName&&parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g,"").replace("MSIE",""))<9;Element.prototype.remove=Element.prototype.remove||function(){this.parentNode.removeChild(this)},Element.prototype.empty=function(){for(var t=this;t.firstChild;)t.firstChild.remove()},Element.prototype.on=function(t,e,n){var r=this;return r.addEventListener?(r.addEventListener(t,e,n),!0):r.attachEvent?r.attachEvent("on"+t,e):void(r["on"+t]=e)},Element.prototype.off=function(t,e,n){var r=this;return r.removeEventListener?(r.removeEventListener(t,e,n),!0):r.detachEvent?r.detachEvent("on"+t,e):void(r["on"+t]=null)},Element.prototype.getClass=function(){return this.getAttribute("class")||""},Element.prototype.hasClass=function(t){var e=this,n=e.classList,r=t?t.trim():"";return!!r&&(n?n.contains(r):(n=e.getClass().trim().split(" ")).indexOf(r)>-1)},Element.prototype.addClass=function(t){var e,n,r,i=this,o=i.classList,s=t&&t.trim()?t.trim().split(" "):[];if(s){if(o)for(e=0;e<s.length;e++)n=s[e],o.contains(n)||o.add(n);else r=(o=i.getClass().split(" ")).concat(s).distinct().join(" ").trim(),i.setAttribute("class",r);return i}},Element.prototype.removeClass=function(t){var e,n,r=this,i=r.classList||r.getClass().split(" "),o=t&&t.trim()?t.trim().split(" "):[];if(i&&o){for(e=0;e<o.length;e++)n=o[e],i.remove(n);return void 0===i.value&&r.setAttribute("class",i.join(" ")),r}},Element.prototype.toggleClass=function(t){var e,n,r=this,i=t&&t.trim()?t.trim().split(" "):[];if(i){for(e=0;e<i.length;e++)n=i[e],r.hasClass(n)?r.removeClass(n):r.addClass(n);return r}},Element.prototype.css=function(t,e){return this.style[t]=e,this},Element.prototype.is=function(t){var e,n=this,r=n.id,i=n.localName.toLowerCase(),o=t?t.trim():"";if(o)switch(e=getSelectorType(o),e.type){case"id":return"#"+r===o;case"tag":return i===o;case"class":return n.hasClass(o.replace(".",""));default:return!1}},Element.prototype.parent=function(){return n(this,"parentNode")},Element.prototype.allChildren=function(){var t,e,n,r=this,i=[];if(r.children)return r.children;for(t=r.childNodes,e=0;e<t.length;e++)1===(n=t[e]).nodeType&&i.push(n);return i},Element.prototype.getLastChild=function(){for(var t=this.lastChild;1!==t.nodeType;)t=t.previousSibling;return t},Element.prototype.prev=function(){return n(this,"previousSibling")},Element.prototype.next=function(){return n(this,"nextSibling")},Element.prototype.prevAll=function(){return r(this,"previousSibling")},Element.prototype.nextAll=function(){return r(this,"nextSibling")},Element.prototype.index=function(t){var e,n=t?t.getElementsByTagName("*"):this.parent().allChildren();for(e=0;e<n.length;e++)if(n[e]===this)return e},Element.prototype.append=function(t){var e,n=this;i?n.innerHTML+=t:((e=document.createElement("div")).id="tempEl",e.innerHTML=t,n.appendChild(e),document.getElementById("tempEl").removeNode(!1),e=null)},Element.prototype.html=function(t){var n=this;if(void 0===t)return e(n);i?n.innerHTML=t:(n.empty(),n.append(t))}}();
Object.prototype.clone=function(t){var e,o,r=t||{};for(e in this)if(this.hasOwnProperty(e))switch("object"==typeof this[e]){case!0:"[object Array]"===(o=Object.prototype.toString.call(this[e]))?r[e]=[]:window.JSON&&"[object Function]"!==o?JSON.parse(JSON.stringify(r)):r[e]={},this[e].clone(r[e]);break;default:r[e]=this[e]}return r},Object.prototype.extend=function(){var t,e=this,o=arguments.length;for(t=0;t<o;t++)e=arguments[t].clone(e);return e};
function getType(t){var e={},n=e.toString;return null===t||void 0===t?t+"":"[object Array]"===Object.prototype.toString.call(t)?"array":"object"==typeof t||"function"==typeof t?e[n.call(t)]||"object":typeof t}function getEvent(){var t,e;if(window.event)return window.event;t=getEvent.caller;do{if((e=t.arguments[0])&&(e.constructor===Event||e.constructor===MouseEvent||"object"==typeof e&&e.preventDefault&&e.stopPropagation))return e}while(t=t.caller);return null}
!function(t){function n(t){var n=!!t&&"length"in t&&t.length,e=getType(t);return"function"!==e&&("array"===e||0===n||"number"==typeof n&&n>0&&n-1 in t)}function e(t,n){var e,r,i=t;for(e=0;e<i.length;e++)r=i[e],n.call(r)}function r(t,n){var e=n.getElementById(t);return e?[e]:[]}function i(t,n){var r,i,s=[];return n.getElementsByClassName?(i=t.replace("."," "),s=n.getElementsByClassName(i)):(r=t.split("."),e(n.getElementsByTagName("*"),function(){var t=this,n=t.getClass().split(" ");r.inArray(n)&&s.push(t)})),s}function s(t,n){var e,r,i,s,u,c,o,h,f=[];if(t.indexOf(".")<0)return n.getElementsByTagName(t);for(r=(e=t.split("."))[0],e.shift(),i=a.fn.merge([],n.getElementsByTagName(r)),s=0;s<e.length;s++){for(o=e[s],u=0,c=0;h=i[u++];)h.hasClass(o)||(c=f.push(u-1));for(;c--;)i.splice(f[c],1)}return i}function u(t,n){var e=getSelectorType(t),u=e.type,c=e.selectorName;switch(u){case"id":return r(c,n);case"tag":return s(c,n);case"class":return i(c,n)}}function c(t,n){var e,r,i,s,c,o={},h=[];if(t){if("string"==typeof t){if((e=t.trim()).indexOf(",")<0)return u(e,n);for(r=e.split(","),i=0;i<r.length;i++)o[s=r[i].trim()]||(c=u(s,n),o[s]=!0,h=a.fn.merge(h,c))}else t.nodeType&&(h=this);return a.fn.unique(h)}}function o(t,n,e){var r,i=n?n.trim():"",s=[];return i?(t.each(function(){(r=this).is(i)===!e&&s.push(r)}),s):e?t:s}var a,h=document.compareDocumentPosition,f=[].push;a=function(t){var r=function(t,n){return new r.fn.init(t,n)};return r.fn=r.prototype={constructor:r,selector:"",length:0,merge:function(t,n){var e=+n.length,r=0,i=t.length;if(e===n.length)for(;r<e;)t[i++]=n[r++];else for(;void 0!==n[r];)t[i++]=n[r++];return t.length=i,t},each:function(t){e(this,t)},unique:function(t){var n,e,r,i=0,s=0,u=document,c=!1,o=[];if(t.sort(function(t,r){return t===r&&(c=!0),h?4&t.compareDocumentPosition(r)?-1:1:(n=t.index(u),e=r.index(u),n-e)}),c){for(;r=t[i++];)r===t[i]&&(s=o.push(i));for(;s--;)t.splice(o[s],1)}return t},makeArray:function(t,e){var r=e||[];return null!==t&&void 0!==t&&(n(Object(t))?this.merge(r,"string"==typeof t?[t]:t):f.call(r,t)),r},pushStack:function(t){var n=this.merge(this.constructor(),t);return n.prevObject=this,n},concat:function(t){return this.merge(this,t)},find:function(t){var n,e=this,r=[];return t?(e.each(function(){r=e.merge(r,c(t,this))}),n=e.length>1?e.unique(r):r,e.pushStack(n)):e},parent:function(){var t=this,n=[];return t.each(function(){n.push(this.parent())}),t.pushStack(t.unique(n))},children:function(t){var n,e,r,i,s=this,u=t?t.trim():"",o=[];return s.each(function(){if(n=this,u)for(e=c(t,n)||[],r=0;r<e.length;r++)(i=e[r]).parent()===n&&o.push(i);else o=s.merge(o,n.allChildren())}),s.pushStack(o)},filter:function(t){return this.pushStack(o(this,t,!1))},not:function(t){return this.pushStack(o(this,t,!0))},eq:function(t){var n=this,e=n.length,r=t>=0?n[t]:n[e+t],i=[r];return r||(i=[]),n.pushStack(i)},first:function(){return this.pushStack([this[0]])},last:function(){var t=this;return t.pushStack([t[t.length-1]])},on:function(t,n,e){var r=this;return r.each(function(){this.on(t,n,e)}),r},off:function(t,n,e){var r=this;return r.each(function(){this.off(t,n,e)}),r},remove:function(){this.each(function(){this.remove()})},addClass:function(t){var n=this;return n.each(function(){this.addClass(t)}),n},removeClass:function(t){var n=this;return n.each(function(){this.removeClass(t)}),n},toggleClass:function(t){var n=this;return n.each(function(){this.toggleClass(t)}),n},css:function(t,n){var e=this;return e.each(function(){this.css(t,n)}),e},append:function(t){var n=this;return n.each(function(){this.append(t)}),n},html:function(t){var n=this;return n.each(function(){this.html(t)}),n}},init=r.fn.init=function(t,n){return t?(this.selector=t,this.makeArray(c(t,n||document),this)):this},init.prototype=r.fn,r.each=function(t,n){e(t,n)},r}(),window.$=a}();
function createXmlHttpRequest(){return window.XMLHttpRequest?new XMLHttpRequest:window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):null}function creatAjax(e){var t=createXmlHttpRequest(),n=t.responseText,a={contentType:"application/x-www-form-urlencoded",data:null,method:"GET",async:!0}.extend(e);switch(a.async){case!1:break;default:t.onreadystatechange=function(){4===t.readyState&&200===t.status?a.success(n):a.error(n)}}switch(t.open(method,url+Math.random(),a.async),a.method){case"GET":break;case"POST":t.setRequestHeader("Content-Type",a.contentType)}t.send(a.data)}