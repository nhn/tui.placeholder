(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{192:function(e,t,n){"use strict";n(13),n(71),n(25);var a=n(198),r=n(0),o=n.n(r),s=n(70),i=n.n(s),l=(n(194),n(7).default.enqueue,o.a.createContext({}));function c(e){var t=e.staticQueryData,n=e.data,a=e.query,r=e.render,s=n?n.data:t[a]&&t[a].data;return o.a.createElement(o.a.Fragment,null,s&&r(s),!s&&o.a.createElement("div",null,"Loading (StaticQuery)"))}var p=function(e){var t=e.data,n=e.query,a=e.render,r=e.children;return o.a.createElement(l.Consumer,null,function(e){return o.a.createElement(c,{data:t,query:n,render:a||r,staticQueryData:e})})};var u=function(e){var t,n;function a(){return e.apply(this,arguments)||this}return n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n,a.prototype.render=function(){var e=this.props.data,t=e.logo,n=e.title,a=e.version;return o.a.createElement("header",{className:"header"},o.a.createElement("h1",{className:"logo"},o.a.createElement(i.a,{to:t.linkUrl},o.a.createElement("img",{src:t.src,alt:"logo"}))),n&&n.text?o.a.createElement("span",{className:"info-wrapper"},o.a.createElement("span",{className:"project-name"},"/"),o.a.createElement("span",{className:"project-name"},o.a.createElement("a",{href:n.linkUrl,target:"_blank",rel:"noreferrer noopener"},n.text))):null,a?o.a.createElement("span",{className:"info-wrapper"+(n&&n.text?" has-title":"")},o.a.createElement("span",{className:"splitter"},"|"),o.a.createElement("span",{className:"version"},"v",a)):null)},a}(o.a.Component);n(34);var d=function(e){var t,n;function a(){return e.apply(this,arguments)||this}return n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n,a.prototype.render=function(){return o.a.createElement("footer",{className:"footer"},this.props.infoList.map(function(e,t){var n=e.linkUrl,a=e.title;return o.a.createElement("span",{className:"info",key:"footer-info-"+t},o.a.createElement("a",{href:n,target:"_blank",rel:"noreferrer noopener"},a))}))},a}(o.a.Component),m=(n(53),n(54),n(96),n(36),n(200));n(195),n(15);var h={class:"CLASSES",namespace:"NAMESAPCES",module:"MODULES",external:"EXTERNALS",mixin:"MIXINS",global:"GLOBALS",example:"Examples"},f=/[-[\]\/{}()*+?.\\^$|]/g,v=function(e){var t,n;function a(){return e.apply(this,arguments)||this}n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n;var r=a.prototype;return r.hightliging=function(e){var t=this.props.value.replace(f,"\\$&"),n=new RegExp(t,"ig"),a=e.replace(n,function(e){return"<strong>"+e+"</strong>"});return o.a.createElement("span",{dangerouslySetInnerHTML:{__html:a}})},r.getListItemComponent=function(e,t){var n=this.props.movedIndex,a=e.node,r=a.pid,s=a.name,l=a.parentPid;return o.a.createElement("li",{className:"item"+(n===t?" selected":""),key:"search-item-"+t},o.a.createElement(i.a,{to:"/"+r,className:"ellipsis"},this.hightliging(s),o.a.createElement("span",{className:"nav-group-title"},h[l]||l)))},r.getResultComponent=function(){var e=this,t=this.props.result;return t.length?o.a.createElement("ul",null,t.map(function(t,n){return e.getListItemComponent(t,n)})):o.a.createElement("p",{className:"no-result"},"No Result")},r.render=function(){return this.props.searching?o.a.createElement("div",{className:"search-list"},this.getResultComponent()):null},a}(o.a.Component);function E(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}var g=function(e,t){return(e&&e.getAttribute&&(e.getAttribute("class")||e.getAttribute("className")||"")).indexOf(t)>-1},y=function(e){return e.toLowerCase()},b={searching:!1,value:null,movedIndex:-1,result:[]},N=function(e){var t,n;function a(){var t;return(t=e.call(this)||this).state=b,t.handleKeyDown=t.handleKeyDown.bind(E(t)),t.handleKeyUp=t.handleKeyUp.bind(E(t)),t.handleFocus=t.handleFocus.bind(E(t)),t.handleClick=t.handleClick.bind(E(t)),t}n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n;var r=a.prototype;return r.attachEvent=function(){document.addEventListener("click",this.handleClick)},r.detachEvent=function(){document.removeEventListener("click",this.handleClick)},r.handleKeyDown=function(e){var t=this,n=e.keyCode;this.setState(function(e){var a=e.movedIndex;return 38===n&&a>0?a-=1:40===n&&a<t.state.result.length-1&&(a+=1),{movedIndex:a}})},r.handleKeyUp=function(e){var t=e.keyCode,n=e.target,a=this.state,r=a.result,o=a.movedIndex;if(38!==t&&40!==t)if(13===t&&r.length&&o>-1){var s="/"+r[o].node.pid;this.moveToPage(s)}else this.search(n.value)},r.handleFocus=function(e){var t=e.target.value;this.attachEvent(),t.length&&this.search(t)},r.handleClick=function(e){for(var t=e.target;t&&!g(t,"search-container");)t=t.parentElement;t||this.resetState()},r.search=function(e){this.setState({searching:!0,value:e,result:this.findMatchingValues(e)})},r.findMatchingValues=function(e){return this.props.data.filter(function(t){var n=y(t.node.name);return""!==e&&n.indexOf(y(e))>-1})},r.moveToPage=function(e){e&&Object(s.navigate)(e),this.resetState()},r.resetState=function(){this.detachEvent(),this.setState({searching:!1,value:null,result:[],movedIndex:-1})},r.render=function(){var e=this.state,t=e.searching,n=e.value,a=e.result,r=e.movedIndex;return o.a.createElement("div",{className:"search-container"+(t?" searching":"")},o.a.createElement("div",{className:"search-box"},o.a.createElement("span",{className:"btn-search"+(t?" searching":"")},o.a.createElement("span",{className:"icon"},o.a.createElement("span",{className:"oval"}),o.a.createElement("span",{className:"stick"}))),o.a.createElement("input",{type:"text",placeholder:"Search",onKeyDown:this.handleKeyDown,onKeyUp:this.handleKeyUp,onFocus:this.handleFocus})),o.a.createElement("hr",{className:"line "+(t?"show":"hide")}),o.a.createElement(v,{searching:t,value:n,result:a,movedIndex:r}))},a}(o.a.Component),I=function(){return o.a.createElement(p,{query:"3941510517",render:function(e){return o.a.createElement(N,{data:e.allSearchKeywordsJson.edges})},data:m})},S=n(196),_=n(197),C=n(201),x=(n(35),function(e){var t=e.opened,n=e.handleClick;return o.a.createElement("button",{className:"btn-toggle"+(t?" opened":""),onClick:n},o.a.createElement("span",{className:"icon"}))});var w=function(e){var t,n;function a(){return e.apply(this,arguments)||this}n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n;var r=a.prototype;return r.filter=function(e){return this.props.items.filter(function(t){return t.kind===e})},r.getSubListGroupComponent=function(e,t){var n=this.props.selectedId;return t&&t.length?o.a.createElement("div",{className:"subnav-group"},o.a.createElement("h3",{className:"title"},e),o.a.createElement("ul",null,t.map(function(e,t){var a=e.pid,r=e.name;return o.a.createElement("li",{key:"nav-item-"+t},o.a.createElement("p",{className:"nav-item"+(n===a?" selected":"")},o.a.createElement(i.a,{to:"/"+a,className:"ellipsis"},o.a.createElement("span",null,r))))}))):null},r.render=function(){var e=this.props.opened;return o.a.createElement("div",{className:e?"show":"hide"},this.getSubListGroupComponent("EXTENDS",this.filter("augment")),this.getSubListGroupComponent("MIXES",this.filter("mix")),this.getSubListGroupComponent("STATIC PROPERTIES",this.filter("static-property")),this.getSubListGroupComponent("STATIC METHODS",this.filter("static-method")),this.getSubListGroupComponent("INSTANCE METHODS",this.filter("instance-method")),this.getSubListGroupComponent("EVENTS",this.filter("event")))},a}(o.a.Component);function k(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}var M=function(e){var t,n;function a(t){var n;return(n=e.call(this,t)||this).state={opened:n.isSelected()},n.toggleItemState=n.toggleItemState.bind(k(n)),n.handleClick=n.handleClick.bind(k(n)),n}n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n;var r=a.prototype;return r.handleClick=function(e){e.preventDefault(),this.isSelected()?this.toggleItemState():Object(s.navigate)("/"+this.props.pid)},r.toggleItemState=function(){this.setState(function(e){return{opened:!e.opened}})},r.isSelected=function(){var e=this.props,t=e.selectedId,n=e.pid;return!!t&&t.split("#").shift()===n},r.render=function(){var e=this.props,t=e.selectedId,n=e.pid,a=e.name,r=e.childNodes,s=this.state.opened,i=!(!r||!r.length),l=this.isSelected();return o.a.createElement("li",null,o.a.createElement("p",{className:"nav-item"+(l?" selected":"")},o.a.createElement("a",{href:"/tui.placeholder/latest/"+n,className:"ellipsis",onClick:this.handleClick},o.a.createElement("span",null,a)),i&&o.a.createElement(x,{hasChildNodes:i,opened:s,handleClick:this.toggleItemState})),i&&o.a.createElement(w,{selectedId:t,hasChildNodes:i,opened:s,items:r}))},a}(o.a.Component);var L=function(e){var t,n;function a(){return e.apply(this,arguments)||this}return n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n,a.prototype.render=function(){var e=this.props,t=e.selectedId,n=e.title,a=e.items;return a.length?o.a.createElement("div",{className:"nav-group"},n&&o.a.createElement("h2",{className:"title"},n),o.a.createElement("ul",null,a.map(function(e,n){var a=e.node,r=a.pid,s=a.name,i=a.childNodes;return o.a.createElement(M,{key:"nav-item-"+n,selectedId:t,pid:r,name:s,childNodes:i})}))):null},a}(o.a.Component);var O=function(e){var t,n;function a(){return e.apply(this,arguments)||this}n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n;var r=a.prototype;return r.filterItems=function(e){return this.props.items.filter(function(t){return t.node.parentPid===e})},r.render=function(){var e=this.props.selectedId;return o.a.createElement("div",{className:"nav"},o.a.createElement(L,{selectedId:e,title:"MODULES",items:this.filterItems("module")}),o.a.createElement(L,{selectedId:e,title:"EXTERNALS",items:this.filterItems("external")}),o.a.createElement(L,{selectedId:e,title:"CLASSES",items:this.filterItems("class")}),o.a.createElement(L,{selectedId:e,title:"NAMESPACES",items:this.filterItems("namespace")}),o.a.createElement(L,{selectedId:e,title:"MIXINS",items:this.filterItems("mixin")}),o.a.createElement(L,{selectedId:e,title:"TYPEDEF",items:this.filterItems("typedef")}),o.a.createElement(L,{selectedId:e,title:"GLOBAL",items:this.filterItems("global")}))},a}(o.a.Component),j=function(e){return o.a.createElement(p,{query:"2438170150",render:function(t){return o.a.createElement(O,Object.assign({items:t.allNavigationJson.edges},e))},data:C})},D=n(202);var U=function(e){var t,n;function a(){return e.apply(this,arguments)||this}return n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n,a.prototype.render=function(){var e=this.props,t=e.selectedId,n=e.items;return o.a.createElement("div",{className:"nav nav-example"},o.a.createElement(L,{selectedId:t,items:n}))},a}(o.a.Component),P=function(e){return o.a.createElement(p,{query:"647896407",render:function(t){return o.a.createElement(U,Object.assign({items:t.allNavigationJson.edges},e))},data:D})};var R=function(e){var t,n;function a(){return e.apply(this,arguments)||this}return n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n,a.prototype.render=function(){var e=this.props,t=e.useExample,n=e.tabIndex,a=e.selectedNavItemId,r=e.width;return o.a.createElement("aside",{className:"lnb",style:{width:r}},o.a.createElement(I,null),t?o.a.createElement(S.a,{tabIndex:n},o.a.createElement(_.a,{name:"API"},o.a.createElement(j,{selectedId:a})),o.a.createElement(_.a,{name:"Examples"},o.a.createElement(P,{selectedId:a}))):o.a.createElement(j,{selectedId:a}))},a}(o.a.Component);function T(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}var A=function(e){var t,n;function a(t){var n;return(n=e.call(this,t)||this).handleMouseMove=t.handleMouseMove,n.handleMouseDown=n.handleMouseDown.bind(T(n)),n.handleMouseUp=n.handleMouseUp.bind(T(n)),n}n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n;var r=a.prototype;return r.handleMouseDown=function(){document.addEventListener("mousemove",this.handleMouseMove,!1),document.addEventListener("mouseup",this.handleMouseUp,!1)},r.handleMouseUp=function(){document.removeEventListener("mousemove",this.handleMouseMove,!1),document.removeEventListener("mouseup",this.handleMouseUp,!1)},r.render=function(){return o.a.createElement("div",{className:"resize-handle",onMouseDown:this.handleMouseDown,style:{left:this.props.left}},"Resizable")},a}(o.a.Component);var J=260,K=function(e){var t,n;function a(){var t;return(t=e.call(this)||this).state={width:J},t.handleMouseMove=t.changeWidth.bind(function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(t)),t}n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n;var r=a.prototype;return r.changeWidth=function(e){e.preventDefault(),this.setState({width:Math.max(e.pageX,212)})},r.render=function(){var e=this.props,t=e.data,n=e.tabIndex,a=e.selectedNavItemId,r=e.children,s=t.header,i=t.footer,l=t.useExample,c=this.state.width;return o.a.createElement("div",{className:"wrapper"},o.a.createElement(u,{data:s}),o.a.createElement("main",{className:"body",style:{paddingLeft:c}},o.a.createElement(R,{useExample:l,tabIndex:n,selectedNavItemId:a,width:c}),o.a.createElement("section",{className:"content"},r),o.a.createElement(A,{left:c,handleMouseMove:this.handleMouseMove})),o.a.createElement(d,{infoList:i}))},a}(o.a.Component);t.a=function(e){return o.a.createElement(p,{query:"610389658",render:function(t){return o.a.createElement(K,Object.assign({data:t.allLayoutJson.edges[0].node},e))},data:a})}},194:function(e,t,n){var a;e.exports=(a=n(199))&&a.default||a},195:function(e,t,n){var a=n(4),r=n(138),o=n(10).f,s=n(100).f,i=n(99),l=n(72),c=a.RegExp,p=c,u=c.prototype,d=/a/g,m=/a/g,h=new c(d)!==d;if(n(8)&&(!h||n(9)(function(){return m[n(3)("match")]=!1,c(d)!=d||c(m)==m||"/a/i"!=c(d,"i")}))){c=function(e,t){var n=this instanceof c,a=i(e),o=void 0===t;return!n&&a&&e.constructor===c&&o?e:r(h?new p(a&&!o?e.source:e,t):p((a=e instanceof c)?e.source:e,a&&o?l.call(e):t),n?this:u,c)};for(var f=function(e){e in c||o(c,e,{configurable:!0,get:function(){return p[e]},set:function(t){p[e]=t}})},v=s(p),E=0;v.length>E;)f(v[E++]);u.constructor=c,c.prototype=u,n(14)(a,"RegExp",c)}n(97)("RegExp")},196:function(e,t,n){"use strict";n(53),n(34),n(25);var a=n(0),r=n.n(a);var o=function(e){var t,n;function a(t){var n;return(n=e.call(this,t)||this).state={selected:t.tabIndex||0},n}n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n;var o=a.prototype;return o.selectTab=function(e){this.setState({selected:e})},o.render=function(){var e=this,t=this.props.children;return r.a.createElement("div",{className:"tabs"},r.a.createElement("div",{className:"tab-buttons"},t.map(function(t,n){return t?r.a.createElement("button",{key:"tab-"+n,className:"tab"+(e.state.selected===n?" selected":""),onClick:function(){return e.selectTab(n)}},t.props.name):null})),t[this.state.selected])},a}(r.a.Component);t.a=o},197:function(e,t,n){"use strict";n(25);var a=n(0),r=n.n(a);var o=function(e){var t,n;function a(){return e.apply(this,arguments)||this}return n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n,a.prototype.render=function(){var e=this.props,t=e.hasIframe,n=e.children;return r.a.createElement("div",{className:"tab-content"+(t?" iframe":"")},n)},a}(r.a.Component);t.a=o},198:function(e){e.exports=JSON.parse('{"data":{"allLayoutJson":{"edges":[{"node":{"header":{"logo":{"src":"https://uicdn.toast.com/toastui/img/tui-component-bi-white.png","linkUrl":"/"},"title":{"text":"Placeholder","linkUrl":"https://github.com/nhn/tui.placeholder"},"version":"2.2.2"},"footer":[{"title":"NHN","linkUrl":"https://github.com/nhn"},{"title":"FE Development Lab","linkUrl":"https://github.com/nhn/fe.javascript"}],"useExample":true}}]}}}')},199:function(e,t,n){"use strict";n.r(t);n(13);var a=n(0),r=n.n(a),o=n(132);t.default=function(e){var t=e.location,n=e.pageResources;return n?r.a.createElement(o.a,Object.assign({location:t,pageResources:n},n.json)):null}},200:function(e){e.exports=JSON.parse('{"data":{"allSearchKeywordsJson":{"edges":[{"node":{"pid":"placeholder#generate","parentPid":"placeholder","name":"generate"}},{"node":{"pid":"placeholder#hide","parentPid":"placeholder","name":"hide"}},{"node":{"pid":"placeholder#remove","parentPid":"placeholder","name":"remove"}},{"node":{"pid":"placeholder","parentPid":"module","name":"placeholder"}},{"node":{"pid":"tutorial-example01-basic","parentPid":"example","name":"1. Basic"}},{"node":{"pid":"tutorial-example02-using-classname","parentPid":"example","name":"2. Using Class Name"}},{"node":{"pid":"tutorial-example03-dynamic-creation","parentPid":"example","name":"3. Dynamic creation"}}]}}}')},201:function(e){e.exports=JSON.parse('{"data":{"allNavigationJson":{"edges":[{"node":{"pid":"placeholder","parentPid":"module","name":"placeholder","opened":false,"childNodes":[{"pid":"placeholder#generate","name":"generate","kind":"static-method"},{"pid":"placeholder#hide","name":"hide","kind":"static-method"},{"pid":"placeholder#remove","name":"remove","kind":"static-method"}]}}]}}}')},202:function(e){e.exports=JSON.parse('{"data":{"allNavigationJson":{"edges":[{"node":{"pid":"tutorial-example01-basic","name":"1. Basic"}},{"node":{"pid":"tutorial-example02-using-classname","name":"2. Using Class Name"}},{"node":{"pid":"tutorial-example03-dynamic-creation","name":"3. Dynamic creation"}}]}}}')}}]);
//# sourceMappingURL=1-367df1005ba71c46e7f3.js.map