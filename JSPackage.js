Array.prototype.forEach=Array.prototype.forEach||function(r){var t,i,o=this.length;if("function"!=typeof r)throw new TypeError;for(t=arguments[1],i=0;i<o;i++)i in this&&r.call(t,this[i],i,this)},Array.prototype.inArray=function(r){var t,o=this;for(i=0;i<o.length;i++)if(t=o[i],r.indexOf(t)<0)return!1;return!0},Array.prototype.remove=function(r){var t=this.indexOf(r);t>-1&&this.splice(t,1)},Array.prototype.distinct=function(){var r,t,i={},o=[];for(r=0;r<this.length;r++)i[t=this[r]]||(o.push(t),i[t]=!0);return o},Array.prototype.removeEmytp=function(){var r,t,i=[];for(r=0;r<this.length;r++)""!==(t=this[r])&&i.push(t);return i},Array.prototype.replace=function(r,t){var i;for(i=0;i<this.length;i++)this[i]===r&&this.splice(i,1,t)};
function getSelectorType(t){var e,n,r=t[0];return"#"===r?(e="id",n=t.substring(1)):r.match(/[a-zA-Z]/)||"*"===t?(e="tag",n=t):"."===r&&(e="class",n=t.substring(1)),{type:e,selectorName:n}}function getSibling(t,e){do{t=t[e]}while(t&&1!==t.nodeType);return t}function getDir(t,e){for(var n=[];(t=t[e])&&9!==t.nodeType;)1===t.nodeType&&n.push(t);return n}Element.prototype.remove=Element.prototype.remove||function(){this.parentNode.removeChild(this)},Element.prototype.append=function(t){var e,n=this;try{n.innerHTML+=t}catch(r){(e=document.createElement("div")).innerHTML=t,n.appendChild(e),e=null}},Element.prototype.html=function(t){var e=this,n=e.innerHTML;if(!t)return n;for(;e.firstChild;)e.removeChild(e.firstChild);try{e.innerHTML=t}catch(t){}},Element.prototype.addEvent=function(t,e,n){var r=this;return r.addEventListener?(r.addEventListener(t,e,n),!0):r.attachEvent?r.attachEvent("on"+t,e):void(r["on"+t]=e)},Element.prototype.removeEvent=function(t,e,n){var r=this;return r.removeEventListener?(r.removeEventListener(t,e,n),!0):r.detachEvent?r.detachEvent("on"+t,e):void(r["on"+t]=null)},Element.prototype.getClass=function(){return this.getAttribute("class")||""},Element.prototype.hasClass=function(t){var e=this,n=e.classList,r=t?t.trim():"";return!!r&&(n?n.contains(r):(n=e.getClass().trim().split(" ")).indexOf(r)>-1)},Element.prototype.addClass=function(t){var e,n,r,i=this,o=i.classList,s=t&&t.trim()?t.trim().split(" "):[];if(s){if(o)for(e=0;e<s.length;e++)n=s[e],o.contains(n)||o.add(n);else r=(o=i.getClass().split(" ")).concat(s).distinct().join(" ").trim(),i.setAttribute("class",r);return i}},Element.prototype.removeClass=function(t){var e,n,r=this,i=r.classList||r.getClass().split(" "),o=t&&t.trim()?t.trim().split(" "):[];if(i&&o){for(e=0;e<o.length;e++)n=o[e],i.remove(n);return void 0===i.value&&r.setAttribute("class",i.join(" ")),r}},Element.prototype.toggleClass=function(t){var e,n,r=this,i=t&&t.trim()?t.trim().split(" "):[];if(i){for(e=0;e<i.length;e++)n=i[e],r.hasClass(n)?r.removeClass(n):r.addClass(n);return r}},Element.prototype.css=function(t,e){return this.style[t]=e,this},Element.prototype.is=function(t){var e,n=this,r=n.id,i=n.localName.toLowerCase(),o=t?t.trim():"";if(o)switch(e=getSelectorType(o),e.type){case"id":return"#"+r===o;case"tag":return i===o;case"class":return n.hasClass(o.replace(".",""));default:return!1}},Element.prototype.parent=function(){return getSibling(this,"parentNode")},Element.prototype.allChildren=function(){var t,e,n,r=this,i=[];if(r.children)return r.children;for(t=r.childNodes,e=0;e<t.length;e++)1===(n=t[e]).nodeType&&i.push(n);return i},Element.prototype.prev=function(){return getSibling(this,"previousSibling")},Element.prototype.next=function(){return getSibling(this,"nextSibling")},Element.prototype.prevAll=function(){return getDir(this,"previousSibling")},Element.prototype.nextAll=function(){return getDir(this,"nextSibling")},Element.prototype.index=function(t){var e,n=t?t.getElementsByTagName("*"):this.parent().allChildren();for(e=0;e<n.length;e++)if(n[e]===this)return e};
Object.prototype.clone=function(t){var e,o,r=t||{};for(e in this)if(this.hasOwnProperty(e))switch("object"==typeof this[e]){case!0:"[object Array]"===(o=Object.prototype.toString.call(this[e]))?r[e]=[]:window.JSON&&"[object Function]"!==o?JSON.parse(JSON.stringify(r)):r[e]={},this[e].clone(r[e]);break;default:r[e]=this[e]}return r},Object.prototype.extend=function(){var t,e=this,o=arguments.length;for(t=0;t<o;t++)e=arguments[t].clone(e);return e};
function getType(t){var e={},n=e.toString;return null===t||void 0===t?t+"":"[object Array]"===Object.prototype.toString.call(t)?"array":"object"==typeof t||"function"==typeof t?e[n.call(t)]||"object":typeof t}function getEvent(){var t,e;if(window.event)return window.event;t=getEvent.caller;do{if((e=t.arguments[0])&&(e.constructor===Event||e.constructor===MouseEvent||"object"==typeof e&&e.preventDefault&&e.stopPropagation))return e}while(t=t.caller);return null}
function isArrayLike(t){var e=!!t&&"length"in t&&t.length,n=getType(t);return"function"!==n&&("array"===n||0===e||"number"==typeof e&&e>0&&e-1 in t)}function eachDom(t,e){var n,r,i=t;for(n=0;n<i.length;n++)r=i[n],e.call(r)}function ById(t,e){var n=e.getElementById(t);return n?[n]:[]}function ByClass(t,e){var n,r,i=[];return e.getElementsByClassName?(r=t.replace("."," "),i=e.getElementsByClassName(r)):(n=t.split("."),eachDom(e.getElementsByTagName("*"),function(){var t=this,e=t.getClass().split(" ");n.inArray(e)&&i.push(t)})),i}function ByTag(t,e){var n,r,i,s,o,u=t.split("."),a=u[0],c=e.getElementsByTagName(a),h=[];if(1===u.length)return c;for(u.shift(),c=$.fn.merge([],c),n=0;n<u.length;n++){for(s=u[n],r=0,i=0;o=c[r++];)o.hasClass(s)||(i=h.push(r-1));for(;i--;)c.splice(h[i],1)}return c}function byOneSelector(t,e){var n,r=getSelectorType(t),i=r.type,s=r.selectorName;switch(i){case"id":n=ById(s,e);break;case"tag":n=ByTag(s,e);break;case"class":n=ByClass(s,e)}return n}function getNode(t,e){var n,r,i,s,o=t?t.trim():"",u={},a=[];if(o){if(o.indexOf(",")<0)return byOneSelector(o,e);for(n=t.split(","),r=0;r<n.length;r++)u[i=n[r].trim()]||(s=byOneSelector(i,e),u[i]=!0,a=$.fn.merge(a,s));return $.fn.unique(a)}}var supportCompare=document.compareDocumentPosition,deletedIds=[],push=deletedIds.push,$;$=function(t){var e=function(t,n){return new e.fn.init(t,n)};return e.fn=e.prototype={constructor:e,selector:"",length:0,merge:function(t,e){var n=+e.length,r=0,i=t.length;if(n===e.length)for(;r<n;)t[i++]=e[r++];else for(;void 0!==e[r];)t[i++]=e[r++];return t.length=i,t},each:function(t){eachDom(this,t)},unique:function(t){var e,n,r,i=0,s=0,o=document,u=!1,a=[];if(t.sort(function(t,r){return t===r&&(u=!0),supportCompare?4&t.compareDocumentPosition(r)?-1:1:(e=t.index(o),n=r.index(o),e-n)}),u){for(;r=t[i++];)r===t[i]&&(s=a.push(i));for(;s--;)t.splice(a[s],1)}return t},makeArray:function(t,e){var n=e||[];return null!==t&&void 0!==t&&(isArrayLike(Object(t))?this.merge(n,"string"==typeof t?[t]:t):push.call(n,t)),n},pushStack:function(t){var e=this.merge(this.constructor(),t);return e.prevObject=this,e},find:function(t){var e,n=this,r=[];return t?(n.each(function(){r=n.merge(r,getNode(t,this))}),e=n.length>1?n.unique(r):r,n.pushStack(e)):n},parent:function(){var t=this,e=[];return t.each(function(){e.push(this.parent())}),t.pushStack(t.unique(e))},children:function(t){var e,n,r,i,s=this,o=t?t.trim():"",u=[];return s.each(function(){if(e=this,o)for(n=getNode(t,e)||[],r=0;r<n.length;r++)(i=n[r]).parent()===e&&u.push(i);else u=s.merge(u,e.allChildren())}),s.pushStack(u)},not:function(t){var e,n=this,r=t?t.trim():"",i=[];return r?(n.each(function(){(e=this).is(r)||i.push(e)}),n.pushStack(i)):n},last:function(){return this.makeArray(this[this.length-1],this.constructor())},on:function(t,e,n){var r=this;return r.each(function(){this.addEvent(t,e,n)}),r},off:function(t,e,n){var r=this;return r.each(function(){this.removeEvent(t,e,n)}),r},remove:function(){this.each(function(){this.remove()})},addClass:function(t){var e=this;return e.each(function(){this.addClass(t)}),e},removeClass:function(t){var e=this;return e.each(function(){this.removeClass(t)}),e},toggleClass:function(t){var e=this;return e.each(function(){this.toggleClass(t)}),e},css:function(t,e){var n=this;return n.each(function(){this.css(t,e)}),n}},init=e.fn.init=function(t,e){return t?(this.selector=t,this.makeArray(getNode(t,e||document),this)):this},init.prototype=e.fn,e.each=function(t,e){eachDom(t,e)},e}();
function createXmlHttpRequest(){return window.XMLHttpRequest?new XMLHttpRequest:window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):null}function creatAjax(e){var t=createXmlHttpRequest(),n=t.responseText,a={contentType:"application/x-www-form-urlencoded",data:null,method:"GET",async:!0}.extend(e);switch(a.async){case!1:break;default:t.onreadystatechange=function(){4===t.readyState&&200===t.status?a.success(n):a.error(n)}}switch(t.open(method,url+Math.random(),a.async),a.method){case"GET":break;case"POST":t.setRequestHeader("Content-Type",a.contentType)}t.send(a.data)}