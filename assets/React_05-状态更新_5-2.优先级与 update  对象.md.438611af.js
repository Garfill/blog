import{_ as s,c as a,o as e,a as n}from"./app.d474d6c4.js";const u=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[{"level":2,"title":"\u540C\u6B65\u66F4\u65B0\u6A21\u5F0F\uFF08legacy\uFF09","slug":"\u540C\u6B65\u66F4\u65B0\u6A21\u5F0F-legacy","link":"#\u540C\u6B65\u66F4\u65B0\u6A21\u5F0F-legacy","children":[]},{"level":2,"title":"\u5F02\u6B65\u66F4\u65B0\u6A21\u5F0F\uFF08\u5E76\u53D1\u66F4\u65B0\uFF09","slug":"\u5F02\u6B65\u66F4\u65B0\u6A21\u5F0F-\u5E76\u53D1\u66F4\u65B0","link":"#\u5F02\u6B65\u66F4\u65B0\u6A21\u5F0F-\u5E76\u53D1\u66F4\u65B0","children":[]},{"level":2,"title":"Update \u5BF9\u8C61\u5206\u7C7B","slug":"update-\u5BF9\u8C61\u5206\u7C7B","link":"#update-\u5BF9\u8C61\u5206\u7C7B","children":[]},{"level":2,"title":"Update\u7ED3\u6784","slug":"update\u7ED3\u6784","link":"#update\u7ED3\u6784","children":[]},{"level":2,"title":"updateQueue","slug":"updatequeue","link":"#updatequeue","children":[]}],"relativePath":"React/05-\u72B6\u6001\u66F4\u65B0/5-2.\u4F18\u5148\u7EA7\u4E0E update  \u5BF9\u8C61.md"}'),o={name:"React/05-\u72B6\u6001\u66F4\u65B0/5-2.\u4F18\u5148\u7EA7\u4E0E update  \u5BF9\u8C61.md"},l=n(`<p>\u5206\u60C5\u51B5</p><h2 id="\u540C\u6B65\u66F4\u65B0\u6A21\u5F0F-legacy" tabindex="-1">\u540C\u6B65\u66F4\u65B0\u6A21\u5F0F\uFF08legacy\uFF09 <a class="header-anchor" href="#\u540C\u6B65\u66F4\u65B0\u6A21\u5F0F-legacy" aria-hidden="true">#</a></h2><blockquote><p>\u6CA1\u6709\u4F18\u5148\u7EA7\u6982\u5FF5\uFF0C\u540C\u6B65\u6309\u987A\u5E8F\u66F4\u65B0</p></blockquote><h2 id="\u5F02\u6B65\u66F4\u65B0\u6A21\u5F0F-\u5E76\u53D1\u66F4\u65B0" tabindex="-1">\u5F02\u6B65\u66F4\u65B0\u6A21\u5F0F\uFF08\u5E76\u53D1\u66F4\u65B0\uFF09 <a class="header-anchor" href="#\u5F02\u6B65\u66F4\u65B0\u6A21\u5F0F-\u5E76\u53D1\u66F4\u65B0" aria-hidden="true">#</a></h2><blockquote><p>\u4F4E\u4F18\u5148\u7EA7\u66F4\u65B0\u8FC7\u7A0B\u4E2D\uFF0C\u4F1A\u88AB\u9AD8\u4F18\u5148\u7EA7\u4E2D\u65AD\uFF0C\u4F18\u5148\u66F4\u65B0\u9AD8\u4F18\u5148\u7EA7\uFF0C\u5B8C\u6210\u4E4B\u540E <strong>\u91CD\u65B0\u5F00\u59CB</strong> \u4F4E\u4F18\u5148\u7EA7\u7684\u66F4\u65B0</p></blockquote><h2 id="update-\u5BF9\u8C61\u5206\u7C7B" tabindex="-1">Update \u5BF9\u8C61\u5206\u7C7B <a class="header-anchor" href="#update-\u5BF9\u8C61\u5206\u7C7B" aria-hidden="true">#</a></h2><p>\u53EF\u4EE5 <strong>\u89E6\u53D1\u66F4\u65B0</strong> \u7684\u65B9\u6CD5</p><ul><li>ReactDOM.render \u2014\u2014 HostRoot</li><li>this.setState \u2014\u2014 ClassComponent</li><li>this.forceUpdate \u2014\u2014 ClassComponent</li><li>useState \u2014\u2014 FunctionComponent</li><li>useReducer \u2014\u2014 FunctionComponent</li></ul><p>\u7531\u4E8E\u4E0D\u540C\u7C7B\u578B\u7EC4\u4EF6\u5DE5\u4F5C\u65B9\u5F0F\u4E0D\u540C\uFF0C\u6240\u4EE5\u5B58\u5728\u4E24\u79CD\u4E0D\u540C\u7ED3\u6784\u7684<code>Update</code>\uFF0C\u5176\u4E2D<code>ClassComponent</code>\u4E0E<code>HostRoot</code>\u5171\u7528\u4E00\u5957<code>Update</code>\u7ED3\u6784\uFF0C<code>FunctionComponent</code>\u5355\u72EC\u4F7F\u7528\u4E00\u79CD<code>Update</code>\u7ED3\u6784</p><h2 id="update\u7ED3\u6784" tabindex="-1">Update\u7ED3\u6784 <a class="header-anchor" href="#update\u7ED3\u6784" aria-hidden="true">#</a></h2><p><code>ClassComponent</code>\u4E0E<code>HostRoot</code>\uFF08\u5373<code>rootFiber.tag</code>\u5BF9\u5E94\u7C7B\u578B\uFF09\u5171\u7528\u540C\u4E00\u79CD<code>Update\u7ED3\u6784</code></p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> update </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  eventTime</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// \u4EFB\u52A1\u65F6\u95F4</span></span>
<span class="line"><span style="color:#A6ACCD;">	lane</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// \u4F18\u5148\u7EA7\u76F8\u5173\u5B57\u6BB5</span></span>
<span class="line"><span style="color:#A6ACCD;">  suspenseConfig</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">tag</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> UpdateState</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// \u66F4\u65B0\u7C7B\u578B</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">payload</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null,</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// \u66F4\u65B0\u6302\u8F7D\u7684\u6570\u636E</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">callback</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null,</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// \u66F4\u65B0\u56DE\u8C03\u51FD\u6570</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">next</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null,</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// \u4E0E\u5176\u4ED6update\u5F62\u6210\u94FE\u8868</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><blockquote><p>\u5728 class \u7EC4\u4EF6\u4E2D\uFF0C\u53EF\u80FD\u4F1A\u5728\u67D0\u4E2A\u64CD\u4F5C\u4E2D <strong>\u8C03\u7528\u591A\u6B21setState</strong>\uFF0C\u751F\u6210\u591A\u4E2A update\u5BF9\u8C61</p></blockquote><p><code>Fiber\u8282\u70B9</code>\u6700\u591A\u540C\u65F6\u5B58\u5728\u4E24\u4E2A<code>updateQueue</code>\uFF1A</p><ul><li><code>current fiber</code>\u4FDD\u5B58\u7684<code>updateQueue</code>\u5373<code>current updateQueue</code></li><li><code>workInProgress fiber</code>\u4FDD\u5B58\u7684<code>updateQueue</code>\u5373<code>workInProgress updateQueue</code></li></ul><h2 id="updatequeue" tabindex="-1">updateQueue <a class="header-anchor" href="#updatequeue" aria-hidden="true">#</a></h2><p><code>updateQueue</code>\u6709\u4E09\u79CD\u7C7B\u578B\uFF0C\u5176\u4E2D <code>HostComponent</code> \u7684\u5728 <code>CompleteWork</code> \u8BF4\u8FC7 \u5269\u4E0B\u7684\u548C\u4E24\u4E2A\u4E0D\u540C\u7ED3\u6784\u7684 Update \u5BF9\u5E94</p><p><code>ClassComponent</code></p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> queue</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">UpdateQueue</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">State</span><span style="color:#89DDFF;">&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">baseState</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> fiber</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">memoizedState</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// \u672C\u6B21\u66F4\u65B0\u4E4B\u524D\u7684state</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">firstBaseUpdate</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null,</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// \u672C\u6B21\u66F4\u65B0\u4E4B\u524D\uFF0C\u8282\u70B9\u5C31\u4FDD\u5B58\u6709\u7684update\u94FE\u8868\u5934</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">lastBaseUpdate</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">shared</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">      </span><span style="color:#F07178;">pending</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null,</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// \u89E6\u53D1\u66F4\u65B0\uFF0C\u4EA7\u751F\u7684update\u73AF\u72B6\u94FE\u8868</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#F07178;">effects</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null,</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// \u6709\u56DE\u8C03\u7684update</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">};</span></span>
<span class="line"></span></code></pre></div><p>\u5904\u7406\u903B\u8F91\u5728 <code>processUpdateQueue</code> \u51FD\u6570\uFF0C\u5904\u7406 <code>firstBaseUpdate</code> \u548C <code>lastBaseUpdate</code> \u548C <code>shared.pending</code>\uFF0C\u5BF9\u6BD4 <code>update</code> \u7684\u4F18\u5148\u7EA7\uFF0C\u9009\u62E9\u9AD8\u4F18\u5148\u7EA7\u66F4\u65B0</p>`,20),p=[l];function t(c,r,d,D,y,C){return e(),a("div",null,p)}const A=s(o,[["render",t]]);export{u as __pageData,A as default};
