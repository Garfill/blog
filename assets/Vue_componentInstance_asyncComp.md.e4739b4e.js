import{_ as s,c as n,o as a,a as l}from"./app.2862a37c.js";const i=JSON.parse('{"title":"\u5F02\u6B65\u7EC4\u4EF6","description":"","frontmatter":{},"headers":[{"level":2,"title":"\u5DE5\u5382\u51FD\u6570\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6","slug":"\u5DE5\u5382\u51FD\u6570\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6","link":"#\u5DE5\u5382\u51FD\u6570\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6","children":[{"level":3,"title":"\u5206\u6790 Vue.component \u7684\u5B9E\u73B0","slug":"\u5206\u6790-vue-component-\u7684\u5B9E\u73B0","link":"#\u5206\u6790-vue-component-\u7684\u5B9E\u73B0","children":[]},{"level":3,"title":"\u521B\u5EFA\u5F02\u6B65\u7EC4\u4EF6 VNode","slug":"\u521B\u5EFA\u5F02\u6B65\u7EC4\u4EF6-vnode","link":"#\u521B\u5EFA\u5F02\u6B65\u7EC4\u4EF6-vnode","children":[]},{"level":3,"title":"\u91CD\u65B0\u6E32\u67D3","slug":"\u91CD\u65B0\u6E32\u67D3","link":"#\u91CD\u65B0\u6E32\u67D3","children":[]}]},{"level":2,"title":"Promise\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6","slug":"promise\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6","link":"#promise\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6","children":[]}],"relativePath":"Vue/componentInstance/asyncComp.md","lastUpdated":1667791259000}'),p={name:"Vue/componentInstance/asyncComp.md"},o=l(`<h1 id="\u5F02\u6B65\u7EC4\u4EF6" tabindex="-1">\u5F02\u6B65\u7EC4\u4EF6 <a class="header-anchor" href="#\u5F02\u6B65\u7EC4\u4EF6" aria-hidden="true">#</a></h1><h2 id="\u5DE5\u5382\u51FD\u6570\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6" tabindex="-1">\u5DE5\u5382\u51FD\u6570\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6 <a class="header-anchor" href="#\u5DE5\u5382\u51FD\u6570\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6" aria-hidden="true">#</a></h2><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// \u793A\u4F8B</span></span>
<span class="line"><span style="color:#A6ACCD;">Vue</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">component</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">async-test</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">function</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">resolve</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">reject</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#82AAFF;">require</span><span style="color:#F07178;">([</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">./components/Test.vue</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;">]</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">resolve</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">)</span></span>
<span class="line"><span style="color:#676E95;">// \u540C\u6837\u6269\u5C55\u5230 Vue.options.components</span></span>
<span class="line"></span></code></pre></div><p>\u5DE5\u5382\u51FD\u6570\u4F1A<strong>\u5F02\u6B65\u89E3\u6790</strong>\u7EC4\u4EF6\u5B9A\u4E49\uFF0C\u53EA\u6709\u9700\u8981\u6E32\u67D3\u65F6\u624D\u89E6\u53D1\u5DE5\u5382\u51FD\u6570\uFF0C\u5E76<strong>\u7F13\u5B58\u7ED3\u679C</strong></p><h3 id="\u5206\u6790-vue-component-\u7684\u5B9E\u73B0" tabindex="-1">\u5206\u6790 Vue.component \u7684\u5B9E\u73B0 <a class="header-anchor" href="#\u5206\u6790-vue-component-\u7684\u5B9E\u73B0" aria-hidden="true">#</a></h3><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// global-api/assets.js</span></span>
<span class="line"><span style="color:#A6ACCD;">Vue[type] </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">id</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">definitino</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u8FD9\u91CC\u5BF9\u4E8E\u5F02\u6B65\u7EC4\u4EF6\u6765\u8BF4\u5565\u90FD\u6CA1\u6267\u884C</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u5C31\u53EA\u662F\u8FD4\u56DE\u4E86\u90A3\u4E2A\u6784\u9020\u51FD\u6570</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">options</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">type</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">+</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">s</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;">][</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">definition</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">definition</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h3 id="\u521B\u5EFA\u5F02\u6B65\u7EC4\u4EF6-vnode" tabindex="-1">\u521B\u5EFA\u5F02\u6B65\u7EC4\u4EF6 VNode <a class="header-anchor" href="#\u521B\u5EFA\u5F02\u6B65\u7EC4\u4EF6-vnode" aria-hidden="true">#</a></h3><p><strong>\u53EA\u6709\u5F53\u67D0\u4E2A\u7EC4\u4EF6\u4E2D\u9700\u8981\u8FDB\u884C\u8FD9\u4E2A\u5F02\u6B65\u7EC4\u4EF6\u7684\u6E32\u67D3\uFF0C\u624D\u4F1A\u8FDB\u884C\u6587\u4EF6\u7684\u52A0\u8F7D</strong></p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// vdom/create-component</span></span>
<span class="line"><span style="color:#676E95;">// \u9700\u8981\u8FD9\u4E2A\u5F02\u6B65\u7EC4\u4EF6\u7684\u65F6\u5019\uFF0C \u6240\u5305\u542B\u7684 \u7EC4\u4EF6\u6E32\u67D3vnode \u53D1\u751F\u53D8\u5316\uFF0C\u91CD\u65B0\u6E32\u67D3\u751F\u6210\u5BF9\u5E94 vnode</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">createComponent</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">Ctor</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">data</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">context</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">childrend</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">tag</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">baseCtor</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">context</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">$options</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">_base</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// Vue</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u4E2D\u95F4\u8FD9\u90E8\u5206\u4E3A\u5E38\u89C4\u7EC4\u4EF6\u7684Ctor\u5904\u7406</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// Ctor = \u4F20\u5165\u7684\u6784\u9020\u51FD\u6570 f(res, rej)</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">asyncFactory</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#82AAFF;">isUndef</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">Ctor</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">cid</span><span style="color:#F07178;">)) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">asyncFactory</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">Ctor</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">Ctor</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">resolveAsyncComponent</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">asyncFactory</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">baseCtor</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">Ctor</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">===</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">undefined</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">      </span><span style="color:#676E95;">// \u7B2C\u4E00\u6B21\u52A0\u8F7D\u7684\u65F6\u5019\u8FD4\u56DE\u7684Ctor = undefined</span></span>
<span class="line"><span style="color:#89DDFF;">      </span><span style="color:#676E95;">// \u8FD4\u56DE\u6CE8\u91CA\u8282\u70B9\u5360\u4F4D\u6E32\u67D3</span></span>
<span class="line"><span style="color:#89DDFF;">      </span><span style="color:#676E95;">// \u5B9E\u9645\u6E32\u67D3\u51FD\u6570\u6CA1\u6709\u53D8</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">createAsyncPlaceholder</span><span style="color:#F07178;">(</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#A6ACCD;">asyncFactory</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#A6ACCD;">data</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#A6ACCD;">context</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#A6ACCD;">children</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#A6ACCD;">tag</span></span>
<span class="line"><span style="color:#F07178;">      )</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;">// vdom/helpers/resolve-async-component.js</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">resolveAsyncComponent</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">factory</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">baseCtor</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#82AAFF;">isDef</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">factory</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">resolved</span><span style="color:#F07178;">)) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// \u8FD9\u662F\u52A0\u8F7D\u4E4B\u540E\u5F3A\u5236\u6E32\u67D3\u7684\u6267\u884C</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// \u8FD4\u56DE\u7F16\u8BD1\u597D\u7684\u6784\u9020\u51FD\u6570\u4F5C\u4E3ACtor\u6765\u751F\u6210\u7EC4\u4EF6</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">factory</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">resolved</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u7B2C\u4E00\u6B21\u52A0\u8F7D</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// factory \u5C31\u662F\u4F20\u5165\u7684\u6784\u9020\u51FD\u6570</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">owners</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">factory</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">owners</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> [</span><span style="color:#A6ACCD;">owner</span><span style="color:#F07178;">] </span><span style="color:#676E95;">// \u5F53\u524D\u5F02\u6B65\u7EC4\u4EF6\u6240\u5728\u7684\u5B9E\u4F8Bvm</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">sync</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#FF9CAC;">true</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#A6ACCD;">owner</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">$on</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">hook:destroyed</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">()</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">remove</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">owners</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">owner</span><span style="color:#F07178;">))</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">forceRender</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">renderCompleted</span><span style="color:#89DDFF;">)</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">for</span><span style="color:#F07178;"> (</span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">l</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">owners</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">length</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&lt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">l</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">i</span><span style="color:#89DDFF;">++</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#A6ACCD;">owners</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;">]</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">$forceUpdate</span><span style="color:#F07178;">() </span><span style="color:#676E95;">// \u5F3A\u5236\u6E32\u67D3\uFF0C\u56E0\u4E3A\u53EF\u80FD\u5728\u8FD9\u8FC7\u7A0B\u4E2Dvm \u7684\u6570\u636E\u53D1\u751F\u53D8\u5316</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span></span>
<span class="line"><span style="color:#F07178;">  </span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">resolve</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">once</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">res</span><span style="color:#89DDFF;">)</span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// \u52A0\u8F7D\u540E\u7684\u56DE\u8C03</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// \u5C31\u662FVue.extend\u8FD4\u56DE\u7684\u6784\u9020\u51FD\u6570</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// \u6784\u9020\u51FD\u6570\u7F13\u5B58\u5230\u5DE5\u5382\u51FD\u6570\u4E2D\uFF0C\u4E0D\u7528\u6BCF\u6B21\u52A0\u8F7D\u90FD\u6765\u4E00\u6B21</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">factory</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">resolved</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">ensureCtor</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">res</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">baseCtor</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">sync</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">      </span><span style="color:#676E95;">// \u52A0\u8F7D\u540E\u5F3A\u5236\u6E32\u67D3\u4E00\u6B21</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#82AAFF;">forceRender</span><span style="color:#F07178;">(</span><span style="color:#FF9CAC;">true</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#A6ACCD;">owners</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">length</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#F78C6C;">0</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">reject</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">once</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">reason</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">  </span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">res</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">factory</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">resolve</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">reject</span><span style="color:#F07178;">) </span><span style="color:#676E95;">// \u6267\u884C\u52A0\u8F7D\u6587\u4EF6\u7684\u903B\u8F91</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u5982\u679C\u5F02\u6B65\u7EC4\u4EF6\u7684\u6587\u4EF6\u52A0\u8F7D\u662F\u4E2A\u5F02\u6B65\u7684\u8FC7\u7A0B\uFF0C\u90A3\u4E48\u4F1A\u5148\u6267\u884C\u5B8C\u5F53\u524D\u4EE3\u7801</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">sync</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#FF9CAC;">false</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">factory</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">loading</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">?</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">factory</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">loadingComp</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">:</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">factory</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">resolved</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">createAsyncPlaceholder</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">factory</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">data</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">context</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">children</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">tag</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">node</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">createEmptyVNode</span><span style="color:#F07178;">()</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">node</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">asyncFactory</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">factory</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">node</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">asyncMeta</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">data</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">context</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">children</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">tag</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">node</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u521B\u9020\u4E00\u4E2A\u7A7Avnode\u8FD4\u56DE\uFF0C\u8FD9\u4E2Avnode\u4F1A\u88AB\u6D4F\u89C8\u5668\u89E3\u91CA\u6210\u4E00\u4E2A\u6CE8\u91CA\u8282\u70B9(&lt;!----&gt;)</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h3 id="\u91CD\u65B0\u6E32\u67D3" tabindex="-1">\u91CD\u65B0\u6E32\u67D3 <a class="header-anchor" href="#\u91CD\u65B0\u6E32\u67D3" aria-hidden="true">#</a></h3><p>\u91CD\u65B0\u6E32\u67D3\u7684\u65F6\u5019\uFF0C\u4F1A\u91CD\u65B0\u8D70\u4E00\u6B21vnode\u7684\u6E32\u67D3</p><h2 id="promise\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6" tabindex="-1">Promise\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6 <a class="header-anchor" href="#promise\u5B9E\u73B0\u5F02\u6B65\u7EC4\u4EF6" aria-hidden="true">#</a></h2><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#A6ACCD;">Vue</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">component</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">async-comp</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">import</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">path/to/async/comp</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">)</span></span>
<span class="line"></span></code></pre></div><p>\u52A0\u8F7D\u7684\u987A\u5E8F\u548C\u4E4B\u524D\u5DE5\u5382\u51FD\u6570\u7684\u7C7B\u4F3C</p><p>\u4E0D\u540C\u5730\u65B9\u5728\u4E8E</p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">resolveAsyncComponent</span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">res</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">factory</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">resolve</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">reject</span><span style="color:#F07178;">) </span><span style="color:#676E95;">// import\u5728webpack\u4E2D\u8FD4\u56DE\u4E00\u4E2Apromise</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#82AAFF;">isObject</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">res</span><span style="color:#F07178;">)) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#82AAFF;">isPromise</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">res</span><span style="color:#F07178;">)) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#82AAFF;">isUndef</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">factory</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">resolved</span><span style="color:#F07178;">)) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#A6ACCD;">res</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">then</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">resolve</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">reject</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u4E4B\u540E\u4E0E\u5DE5\u5382\u51FD\u6570\u4E00\u6837\uFF0C\u7B2C\u4E00\u6B21\u8FD4\u56DEundefined\uFF0C\u52A0\u8F7D\u4E4B\u540E\u6267\u884Cresolve \uFF0C\u518D\u6267\u884C\u5F3A\u5236\u6E32\u67D3</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div>`,16),e=[o];function c(t,r,y,F,D,A){return a(),n("div",null,e)}const d=s(p,[["render",c]]);export{i as __pageData,d as default};