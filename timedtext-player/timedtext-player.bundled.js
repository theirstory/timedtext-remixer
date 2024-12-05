/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),i=new WeakMap;class n{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const s=this.t;if(e&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=i.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&i.set(s,t))}return t}toString(){return this.cssText}}const r=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1]),t[0]);return new n(i,t,s)},o=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,s))(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,{is:a,defineProperty:h,getOwnPropertyDescriptor:c,getOwnPropertyNames:l,getOwnPropertySymbols:u,getPrototypeOf:d}=Object,f=globalThis,p=f.trustedTypes,m=p?p.emptyScript:"",y=f.reactiveElementPolyfillSupport,v=(t,e)=>t,g={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},$=(t,e)=>!a(t,e),b={attribute:!0,type:String,converter:g,reflect:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;class w extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&h(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get(){return i?.call(this)},set(e){const r=i?.call(this);n.call(this,e),this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=d(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...l(t),...u(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$Eg=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$ES(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)))}addController(t){(this._$E_??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$E_?.delete(t)}_$ES(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((s,i)=>{if(e)s.adoptedStyleSheets=i.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of i){const i=document.createElement("style"),n=t.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=e.cssText,s.appendChild(i)}})(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$E_?.forEach((t=>t.hostConnected?.()))}enableUpdating(t){}disconnectedCallback(){this._$E_?.forEach((t=>t.hostDisconnected?.()))}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$EO(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const n=(void 0!==s.converter?.toAttribute?s.converter:g).toAttribute(e,s.type);this._$Em=t,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:g;this._$Em=i,this[i]=n.fromAttribute(e,t.type),this._$Em=null}}requestUpdate(t,e,s,i=!1,n){if(void 0!==t){if(s??=this.constructor.getPropertyOptions(t),!(s.hasChanged??$)(i?n:this[t],e))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$Eg=this._$EP())}C(t,e,s){this._$AL.has(t)||this._$AL.set(t,e),!0===s.reflect&&this._$Em!==t&&(this._$Ej??=new Set).add(t)}async _$EP(){this.isUpdatePending=!0;try{await this._$Eg}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t)!0!==s.wrapped||this._$AL.has(e)||void 0===this[e]||this.C(e,this[e],s)}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$E_?.forEach((t=>t.hostUpdate?.())),this.update(e)):this._$ET()}catch(e){throw t=!1,this._$ET(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$E_?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$ET(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Eg}shouldUpdate(t){return!0}update(t){this._$Ej&&=this._$Ej.forEach((t=>this._$EO(t,this[t]))),this._$ET()}updated(t){}firstUpdated(t){}}w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[v("elementProperties")]=new Map,w[v("finalized")]=new Map,y?.({ReactiveElement:w}),(f.reactiveElementVersions??=[]).push("2.0.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const S=globalThis,_=S.trustedTypes,T=_?_.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",C=`lit$${(Math.random()+"").slice(9)}$`,x="?"+C,E=`<${x}>`,O=document,k=()=>O.createComment(""),M=t=>null===t||"object"!=typeof t&&"function"!=typeof t,F=Array.isArray,N="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,U=/-->/g,I=/>/g,L=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),R=/'/g,j=/"/g,H=/^(?:script|style|textarea|title)$/i,z=(t=>(e,...s)=>({_$litType$:t,strings:e,values:s}))(1),B=Symbol.for("lit-noChange"),D=Symbol.for("lit-nothing"),W=new WeakMap,V=O.createTreeWalker(O,129);function q(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==T?T.createHTML(e):e}const G=(t,e)=>{const s=t.length-1,i=[];let n,r=2===e?"<svg>":"",o=P;for(let e=0;e<s;e++){const s=t[e];let a,h,c=-1,l=0;for(;l<s.length&&(o.lastIndex=l,h=o.exec(s),null!==h);)l=o.lastIndex,o===P?"!--"===h[1]?o=U:void 0!==h[1]?o=I:void 0!==h[2]?(H.test(h[2])&&(n=RegExp("</"+h[2],"g")),o=L):void 0!==h[3]&&(o=L):o===L?">"===h[0]?(o=n??P,c=-1):void 0===h[1]?c=-2:(c=o.lastIndex-h[2].length,a=h[1],o=void 0===h[3]?L:'"'===h[3]?j:R):o===j||o===R?o=L:o===U||o===I?o=P:(o=L,n=void 0);const u=o===L&&t[e+1].startsWith("/>")?" ":"";r+=o===P?s+E:c>=0?(i.push(a),s.slice(0,c)+A+s.slice(c)+C+u):s+C+(-2===c?e:u)}return[q(t,r+(t[s]||"<?>")+(2===e?"</svg>":"")),i]};class J{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,r=0;const o=t.length-1,a=this.parts,[h,c]=G(t,e);if(this.el=J.createElement(h,s),V.currentNode=this.el.content,2===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=V.nextNode())&&a.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(A)){const e=c[r++],s=i.getAttribute(t).split(C),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:o[2],strings:s,ctor:"."===o[1]?Y:"?"===o[1]?tt:"@"===o[1]?et:X}),i.removeAttribute(t)}else t.startsWith(C)&&(a.push({type:6,index:n}),i.removeAttribute(t));if(H.test(i.tagName)){const t=i.textContent.split(C),e=t.length-1;if(e>0){i.textContent=_?_.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],k()),V.nextNode(),a.push({type:2,index:++n});i.append(t[e],k())}}}else if(8===i.nodeType)if(i.data===x)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=i.data.indexOf(C,t+1));)a.push({type:7,index:n}),t+=C.length-1}n++}}static createElement(t,e){const s=O.createElement("template");return s.innerHTML=t,s}}function K(t,e,s=t,i){if(e===B)return e;let n=void 0!==i?s._$Co?.[i]:s._$Cl;const r=M(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=n:s._$Cl=n),void 0!==n&&(e=K(t,n._$AS(t,e.values),n,i)),e}class Z{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??O).importNode(e,!0);V.currentNode=i;let n=V.nextNode(),r=0,o=0,a=s[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new Q(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new st(n,this,t)),this._$AV.push(e),a=s[++o]}r!==a?.index&&(n=V.nextNode(),r++)}return V.currentNode=O,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=D,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=K(this,t,e),M(t)?t===D||null==t||""===t?(this._$AH!==D&&this._$AR(),this._$AH=D):t!==this._$AH&&t!==B&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>F(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==D&&M(this._$AH)?this._$AA.nextSibling.data=t:this.$(O.createTextNode(t)),this._$AH=t}g(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=J.createElement(q(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Z(i,this),s=t.u(this.options);t.p(e),this.$(s),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new J(t)),e}T(t){F(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const n of t)i===e.length?e.push(s=new Q(this.k(k()),this.k(k()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class X{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=D,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=D}_$AI(t,e=this,s,i){const n=this.strings;let r=!1;if(void 0===n)t=K(this,t,e,0),r=!M(t)||t!==this._$AH&&t!==B,r&&(this._$AH=t);else{const i=t;let o,a;for(t=n[0],o=0;o<n.length-1;o++)a=K(this,i[s+o],e,o),a===B&&(a=this._$AH[o]),r||=!M(a)||a!==this._$AH[o],a===D?t=D:t!==D&&(t+=(a??"")+n[o+1]),this._$AH[o]=a}r&&!i&&this.O(t)}O(t){t===D?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Y extends X{constructor(){super(...arguments),this.type=3}O(t){this.element[this.name]=t===D?void 0:t}}class tt extends X{constructor(){super(...arguments),this.type=4}O(t){this.element.toggleAttribute(this.name,!!t&&t!==D)}}class et extends X{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=K(this,t,e,0)??D)===B)return;const s=this._$AH,i=t===D&&s!==D||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==D&&(s===D||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){K(this,t)}}const it=S.litHtmlPolyfillSupport;it?.(J,Q),(S.litHtmlVersions??=[]).push("3.1.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class nt extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let n=i._$litPart$;if(void 0===n){const t=s?.renderBefore??null;i._$litPart$=n=new Q(e.insertBefore(k(),t),t,void 0,s??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return B}}nt._$litElement$=!0,nt.finalized=!0,globalThis.litElementHydrateSupport?.({LitElement:nt});const rt=globalThis.litElementPolyfillSupport;rt?.({LitElement:nt}),(globalThis.litElementVersions??=[]).push("4.0.2");
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ot=Symbol.for(""),at=t=>{if(t?.r===ot)return t?._$litStatic$},ht=t=>({_$litStatic$:t,r:ot}),ct=new Map,lt=(t=>(e,...s)=>{const i=s.length;let n,r;const o=[],a=[];let h,c=0,l=!1;for(;c<i;){for(h=e[c];c<i&&void 0!==(r=s[c],n=at(r));)h+=n+e[++c],l=!0;c!==i&&a.push(r),o.push(h),c++}if(c===i&&o.push(e[i]),l){const t=o.join("$$lit$$");void 0===(e=ct.get(t))&&(o.raw=o,ct.set(t,e=o)),s=a}return t(e,...s)})(z),ut={attribute:!0,type:String,converter:g,reflect:!1,hasChanged:$},dt=(t=ut,e,s)=>{const{kind:i,metadata:n}=s;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),r.set(s.name,t),"accessor"===i){const{name:i}=s;return{set(s){const n=e.get.call(this);e.set.call(this,s),this.requestUpdate(i,n,t)},init(e){return void 0!==e&&this.C(i,void 0,t),e}}}if("setter"===i){const{name:i}=s;return function(s){const n=this[i];e.call(this,s),this.requestUpdate(i,n,t)}}throw Error("Unsupported decorator location: "+i)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ft(t){return(e,s)=>"object"==typeof s?dt(t,e,s):((t,e,s)=>{const i=e.hasOwnProperty(s);return e.constructor.createProperty(s,i?{...t,wrapped:!0}:t),i?Object.getOwnPropertyDescriptor(e,s):void 0})(t,e,s)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function pt(t){return ft({...t,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let mt,yt,vt;function gt(t,e){if(t.nodeType!==Node.ELEMENT_NODE)throw new Error("Can't generate CSS selector for non-element node type.");if("html"===t.tagName.toLowerCase())return"html";const s={root:document.body,idName:t=>!0,className:t=>!0,tagName:t=>!0,attr:(t,e)=>!1,seedMinLength:1,optimizedMinLength:2,threshold:1e3,maxNumberOfTries:1e4};yt={...s,...e},vt=function(t,e){if(t.nodeType===Node.DOCUMENT_NODE)return t;if(t===e.root)return t.ownerDocument;return t}(yt.root,s);let i=$t(t,"all",(()=>$t(t,"two",(()=>$t(t,"one",(()=>$t(t,"none")))))));if(i){const e=Pt(Ut(i,t));return e.length>0&&(i=e[0]),wt(i)}throw new Error("Selector was not found.")}function $t(t,e,s){let i=null,n=[],r=t,o=0;for(;r;){let t=Mt(Tt(r))||Mt(...At(r))||Mt(...Ct(r))||Mt(xt(r))||[{name:"*",penalty:3}];const a=Et(r);if("all"==e)a&&(t=t.concat(t.filter(kt).map((t=>Ot(t,a)))));else if("two"==e)t=t.slice(0,1),a&&(t=t.concat(t.filter(kt).map((t=>Ot(t,a)))));else if("one"==e){const[e]=t=t.slice(0,1);a&&kt(e)&&(t=[Ot(e,a)])}else"none"==e&&(t=[{name:"*",penalty:3}],a&&(t=[Ot(t[0],a)]));for(let e of t)e.level=o;if(n.push(t),n.length>=yt.seedMinLength&&(i=bt(n,s),i))break;r=r.parentElement,o++}return i||(i=bt(n,s)),!i&&s?s():i}function bt(t,e){const s=Pt(Nt(t));if(s.length>yt.threshold)return e?e():null;for(let t of s)if(_t(t))return t;return null}function wt(t){let e=t[0],s=e.name;for(let i=1;i<t.length;i++){const n=t[i].level||0;s=e.level===n-1?`${t[i].name} > ${s}`:`${t[i].name} ${s}`,e=t[i]}return s}function St(t){return t.map((t=>t.penalty)).reduce(((t,e)=>t+e),0)}function _t(t){const e=wt(t);switch(vt.querySelectorAll(e).length){case 0:throw new Error(`Can't select any node with this selector: ${e}`);case 1:return!0;default:return!1}}function Tt(t){const e=t.getAttribute("id");return e&&yt.idName(e)?{name:"#"+CSS.escape(e),penalty:0}:null}function At(t){const e=Array.from(t.attributes).filter((t=>yt.attr(t.name,t.value)));return e.map((t=>({name:`[${CSS.escape(t.name)}="${CSS.escape(t.value)}"]`,penalty:.5})))}function Ct(t){return Array.from(t.classList).filter(yt.className).map((t=>({name:"."+CSS.escape(t),penalty:1})))}function xt(t){const e=t.tagName.toLowerCase();return yt.tagName(e)?{name:e,penalty:2}:null}function Et(t){const e=t.parentNode;if(!e)return null;let s=e.firstChild;if(!s)return null;let i=0;for(;s&&(s.nodeType===Node.ELEMENT_NODE&&i++,s!==t);)s=s.nextSibling;return i}function Ot(t,e){return{name:t.name+`:nth-child(${e})`,penalty:t.penalty+1}}function kt(t){return"html"!==t.name&&!t.name.startsWith("#")}function Mt(...t){const e=t.filter(Ft);return e.length>0?e:null}function Ft(t){return null!=t}function*Nt(t,e=[]){if(t.length>0)for(let s of t[0])yield*Nt(t.slice(1,t.length),e.concat(s));else yield e}function Pt(t){return[...t].sort(((t,e)=>St(t)-St(e)))}function*Ut(t,e,s={counter:0,visited:new Map}){if(t.length>2&&t.length>yt.optimizedMinLength)for(let i=1;i<t.length-1;i++){if(s.counter>yt.maxNumberOfTries)return;s.counter+=1;const n=[...t];n.splice(i,1);const r=wt(n);if(s.visited.has(r))return;_t(n)&&It(n,e)&&(yield n,s.visited.set(r,!0),yield*Ut(n,e,s))}}function It(t,e){return vt.querySelector(wt(t))===e}function Lt(t,e){let s=Object.keys(e),i=Object.values(e);return new Function(...s,`return \`${t}\`;`)(...i)}var Rt=function(t,e,s,i){for(var n,r=arguments.length,o=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i,a=t.length-1;a>=0;a--)(n=t[a])&&(o=(r<3?n(o):r>3?n(e,s,o):n(e,s))||o);return r>3&&o&&Object.defineProperty(e,s,o),o};let jt=class extends nt{constructor(){super(...arguments),this.time=0,this.playing=!1,this._duration=0,this._muted=!1,this._volume=1,this.track=null,this._playersReady=[],this._playersEventsCounter=new Map,this.pauseMutationObserver="false",this._observer=void 0,this.playerTemplateSelector="",this.transcriptTemplateSelector="article",this._start=0,this._end=0,this._section=null,this._clip=null,this._timedText=null,this._timedTextTime=0,this._eventCounter=0,this._triggerTimeUpdateTimeout=0}set currentTime(t){this._seek(t),this._end=this._duration}get currentTime(){return this.time}set currentPseudoTime(t){this._dispatchTimedTextEvent(t)}get seeking(){return Array.from(this._players).some((t=>t.seeking))}get paused(){return!this.playing}play(){const t=this._currentPlayer();t&&t.play()}pause(){const t=this._currentPlayer();t&&t.pause()}get duration(){return this._duration}set muted(t){this._players.forEach((e=>e.muted=t)),this._muted=t}get muted(){return this._muted}get volume(){return this._volume}set volume(t){this._players.forEach((e=>e.volume=t))}get playersEventsCounter(){return Array.from(this._playersEventsCounter.entries()).map((([t,e])=>({player:t,eventsCounter:e})))}_dom2otio(t){t&&(this.track={OTIO_SCHEMA:"Track.1",name:"Transcript",kind:"Video",children:Array.from(t).map((t=>{const e=t.getAttribute("data-media-src"),[s,i]=(t.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t))),n=t.querySelectorAll("p[data-t]:not(*[data-effect]), div[data-t]:not(*[data-effect])"),r=t.querySelectorAll("div[data-t][data-effect]");return{OTIO_SCHEMA:"Clip.1",source_range:{start_time:s,duration:i-s},media_reference:{OTIO_SCHEMA:"MediaReference.1",target:e},metadata:{element:t,selector:gt(t,{root:t.parentElement}),playerTemplateSelector:t.getAttribute("data-player"),data:t.getAttributeNames().filter((t=>t.startsWith("data-"))).reduce(((e,s)=>({...e,[s.replace("data-","").replace("-","_")]:t.getAttribute(s)})),{})},children:Array.from(n).map((s=>{const[i,n]=(s.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t))),r=s.querySelectorAll("*[data-t],*[data-m]"),o=new Intl.Segmenter("en",{granularity:"sentence"}),a=Array.from(r).map((t=>t.textContent)).join(" "),h=[...o.segment(a)[Symbol.iterator]()].map((({index:t,segment:e})=>({index:t,text:e})));return{OTIO_SCHEMA:"Clip.1",source_range:{start_time:i,duration:n-i},media_reference:{OTIO_SCHEMA:"MediaReference.1",target:e},metadata:{element:s,transcript:s.textContent,selector:gt(s,{root:t.parentElement}),data:s.getAttributeNames().filter((t=>t.startsWith("data-"))).reduce(((t,e)=>({...t,[e.replace("data-","").replace("-","_")]:s.getAttribute(e)})),{}),text:a,sentences:h},timed_texts:Array.from(r).map(((e,s,i)=>{let n,r;if(e.getAttribute("data-t")){const t=(e.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t)));n=t[0],r=t[1]}else n=parseFloat(e.getAttribute("data-m")??"")/1e3,r=n+parseFloat(e.getAttribute("data-d")??"")/1e3;const o=i.slice(0,s).map((t=>t.textContent??"")).join(" ")+(s>0?" ":""),a=o.length,c=e.textContent??"",l=Array.from(h).reverse().find((({index:t})=>a>=t)),u=l?.index===a,d=l?.index+l?.text.trim().length===a+c.length,f=!!c.trim().charAt(c.length-1).match(/\p{P}/gu);return{OTIO_SCHEMA:"TimedText.1",marked_range:{start_time:n,duration:r-n},texts:e.textContent??"",style_ids:[],metadata:{element:e,selector:gt(e,{root:t.parentElement}),textOffset:a,sos:u,eos:d,length:c.length,punct:f,ruby:`<ruby>${c}</ruby>`}}})),effects:[]}})).map((t=>{const e=t.timed_texts??[];return e.forEach(((t,e,s)=>{if(0===e)return;const i=s[e-1];t.metadata.sos&&(i.metadata.eos=!0)})),e.forEach(((s,i,n)=>{if(0===i)return s.metadata.lastBreak=0,void(s.metadata.captionGroup=`c${t.source_range.start_time}-${s.metadata.lastBreak}`);if(s.metadata.lastBreak=n[i-1].metadata.lastBreak,s.metadata.captionGroup=`c${t.source_range.start_time}-${s.metadata.lastBreak}`,s.metadata.textOffset+s.metadata.length-s.metadata.lastBreak>=74||i===n.length-1){const t=n.slice(i-5<0?0:i-5,i);let r=t.reverse().find((({metadata:{eos:t}})=>t))??t.find((({metadata:{punct:t}})=>t))??s;r.metadata.pilcrow0=!0,i<e.length-5?(r=e.slice(i,i+3).find((({metadata:{punct:t}})=>t))??s,r.metadata.pilcrow2=!0):i>=e.length-5&&(r=e.slice(i).find((({metadata:{eos:t}})=>t))??t.find((({metadata:{punct:t}})=>t))??s,r.metadata.pilcrow3=!0),s.metadata.pilcrow=!0,s.metadata.lastBreak=s.metadata.textOffset+s.metadata.length+1}})),t})).reduce(((t,s,i,n)=>{if(0===i||i===n.length-1)return[...t,s];const r=n[i-1];if(s.source_range.start_time===r.source_range.start_time+r.source_range.duration)return[...t,s];const o={OTIO_SCHEMA:"Gap.1",source_range:{start_time:r.source_range.start_time+r.source_range.duration,duration:s.source_range.start_time-(r.source_range.start_time+r.source_range.duration)},media_reference:{OTIO_SCHEMA:"MediaReference.1",target:e}};return[...t,o,s]}),[]),effects:Array.from(r).map((e=>({name:e.getAttribute("data-effect")??"",metadata:{element:e,selector:gt(e,{root:t.parentElement}),data:e.getAttributeNames().filter((t=>t.startsWith("data-"))).reduce(((t,s)=>({...t,[s.replace("data-","").replace("-","_")]:e.getAttribute(s)})),{})},source_range:{start_time:parseFloat(e.getAttribute("data-t")?.split(",")[0]??"0"),duration:parseFloat(e.getAttribute("data-t")?.split(",")[1]??"0")-parseFloat(e.getAttribute("data-t")?.split(",")[0]??"0")}})))}})).map((t=>(t.metadata.captions=this.getCaptions(t),t.metadata.captionsUrl=URL.createObjectURL(new Blob([t.metadata.captions],{type:"text/vtt"})),t))),markers:[],metadata:{},effects:[]},console.log({track:this.track}),this._duration=this.track.children.reduce(((t,e)=>t+e.source_range.duration),0))}getCaptions(t){const e=t.children.flatMap((t=>t.timed_texts??[])),s=e.reduce(((t,e)=>(t[e.metadata.captionGroup]||(t[e.metadata.captionGroup]=[]),t[e.metadata.captionGroup].push(e),t)),{}),i=Object.values(s);console.log({captions:i});const n=i.reduce(((t,e)=>{const s=e.findIndex((t=>t.metadata.pilcrow)),i=e.findIndex((t=>t.metadata.pilcrow0));if(i<s){const s=e.slice(i+1);return s[s.length-1].metadata.glue=!0,s[s.length-1].metadata.pilcrow=!1,s[s.length-1].metadata.pilcrow4=!0,[...t,e.slice(0,i+1),s]}return[...t,e]}),[]),r=n.reduce(((t,e,s)=>{if(0===s)return[...t,e];const i=t.pop();return i&&i[i.length-1]?.metadata?.glue?[...t,[...i,...e]]:[...t,i,e]}),[]);console.log({captions2:n,captions3:r});const o=t=>t?new Date(1e3*parseFloat(t.toFixed(3))).toISOString().substring(11,23):"00:00:00:000";let a=["WEBVTT","","Kind: captions","Language: en-US","",""].join("\n");return r.forEach(((t,e)=>{const s=t[0],i=t[t.length-1],n=t.map((t=>t.metadata.ruby+`<${o(t.marked_range.start_time)}>`)).join(" ");a+=`${`${e}`}\n${o(s?.marked_range?.start_time)} --\x3e ${o(i?.marked_range?.start_time+i?.marked_range?.duration)}\n${n}\n\n`})),a}parseTranscript(){const t=document.querySelector(this.transcriptTemplateSelector);if(console.log({article:t}),!t)return;const e=t.querySelectorAll("section[data-media-src]");console.log({sections:e}),this._dom2otio(e)}callback(t,e){if("true"===this.pauseMutationObserver)return;let s;for(const e of t)"childList"===e.type?(console.log("A child node has been added or removed."),s=e.target):"attributes"===e.type&&console.log(`The ${e.attributeName} attribute was modified.`);if(console.log({mutationList:t,_observer:e,article:s}),!s)return;const i=s.querySelectorAll("section[data-media-src]");console.log({sections:i}),this._dom2otio(i)}render(){return lt`<div>
      ${this.track?this.track.children.map(((t,e,s)=>{const i=s.slice(0,e).reduce(((t,e)=>t+e.source_range.duration),0),n=t.source_range.duration,r=document.createElement("template");r.innerHTML=Lt((document.querySelector(t.metadata.playerTemplateSelector??this.playerTemplateSelector)?.innerHTML??"").trim(),{src:t.media_reference.target,captions:t.metadata.captionsUrl,...t.metadata?.data,width:this.width??"auto",height:this.height??"auto"});const o=r.content.childNodes[0],a=o.nodeName.toLowerCase(),h=Array.from(o.attributes).map((t=>`${t.name}=${""!==t.value?t.value:'""'}`)),c=Array.from(r.content.childNodes).slice(1),l=t.effects.flatMap((e=>{const s=e.source_range.start_time-t.source_range.start_time+i,n=s+e.source_range.duration;if(s<=this.time&&this.time<n){const t=(this.time-s)/e.source_range.duration,i=document.createElement("template");return i.innerHTML=Lt((document.querySelector(e.metadata.data.effect)?.innerHTML??"").trim(),{progress:t,...e.metadata?.data}),i.content.childNodes}return null}));return lt`<div class=${i<=this.time&&this.time<i+n?"active wrapper":"wrapper"} style="width: ${this.width??"auto"}px; height: ${this.height??"auto"}px"><${ht(a)} ${ht(h.join(" "))}
            data-t=${`${t.source_range.start_time},${t.source_range.start_time+n}`}
            data-offset=${i}
            _class=${i<=this.time&&this.time<i+n?"active":""}
            style="width: ${this.width}px; height: ${this.height}px"

            @timeupdate=${this._onTimeUpdate}
            @canplay=${this._onCanPlay}
            @play=${this._onPlay}
            @pause=${this._onPause}
            @loadedmetadata=${this._onLoadedMetadata}

            @abort=${this._relayEvent}
            @canplaythrough=${this._relayEvent}
            @durationchange=${this._relayEvent}
            @emptied=${this._relayEvent}
            @ended=${this._relayEvent}
            @loadeddata=${this._relayEvent}
            @loadstart=${this._relayEvent}
            @playing=${this._relayEvent}
            @progress=${this._relayEvent}
            @ratechange=${this._relayEvent}
            @seeked=${this._onSeeked}
            @seeking=${this._relayEvent}
            @suspend=${this._relayEvent}
            @waiting=${this._relayEvent}
            @error=${this._relayEvent}
            @volumechange=${this._relayEvent}
            >
              <track default kind="captions" srclang="en" src="${t.metadata.captionsUrl}" />
              ${o.children}
            </${ht(a)}>
            ${c}
            <!-- overlays -->
            ${l}
          </div>`})):null}
      ${undefined}
      </div>
      <div style="height: 40px"></div>
      <!-- <slot name="transcript" @slotchange=${this.handleSlotchange} @click=${this.handleSlotClick}></slot> -->
    `}_countEvent(t){if(this._playersEventsCounter.has(t.target)){const e=this._playersEventsCounter.get(t.target)??{},s=e[t.type]??0;this._playersEventsCounter.set(t.target,{...e,[t.type]:s+1})}else this._playersEventsCounter.set(t.target,{[t.type]:1})}_relayEvent(t){this._countEvent(t),console.log(t.type)}_ready(){console.log("ready");const t=new URL(window.location.href).searchParams.get("t");if(console.log({t}),t){const[e,s]=t.split(",").map((t=>parseFloat(t)));this._start=e,this._end=s,console.log({_start:this._start,_end:this._end}),setTimeout((()=>{this._seek(e),setTimeout((()=>this._playerAtTime(e)?.play()),1e3)}),1e3)}else this._end=this._duration}_onLoadedMetadata(t){this._countEvent(t),this._playersReady.includes(t.target)||(this._playersReady.push(t.target),this._playersReady.length===this._players.length&&this._ready())}_onSeeked(t){this._countEvent(t);const{target:e}=t,[s,i]=(e.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t))),n=parseFloat(e.getAttribute("data-offset")??"0");s<=e.currentTime&&e.currentTime<=i&&this.playing&&e.paused&&e.currentTime-s+n===this.time&&e.play()}connectedCallback(){super.connectedCallback();const t=document.querySelector(this.transcriptTemplateSelector);if(console.log({article:t}),!t)return;this._observer=new MutationObserver(this.callback.bind(this)),this._observer.observe(t,{attributes:!0,childList:!0,subtree:!0});const e=t.querySelectorAll("section[data-media-src]");console.log({sections:e}),this._dom2otio(e),t.addEventListener("click",this._transcriptClick.bind(this))}_transcriptClick(t){const e=t.target;if(!e||"SPAN"!==e?.nodeName)return;console.log({element:e});const s=e.closest("section"),i=this.track?.children.find((t=>t.metadata.element===s));if(console.log({section:i}),!i)return;const n=this.track?.children.indexOf(i),r=this.track?.children.slice(0,n).reduce(((t,e)=>t+e.source_range.duration),0)??0;let o;if(console.log({sectionIndex:n,offset:r}),e.getAttribute("data-t")){const t=(e.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t)));o=t[0]}else o=parseFloat(e.getAttribute("data-m")??"")/1e3;const a=o-i.source_range.start_time+r;console.log(a),this._seek(a)}_playerAtTime(t){return Array.from(this._players).find((e=>{const[s,i]=(e.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t))),n=parseFloat(e.getAttribute("data-offset")??"0");return s<=t-n+s&&t-n+s<=i}))}_currentPlayer(){return this._playerAtTime(this.time)}_clipAtTime(t){if(!this.track)return{};const e=this.track.children.find(((e,s,i)=>{const n=i.slice(0,s).reduce(((t,e)=>t+e.source_range.duration),0),r=e.source_range.start_time,o=e.source_range.start_time+e.source_range.duration,a=t-n+r;return r<=a&&a<=o}));if(!e)return{};const s=this.track.children.slice(0,this.track.children.indexOf(e)).reduce(((t,e)=>t+e.source_range.duration),0),i=t-s+e.source_range.start_time,n=e.children.find((t=>{const e=t.source_range.start_time,s=t.source_range.start_time+t.source_range.duration;return e<=i&&i<=s}));if(!n)return{section:e,clip:null,timedText:null};let r=n.timed_texts?.find((t=>{const e=t.marked_range.start_time,s=t.marked_range.start_time+t.marked_range.duration;return e<=i&&i<=s}));const o=n.timed_texts?.find((t=>{const e=t.marked_range.start_time;return i<e}))??[...n?.timed_texts??[]].reverse().find((t=>t.marked_range.start_time<=i));return!r&&o&&(r=o),{section:e,clip:n,timedText:r}}_dispatchTimedTextEvent(t){const{section:e,clip:s,timedText:i}=this._clipAtTime(t??this.time);if(!e||!s)return;const n=this.track?.children.indexOf(e),r=this.track?.children.slice(0,n).reduce(((t,e)=>t+e.source_range.duration),0);this._clip!==s&&(this._clip=s),this._timedTextTime!==t??this.time?(this.dispatchEvent(new CustomEvent("playhead",{bubbles:!0,detail:{counter:this._eventCounter++,text:i?.texts,time:this.time,offset:r,pseudo:!!t,pseudoTime:t,transcript:this.transcriptTemplateSelector,media:e.media_reference.target,timedText:i,clip:s,section:e}})),this._timedText=i,this._timedTextTime=t??this.time):console.log("same timed text",t??this.time)}_seek(t){const e=this._playerAtTime(t);if(console.log({time:t,player:e}),!e)return;const s=this._currentPlayer(),[i]=(e.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t))),n=parseFloat(e.getAttribute("data-offset")??"0"),r=!!this.playing;r&&s&&s!==e&&s.pause(),e.currentTime=t-n+i,r&&s&&s!==e&&(this.playing=!0)}_triggerTimeUpdate(){if(clearTimeout(this._triggerTimeUpdateTimeout),this.seeking)return;const t=this._currentPlayer();t&&(t.dispatchEvent(new Event("timeupdate")),this.playing&&(this._triggerTimeUpdateTimeout=setTimeout((()=>requestAnimationFrame(this._triggerTimeUpdate.bind(this))),1e3/15)))}_onTimeUpdate(t){if(this._countEvent(t),this.playing&&this.seeking)return;const{target:e}=t,[s,i]=(e.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t))),n=parseFloat(e.getAttribute("data-offset")??"0"),r=Array.from(this._players),o=r.indexOf(e),a=o<=r.length-1?r[o+1]:null;if(this._end!==this._duration&&this.time>=this._end&&e.pause(),e.currentTime<s)e.currentTime=s,e.pause();else if(s<=e.currentTime&&e.currentTime<=i){if(e.currentTime!==s&&(this.time=e.currentTime-s+n),a){const[t]=(a.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t)));a.currentTime!==t&&(a.currentTime=t)}this.dispatchEvent(new CustomEvent("timeupdate")),this._dispatchTimedTextEvent()}else i<e.currentTime&&(e.pause(),a&&a.play())}_onCanPlay(t){this._countEvent(t);const{target:e}=t;if(e.currentTime>0)return;const[s]=(e.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t)));e.currentTime=s}_onPlay(t){this._countEvent(t);const{target:e}=t,[s,i]=(e.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t)));s<=e.currentTime&&e.currentTime<=i&&(this.playing=!0,this.dispatchEvent(new CustomEvent("play"))),this._triggerTimeUpdate()}_onPause(t){if(this._countEvent(t),this.seeking)return;const{target:e}=t,[s,i]=(e.getAttribute("data-t")??"0,0").split(",").map((t=>parseFloat(t)));s<=e.currentTime&&e.currentTime<=i&&(this.playing=!1,this.dispatchEvent(new CustomEvent("pause")))}handleSlotClick(t){t.target.nodeName}handleSlotchange(t){console.log("SLOT CHANGE");const e=t.target.assignedNodes({flatten:!0}).find((t=>"ARTICLE"===t.nodeName));if(!e)return;this._observer=new MutationObserver(this.callback.bind(this)),this._observer.observe(e,{attributes:!0,childList:!0,subtree:!0});const s=e?.querySelectorAll("section[data-media-src]");this._dom2otio(s)}};jt.styles=document.location.href.indexOf("debug")>0?r`
    :host {
      display: block;
    }
    .active {
      outline: 4px solid red;
      /* display: block !important; */
    }
    *[data-t] {
      margin: 10px;
    }
    .wrapper {
      position: relative;
      display: inline-block;
      /* display: none; */
      color: white;
    }
    video {
      /* width: 640px; */
    }
    video::cue(.yellow) {
      color: yellow;
    }
    ::cue:past {
      color: white;
    }
    ::cue:future {
      color: grey;
    }
  `:r`
  :host {
      display: block;
    }
    .active {
      /* outline: 4px solid red; */
      display: block !important;
    }
    *[data-t] {
      /* margin: 10px; */
    }
    .wrapper {
      position: relative;
      /* display: inline-block; */
      display: none;
      color: white;
    }
    video {
      width: 320px;
    }
  `,Rt([ft({type:Number})],jt.prototype,"width",void 0),Rt([ft({type:Number})],jt.prototype,"height",void 0),Rt([pt()],jt.prototype,"time",void 0),Rt([pt()],jt.prototype,"playing",void 0),Rt([pt()],jt.prototype,"_duration",void 0),Rt([pt()],jt.prototype,"track",void 0),Rt([function(t){return(e,s)=>((t,e,s)=>(s.configurable=!0,s.enumerable=!0,s))(0,0,{get(){return(this.renderRoot??(mt??=document.createDocumentFragment())).querySelectorAll(t)}})}("*[data-t]")],jt.prototype,"_players",void 0),Rt([ft({type:String,attribute:"pause-mutation-observer"})],jt.prototype,"pauseMutationObserver",void 0),Rt([ft({type:String,attribute:"player"})],jt.prototype,"playerTemplateSelector",void 0),Rt([ft({type:String,attribute:"transcript"})],jt.prototype,"transcriptTemplateSelector",void 0),Rt([pt()],jt.prototype,"_clip",void 0),jt=Rt([(t=>(e,s)=>{void 0!==s?s.addInitializer((()=>{customElements.define(t,e)})):customElements.define(t,e)})
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */("timedtext-player")],jt);export{jt as TimedTextPlayer};