import{_ as s,c as n,o as a,a as p}from"./app.f8721fc1.js";const i=JSON.parse('{"title":"\u7EC4\u4EF6\u6CE8\u518C","description":"","frontmatter":{},"headers":[{"level":2,"title":"\u5168\u5C40\u6CE8\u518C\u5B9E\u73B0","slug":"\u5168\u5C40\u6CE8\u518C\u5B9E\u73B0","link":"#\u5168\u5C40\u6CE8\u518C\u5B9E\u73B0","children":[]},{"level":2,"title":"\u5C40\u90E8\u6CE8\u518C","slug":"\u5C40\u90E8\u6CE8\u518C","link":"#\u5C40\u90E8\u6CE8\u518C","children":[{"level":3,"title":"mergeOptions \u5408\u5E76 components \u7684\u89C4\u5219","slug":"mergeoptions-\u5408\u5E76-components-\u7684\u89C4\u5219","link":"#mergeoptions-\u5408\u5E76-components-\u7684\u89C4\u5219","children":[]}]}],"relativePath":"Vue/componentInstance/registerComponent.md","lastUpdated":1667791259000}'),l={name:"Vue/componentInstance/registerComponent.md"},o=p(`<h1 id="\u7EC4\u4EF6\u6CE8\u518C" tabindex="-1">\u7EC4\u4EF6\u6CE8\u518C <a class="header-anchor" href="#\u7EC4\u4EF6\u6CE8\u518C" aria-hidden="true">#</a></h1><p>\u7EC4\u4EF6\u5728\u4F7F\u7528\u4E4B\u524D\u90FD\u9700\u8981\u5148\u6CE8\u518C</p><p>\u6CE8\u518C\u65B9\u5F0F\u6709</p><ul><li>\u5168\u5C40\u6CE8\u518C</li><li>\u5C40\u90E8\u6CE8\u518C</li></ul><h2 id="\u5168\u5C40\u6CE8\u518C\u5B9E\u73B0" tabindex="-1">\u5168\u5C40\u6CE8\u518C\u5B9E\u73B0 <a class="header-anchor" href="#\u5168\u5C40\u6CE8\u518C\u5B9E\u73B0" aria-hidden="true">#</a></h2><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// global-api/assets.js</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">initAssetRegisters</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">Vue</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u5B9E\u4F8B\u8D44\u6E90\u5206\u4E3A \u7EC4\u4EF6\u3001\u6307\u4EE4\u3001\u8FC7\u6EE4\u5668 \u4E09\u7C7B</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">ASSET_TYPES</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">forEach</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">type</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">Vue</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">type</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">function</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">id</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">definition</span><span style="color:#89DDFF;">)</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">definition</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">options</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">type</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">+</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">s</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;">][</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">]</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">type</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">===</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">component</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&amp;&amp;</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">isPlainObject</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">definition</span><span style="color:#F07178;">)) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">          </span><span style="color:#676E95;">// \u53D6\u540D\u5B57\uFF0C\u540E\u7EED\u751F\u6210\u7EC4\u4EF6\u5360\u4F4Dvnode\u7528\u5230</span></span>
<span class="line"><span style="color:#F07178;">          </span><span style="color:#A6ACCD;">definition</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">name</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">definition</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">name</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">||</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">id</span></span>
<span class="line"><span style="color:#89DDFF;">          </span><span style="color:#676E95;">// Vue\u4E0A\u7684\u9759\u6001\u65B9\u6CD5\uFF0Cthis = Vue</span></span>
<span class="line"><span style="color:#89DDFF;">          </span><span style="color:#676E95;">// \u8FD9\u91CC\u5176\u5B9E\u5C31\u662F Vue.extend \u8FD4\u56DE\u7684\u6784\u9020\u5668\u51FD\u6570</span></span>
<span class="line"><span style="color:#F07178;">          </span><span style="color:#A6ACCD;">definition</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">options</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">_base</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">extend</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">definition</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">        </span><span style="color:#676E95;">// directive \u76F8\u5173</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">options</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">type</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">+</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">s</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;">][</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">definition</span></span>
<span class="line"><span style="color:#89DDFF;">        </span><span style="color:#676E95;">// \u6269\u5C55\u5230Vue.options\u4E0A</span></span>
<span class="line"><span style="color:#89DDFF;">        </span><span style="color:#676E95;">// \u53EF\u4EE5\u901A\u8FC7Vue.options.components[id] \u6765\u8BBF\u95EE\u5BF9\u5E94\u7684\u6784\u9020\u5668\u51FD\u6570</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">definition</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#676E95;">// \u4E0A\u9762\u8FD9\u4E2A\u51FD\u6570\u4F1A\u5728 initGlobalApi(Vue) \u51FD\u6570\u4E2D\u8C03\u7528</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;">// \u5173\u4E8E\u8FD9\u4E9B\u7EC4\u4EF6\u3001\u6307\u4EE4\u8FD9\u4E9B\u8D44\u6E90\u7684\u521D\u59CB\u5316</span></span>
<span class="line"><span style="color:#676E95;">// global-api/index.js</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">initGlobalAPI</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">Vue</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">ASSET_TYPES</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">forEach</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">type</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">Vue</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">options</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">type</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">+</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">s</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">Object</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">create</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">null</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#82AAFF;">extend</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">Vue</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">options</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">components</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">builtInComponents</span><span style="color:#F07178;">) </span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u5185\u7F6E\u7EC4\u4EF6\u8D4B\u503C\u5230Vue.options.components</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><p>\u5728<strong>\u521D\u59CB\u5316vnode</strong>\u8FC7\u7A0B\u4E2D\uFF0C\u4F1A\u901A\u8FC7 render \u51FD\u6570\u8C03\u7528 <strong>createElement</strong> \u65B9\u6CD5</p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// vdom/create-element.js</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">_createElement</span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">...</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> ((</span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">data</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">||</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">data</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">pre</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">&amp;&amp;</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">isDef</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">Ctor</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">resolveAsset</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">context</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">$options</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">components</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">tag</span><span style="color:#F07178;">))) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// \u8FD9\u91CC\u901A\u8FC7 resolve \u5230\u5BF9\u5E94\u7684 components \u5B9A\u4E49\uFF0C\u521B\u5EFA\u5BF9\u5E94\u7684\u7EC4\u4EF6vnode</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">vnode</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">createComponent</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">Ctor</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">data</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">context</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">children</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">tag</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">...</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#676E95;">// util/options.js</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">resolveAsset</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">options</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">type</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">id</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">warn</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// options = vm.$options</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u6CE8\u610F\u8FD9\u91CC\u7684 $options \u662F\u901A\u8FC7\u5408\u5E76\u914D\u7F6E\u4E4B\u540E\u7684options</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">assets</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">options</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">type</span><span style="color:#F07178;">]</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#82AAFF;">hasOwn</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">assets</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">)) </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">assets</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">]</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u5C0F\u9A7C\u5CF0\u5199\u6CD5</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">camelizedId</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">camelize</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#82AAFF;">hasOwn</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">assets</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">camelizedId</span><span style="color:#F07178;">)) </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">assets</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">camelizedId</span><span style="color:#F07178;">]</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u9996\u5B57\u6BCD\u5927\u5199</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">PascalCaseId</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">capitalize</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">camelizedId</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#82AAFF;">hasOwn</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">assets</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">PascalCaseId</span><span style="color:#F07178;">)) </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">assets</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">PascalCaseId</span><span style="color:#F07178;">]</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u6CE8\u610F\u4E0A\u9762\u8FD9\u4E9B\u90FD\u662F\u7528 Object.prototype.hasOwnProperty \u6765\u5224\u65AD\u662F\u5426\u5B58\u5728\u7684\uFF0C\u4E5F\u5C31\u662F\u975E\u7EE7\u627F\u7684</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">res</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">assets</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">||</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">assets</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">camelizedId</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">||</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">assets</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">PascalCaseId</span><span style="color:#F07178;">]</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">res</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u6700\u540E\u6240\u6709\u5199\u6CD5\u90FD\u627E\u4E0D\u5230\uFF0C\u5C31\u901A\u8FC7\u539F\u578B\u94FE\u53BB\u627E</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><p>\u7ED3\u8BBA\uFF1A\u901A\u8FC7 <strong>Vue.component</strong> \u6765\u6CE8\u518C\uFF0C\u5C31\u4F1A\u901A\u8FC7 <strong>options</strong> \u6269\u5C55\u5230 <strong>Vue.options</strong> \u4E0A\uFF0C\u6700\u540E\u901A\u8FC7options \u6765\u5BFB\u627E\u5230\u5BF9\u5E94\u7684\u5B9A\u4E49</p><h2 id="\u5C40\u90E8\u6CE8\u518C" tabindex="-1">\u5C40\u90E8\u6CE8\u518C <a class="header-anchor" href="#\u5C40\u90E8\u6CE8\u518C" aria-hidden="true">#</a></h2><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// global-api/extend.js</span></span>
<span class="line"><span style="color:#A6ACCD;">Vue</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">extend</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">extendOptions</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">...</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">Sub</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">options</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">mergeOptions</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">Super</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">options</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">extendOptions</span><span style="color:#F07178;">) </span><span style="color:#676E95;">// Super = Vue</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">...</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#676E95;">// \u53EF\u4EE5\u901A\u8FC7 vm.$options.components \u8BBF\u95EE</span></span>
<span class="line"><span style="color:#676E95;">// \u901A\u8FC7mergeOptions\u6269\u5C55\u5230\u6784\u9020\u51FD\u6570\u7684options\u4E0A</span></span>
<span class="line"><span style="color:#676E95;">// \u7136\u540E\u5B50\u6784\u9020\u51FD\u6570\u521D\u59CB\u5316\u65F6\u5C31\u53EF\u4EE5\u901A\u8FC7options\u627E\u5230</span></span>
<span class="line"></span></code></pre></div><h3 id="mergeoptions-\u5408\u5E76-components-\u7684\u89C4\u5219" tabindex="-1">mergeOptions \u5408\u5E76 components \u7684\u89C4\u5219 <a class="header-anchor" href="#mergeoptions-\u5408\u5E76-components-\u7684\u89C4\u5219" aria-hidden="true">#</a></h3><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// util/options.js</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">mergeAssets</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">parentVal</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">childVal</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">vm</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">key</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// parentVal = Vue.options</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">res</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">Object</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">create</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">parentVal</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">||</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">childVal</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">extend</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">res</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">childVal</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">res</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#676E95;">// \u5728Sub\u7684mergeOptions\u5408\u5E76\u4E2D\uFF0C\u5C06 Vue.options \u4F5C\u4E3A parentVal \uFF0C\u4EE5\u6B64\u4E3A\u539F\u578B\u521B\u5EFA\u4E00\u4E2A\u65B0\u5BF9\u8C61\uFF0C\u7136\u540E\u518D\u5C06 extendOptions \u7684 assets(\u7EC4\u4EF6\u3001\u6307\u4EE4\u7B49)\u5408\u5E76\u5230\u65B0\u5BF9\u8C61\u4E2D\uFF0C\u8FD4\u56DE\u4F5C\u4E3A\u5B50\u6784\u9020\u51FD\u6570\u7684options\uFF0C\u8FD9\u6837\u5728\u7EC4\u4EF6\u6784\u9020\u51FD\u6570\u7684\u521D\u59CB\u5316\u8FC7\u7A0B\u4E2D\u5C31\u80FD\u901A\u8FC7\u539F\u578B\u94FE\u8FDB\u884C\u8BBF\u95EE</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;">// \u5C40\u90E8\u6CE8\u518C\u7684\u7EC4\u4EF6\uFF0C\u4E5F\u662F\u4F1A\u901A\u8FC7 _createElement \u65B9\u6CD5\u6765\u521B\u5EFA \u7EC4\u4EF6vnode \uFF0C\u5177\u4F53\u5206\u6790\u89C1\u4E0A\u9762</span></span>
<span class="line"></span></code></pre></div>`,13),e=[o];function t(c,r,y,F,D,A){return a(),n("div",null,e)}const d=s(l,[["render",t]]);export{i as __pageData,d as default};
