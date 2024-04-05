import{_ as s,c as n,o as a,a as l}from"./app.b98cfa30.js";const i=JSON.parse('{"title":"\u6D3E\u53D1\u66F4\u65B0","description":"","frontmatter":{},"headers":[{"level":2,"title":"notify","slug":"notify","link":"#notify","children":[]},{"level":2,"title":"update","slug":"update","link":"#update","children":[]},{"level":2,"title":"queueWatcher","slug":"queuewatcher","link":"#queuewatcher","children":[]},{"level":2,"title":"flushSchedulerQueue","slug":"flushschedulerqueue","link":"#flushschedulerqueue","children":[]},{"level":2,"title":"Watcher\u91CC\u7684run","slug":"watcher\u91CC\u7684run","link":"#watcher\u91CC\u7684run","children":[]}],"relativePath":"vue2/3_defineReactive/3.3.setter 1.md"}'),p={name:"vue2/3_defineReactive/3.3.setter 1.md"},o=l(`<h1 id="\u6D3E\u53D1\u66F4\u65B0" tabindex="-1">\u6D3E\u53D1\u66F4\u65B0 <a class="header-anchor" href="#\u6D3E\u53D1\u66F4\u65B0" aria-hidden="true">#</a></h1><blockquote><p>\u4E0A\u4E00\u6587\u4E2D\u53EF\u4EE5\u77E5\u9053\uFF0C\u5728\u6E32\u67D3\u51FD\u6570\u6267\u884C\u7684\u8FC7\u7A0B\u4E2D\uFF0C\u4F1A\u8BBF\u95EE\u5230data\u6570\u636E\uFF0C\u4ECE\u800C\u89E6\u53D1getter\uFF0C\u8FDB\u884C\u4F9D\u8D56\u6536\u96C6\uFF0C\u5728Dep\u5B9E\u4F8B\u7684\u8BA2\u9605\u8005\u5217\u8868\u4E2D\u6DFB\u52A0\u6E32\u67D3Watcher\uFF0C\u5728\u6E32\u67D3Watcher\u7684\u4F9D\u8D56\u6C60\u4E2D\u4F1A\u6DFB\u52A0Dep\u5B9E\u4F8B</p></blockquote><p>\u90A3\u4E48\uFF0C\u5F53\u8981\u4FEE\u6539data\u4E2D\u7684\u67D0\u4E2A\u503C\u7684\u65F6\u5019\uFF0C\u5C31\u4F1A\u89E6\u53D1\u5BF9\u5E94\u7684setter</p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// observer/index.js</span></span>
<span class="line"><span style="color:#FFCB6B;">set</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">reactiveSetter</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">newVal</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">getter</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">?</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">getter</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">call</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">obj</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">:</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">val</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">newVal</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">===</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">||</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">newVal</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!==</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">newVal</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&amp;&amp;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!==</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// \u524D\u540E\u503C\u76F8\u540C\uFF0C\u4E2D\u65AD</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">return</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">process</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">env</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">NODE_ENV</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!==</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">production</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&amp;&amp;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">customSetter</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// \u8FD9\u91CC\u5C31\u662F\u6211\u4EEC\u5E73\u65F6\u53EF\u80FD\u4FEE\u6539props\u65F6\u770B\u5230\u7684 Avoid mutating props...</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// \u5728\u5F00\u53D1\u73AF\u5883\u4E0B\u4F1A\uFF0C\u8FDB\u884Cprops\u54CD\u5E94\u5F0F\u8BBE\u7ACB\u65F6\u4F1A\u4F20\u5165\u5BF9\u5E94\u7684customSetter</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#82AAFF;">customSetter</span><span style="color:#F07178;">()</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">getter</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&amp;&amp;</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">setter</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">return</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// \u8FD9\u4E00\u884C\u662F\u5BF9\u4E8E\u4E00\u4E9B\u6CA1\u6709setter\u7684\u5C5E\u6027\uFF1Acomputed</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">setter</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">setter</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">call</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">obj</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">newVal</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">val</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">newVal</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">childOb</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">shallow</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&amp;&amp;</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">observer</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">newVal</span><span style="color:#F07178;">) </span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u5982\u679C\u91CD\u65B0\u8D4B\u503C\u7684\u4E5F\u662F\u4E2A\u5BF9\u8C61\u7C7B\u578B\uFF0C\u5C31\u5C06\u4ED6\u4E5F\u53D8\u4E3A\u54CD\u5E94\u5F0F\u6570\u636E</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">dep</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">notify</span><span style="color:#F07178;">() </span><span style="color:#676E95;">// \u8FD9\u5C31\u662F\u901A\u8FC7\u8FD9\u4E2A\u503C\u5BF9\u5E94\u7684Dep\u5B9E\u4F8B\u6765\u6D3E\u53D1\u66F4\u65B0</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="notify" tabindex="-1">notify <a class="header-anchor" href="#notify" aria-hidden="true">#</a></h2><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// observer/dep.js</span></span>
<span class="line"><span style="color:#82AAFF;">notify</span><span style="color:#A6ACCD;"> () </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">subs</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">subs</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">slice</span><span style="color:#F07178;">() </span><span style="color:#676E95;">// \u8BA2\u9605\u8005watcher\u5217\u8868</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">subs</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">sort</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">a</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">b</span><span style="color:#89DDFF;">)</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">a</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">-</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">b</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">) </span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u5BF9watcher\u6392\u5E8F</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">for</span><span style="color:#F07178;"> (</span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">l</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">subs</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">length</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&lt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">l</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">i</span><span style="color:#89DDFF;">++</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">subs</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;">]</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">update</span><span style="color:#F07178;">()</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// \u8C03\u7528watcher\u7684update\u65B9\u6CD5</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="update" tabindex="-1">update <a class="header-anchor" href="#update" aria-hidden="true">#</a></h2><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// observer/watcher.js</span></span>
<span class="line"><span style="color:#82AAFF;">update</span><span style="color:#A6ACCD;"> () </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">lazy</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">dirty</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#FF9CAC;">true</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// \u5EF6\u8FDF\u8BA1\u7B97\u7684\u5C5E\u6027</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">sync</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">this.</span><span style="color:#82AAFF;">run</span><span style="color:#F07178;">() </span><span style="color:#676E95;">// sync\u4FEE\u9970\u7B26</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#82AAFF;">queueWatcher</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">this</span><span style="color:#F07178;">) </span><span style="color:#676E95;">// \u5C06\u8BA2\u9605\u8FD9\u4E2A\u503C\u53D8\u5316\u7684watcher\u63A8\u5165\u66F4\u65B0\u961F\u5217</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="queuewatcher" tabindex="-1">queueWatcher <a class="header-anchor" href="#queuewatcher" aria-hidden="true">#</a></h2><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// ovserver/scheduler.js</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">queueWatcher</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">watcher</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">watcher</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">id</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">has</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">==</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">has</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#FF9CAC;">true</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">flusing</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// \u66F4\u65B0\u5F00\u59CB\u7684\u6807\u8BC6\u4F4D</span></span>
<span class="line"><span style="color:#89DDFF;">      </span><span style="color:#676E95;">// \u8FD8\u6CA1\u5F00\u59CB\u66F4\u65B0</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#A6ACCD;">queue</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">push</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">watcher</span><span style="color:#F07178;">) </span><span style="color:#676E95;">// \u961F\u5217\u63A8\u5165</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">      </span><span style="color:#676E95;">// \u66F4\u65B0\u5DF2\u7ECF\u5F00\u59CB</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">queue</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">length</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">-</span><span style="color:#F07178;"> </span><span style="color:#F78C6C;">1</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// \u5F53\u524D\u961F\u5217\u6700\u540E\u4E00\u4E2A\uFF0C\u6392\u5E8F\u4E4B\u540Eid\u6700\u5927\u7684\u4E00\u4E2A</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">while</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&gt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">index</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&amp;&amp;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">queue</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;">]</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&gt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">watcher</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">        </span><span style="color:#A6ACCD;">i</span><span style="color:#89DDFF;">--</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#A6ACCD;">queue</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">splice</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">+</span><span style="color:#F07178;"> </span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">watcher</span><span style="color:#F07178;">) </span><span style="color:#676E95;">// \u627E\u5230\u521A\u597D\u653E\u4E0B\u8FD9\u4E2Aid\u7684watcher\u7684\u4F4D\u7F6E\uFF0C\u63D2\u5165</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#89DDFF;">!</span><span style="color:#A6ACCD;">waiting</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// \u4E00\u5F00\u59CB\u662F\u8BBE\u7F6E\u4E3Afalse</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#A6ACCD;">waiting</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#FF9CAC;">true</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#82AAFF;">nextTick</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">flushSchedulerQueue</span><span style="color:#F07178;">) </span><span style="color:#676E95;">// \u4E0B\u4E00\u5E27\u5F00\u59CBflush\u66F4\u65B0\uFF0C\u8FD9\u662F\u4E2A\u5F02\u6B65\u7684\u8FC7\u7A0B</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="flushschedulerqueue" tabindex="-1">flushSchedulerQueue <a class="header-anchor" href="#flushschedulerqueue" aria-hidden="true">#</a></h2><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// observer/scheduler.js</span></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">flushSchedulerQueue</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">currentFlushTimestamp</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">getNow</span><span style="color:#F07178;">()</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">flushing</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#FF9CAC;">true</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// \u5F00\u59CB\u66F4\u65B0\u7684\u6807\u8BC6</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">watcher</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">id</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">queue</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">sort</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">a</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">b</span><span style="color:#89DDFF;">)</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">a</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">-</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">b</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">) </span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u5C06\u961F\u5217\u4E2D\u7684watcher\u6392\u5E8F\uFF0C\u7236\u7EC4\u4EF6\u521B\u5EFA\u5728\u5148\uFF0C\u6392\u5E8F\u540E\u4E5F\u5728\u524D\u9762</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u7EC4\u4EF6\u5185\u7684watch\u9009\u9879\u6216\u8005$watch\uFF0C\u4ED6\u4EEC\u521B\u5EFA\u7684 user-watcher \u4E5F\u5728 \u6E32\u67D3watcher \u4E4B\u524D</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u82E5\u662F\u7236\u7EC4\u4EF6\u8FD0\u884C\u8FC7\u7A0B\u4E2D\u88AB\u9500\u6BC1\uFF0C\u5C31\u4F1A\u5FFD\u7565\u5B50\u7EC4\u4EF6\u7684watcher\u66F4\u65B0</span></span>
<span class="line"><span style="color:#F07178;">  </span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">for</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">index</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">index</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&lt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">queue</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">length</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">index</span><span style="color:#89DDFF;">++</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">   	</span><span style="color:#A6ACCD;">watcher</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">queue</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">index</span><span style="color:#F07178;">]</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">watcher</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">before</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#A6ACCD;">watcher</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">before</span><span style="color:#F07178;">()</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">watcher</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">id</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">has</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// \u6267\u884C\u4E4B\u540E\u5254\u9664</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">watcher</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">run</span><span style="color:#F07178;">() </span><span style="color:#676E95;">// \u8FD9\u91CC\u5C31\u662F\u6BCF\u4E2Awatcher \u7684\u66F4\u65B0</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">process</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">env</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">NODE_ENV</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!==</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">production</span><span style="color:#89DDFF;">&#39;</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&amp;&amp;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">has</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">!=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">      </span><span style="color:#676E95;">// \u8FD9\u91CC\u662F\u7531\u4E8E\u53EF\u80FD\u5728watcher\u7684run\u65B9\u6CD5\u4E2D\uFF0C\u91CD\u65B0\u53C8\u4FEE\u6539\u4E86\u67D0\u4E2A\u4E4B\u524D\u672C\u5DF2\u7ECF\u88AB\u5254\u9664\u51FA\u53BB\u7684\u503C</span></span>
<span class="line"><span style="color:#89DDFF;">      </span><span style="color:#676E95;">// \u5BFC\u81F4\u8FD9\u4E2A\u503C\u5BF9\u5E94\u7684watcher\u53C8\u89E6\u53D1\u4E86</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#A6ACCD;">circular</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">circular</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">||</span><span style="color:#F07178;"> </span><span style="color:#F78C6C;">0</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">+</span><span style="color:#F07178;"> </span><span style="color:#F78C6C;">1</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">circular</span><span style="color:#F07178;">[</span><span style="color:#A6ACCD;">id</span><span style="color:#F07178;">] </span><span style="color:#89DDFF;">&gt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">MAX_UPDATE_COUNT</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">        </span><span style="color:#676E95;">// \u66F4\u65B0\u6808\u8FC7\u5927\uFF0C\u53EF\u80FD\u662F\u5FAA\u73AF\u66F4\u65B0</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">active</span><span style="color:#F07178;">  const activatedQueue </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">activatedChildren</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">slice</span><span style="color:#F07178;">()</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">updatedQueue</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">queue</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">slice</span><span style="color:#F07178;">()</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#82AAFF;">resetSchedulerState</span><span style="color:#F07178;">() </span><span style="color:#676E95;">// \u91CD\u7F6E\u4E00\u4E9B\u72B6\u6001</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#82AAFF;">callActivatedHooks</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">activatedQueue</span><span style="color:#F07178;">) </span><span style="color:#676E95;">// keep-alive\u76F8\u5173</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#82AAFF;">callUpdatedHooks</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">updatedQueue</span><span style="color:#F07178;">) </span><span style="color:#676E95;">// updated\u94A9\u5B50 \u4EC5\u5BF9\u6E32\u67D3watcher</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="watcher\u91CC\u7684run" tabindex="-1">Watcher\u91CC\u7684run <a class="header-anchor" href="#watcher\u91CC\u7684run" aria-hidden="true">#</a></h2><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#676E95;">// observer/watcher.js</span></span>
<span class="line"><span style="color:#82AAFF;">run</span><span style="color:#A6ACCD;"> () </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">active</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// \u521B\u5EFA\u7684\u65F6\u5019\u8BBE\u4E3Atrue</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">this.</span><span style="color:#82AAFF;">get</span><span style="color:#F07178;">()</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;">// \u6E32\u67D3watcher\u6765\u8BF4\uFF0Cthis.cb\u4E3Anoop\uFF0C\u8C03\u7528this.get() \u5C31\u662F\u8C03\u7528 updateComponent\uFF0C\u91CD\u65B0patch</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!==</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">||</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">isObject</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">||</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">deep</span><span style="color:#F07178;">)  </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">      </span><span style="color:#676E95;">// \u524D\u540E\u503C\u4E0D\u4E00\u6837\u3001\u5BF9\u8C61\u7C7B\u578B\u6570\u636E\u3001\u6DF1\u5EA6\u904D\u5386watcher</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">oldValue</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">value</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">cb</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">call</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">this.</span><span style="color:#A6ACCD;">vm</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">oldValue</span><span style="color:#F07178;">) </span><span style="color:#676E95;">// watchx</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div>`,14),e=[o];function c(t,r,F,y,D,A){return a(),n("div",null,e)}const u=s(p,[["render",c]]);export{i as __pageData,u as default};
