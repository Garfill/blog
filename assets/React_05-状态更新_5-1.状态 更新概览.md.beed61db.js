import{_ as s,c as n,o as a,a as l}from"./app.d474d6c4.js";const C=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"React/05-\u72B6\u6001\u66F4\u65B0/5-1.\u72B6\u6001 \u66F4\u65B0\u6982\u89C8.md"}'),o={name:"React/05-\u72B6\u6001\u66F4\u65B0/5-1.\u72B6\u6001 \u66F4\u65B0\u6982\u89C8.md"},p=l(`<blockquote><p>\u5BF9\u6BD4 Vue \u901A\u8FC7 defineProperty \u6216\u8005 Proxy \uFF0C\u5F53\u6570\u636E\u6539\u53D8\u7684\u65F6\u5019\u8C03\u7528\u66F4\u65B0</p></blockquote><p>React \u901A\u8FC7\u521B\u5EFA <strong>Update \u5BF9\u8C61\uFF08dispatchAction\uFF09</strong> \uFF0C\u5728 <strong>render \u9636\u6BB5(performSyncWorkOnRoot)</strong>\uFF0C\u8BB0\u5F55 \u66F4\u65B0\u5185\u5BB9\uFF0C\u6700\u7EC8\u901A\u8FC7 commit \u9636\u6BB5(commitRoot) \u8FDB\u884C\u66F4\u65B0</p><p>\u4EE5 <code>useState</code> \u4E3A\u4F8B\u5B50\uFF0C\u5728 \u89E6\u53D1\u66F4\u65B0 <code>setState</code> \uFF0C\u4F1A\u8C03\u7528 \`dispatchAction</p><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">dispatchAction</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">fiber</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">queue</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">action</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// fiber \u5F53\u524D function fiber\u8282\u70B9</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// action \u4F20\u5165\u7684\u65B0\u72B6\u6001state</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// \u521B\u5EFA\u7684 update \u5BF9\u8C61</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#C792EA;">var</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">lane</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">requestUpdateLane</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">fiber</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#C792EA;">var</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">update</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    lane</span><span style="color:#89DDFF;">:</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">lane</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">    action</span><span style="color:#89DDFF;">:</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">action</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">    hasEagerState</span><span style="color:#89DDFF;">:</span><span style="color:#F07178;"> </span><span style="color:#FF9CAC;">false</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">    eagerState</span><span style="color:#89DDFF;">:</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null,</span></span>
<span class="line"><span style="color:#F07178;">    next</span><span style="color:#89DDFF;">:</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">};</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">//...</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">eventTime</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">requestEventTime</span><span style="color:#F07178;">()</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">root</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">scheduleUpdateOnFiber</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">fiber</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">lane</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">eventTime</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">scheduleUpdateOnFiber</span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// \u901A\u8FC7 fiber \u5411\u4E0A\u9012\u5F52 \u627E\u5230\u5F53\u524D\u5E94\u7528\u7684 FiberRootNode</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">root</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">markUpdateLaneFromFiberToRoot</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">fiber</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">lane</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">//...</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#82AAFF;">ensureRootIsScheduled</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">eventTime</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">ensureRootIsScheduled</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">eventTime</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// \u6838\u5FC3\u4EE3\u7801</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">newCallbackNode</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">newCallbackPriority</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">===</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">SyncLanePriority</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">		</span><span style="color:#676E95;">// \u4EFB\u52A1\u5DF2\u7ECF\u8FC7\u671F\uFF0C\u9700\u8981\u540C\u6B65\u6267\u884Crender\u9636\u6BB5</span></span>
<span class="line"><span style="color:#F07178;">		</span><span style="color:#A6ACCD;">newCallbackNode</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">scheduleSyncCallback</span><span style="color:#F07178;">(</span></span>
<span class="line"><span style="color:#F07178;">			</span><span style="color:#A6ACCD;">performSyncWorkOnRoot</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">bind</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">null,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">root</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">		)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">		</span><span style="color:#676E95;">// \u6839\u636E\u4EFB\u52A1\u4F18\u5148\u7EA7\u5F02\u6B65\u6267\u884Crender\u9636\u6BB5</span></span>
<span class="line"><span style="color:#F07178;">		</span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">schedulerPriorityLevel</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">lanePriorityToSchedulerPriority</span><span style="color:#F07178;">(</span></span>
<span class="line"><span style="color:#F07178;">			</span><span style="color:#A6ACCD;">newCallbackPriority</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">		)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">		</span><span style="color:#A6ACCD;">newCallbackNode</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">scheduleCallback</span><span style="color:#F07178;">(</span></span>
<span class="line"><span style="color:#F07178;">			</span><span style="color:#A6ACCD;">schedulerPriorityLevel</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">			</span><span style="color:#A6ACCD;">performConcurrentWorkOnRoot</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">bind</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">null,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">root</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">		)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><p>\u5176\u4E2D\uFF0C<code>scheduleCallback</code>\u548C<code>scheduleSyncCallback</code>\u4F1A\u8C03\u7528 <code>Scheduler</code> \u63D0\u4F9B\u7684\u8C03\u5EA6\u65B9\u6CD5\u6839\u636E<code>\u4F18\u5148\u7EA7</code>\u8C03\u5EA6\u56DE\u8C03\u51FD\u6570\u6267\u884C\u3002 \u56DE\u8C03\u51FD\u6570\u4E5F\u5C31\u662F <code>performSyncWorkOnRoot</code> \u548C <code>performConcurrentWorkOnRoot</code></p>`,5),e=[p];function t(c,r,F,y,D,A){return a(),n("div",null,e)}const d=s(o,[["render",t]]);export{C as __pageData,d as default};
