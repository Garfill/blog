import{_ as s,c as n,o as a,a as l}from"./app.d474d6c4.js";const C=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"React/03-commit/3.1.commit\u6D41\u7A0B.md"}'),p={name:"React/03-commit/3.1.commit\u6D41\u7A0B.md"},o=l(`<blockquote><p>\u5728\u6267\u884C <code>FiberNode</code> \u7684 <code>completeWork</code> \u4E4B\u540E\uFF0C\u8FDB\u5165 <code>commit</code> \u9636\u6BB5\uFF0C\u5F00\u59CB\u6E32\u67D3</p></blockquote><div class="language-js"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code><span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">performSyncWorkOnRoot</span><span style="color:#89DDFF;">()</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">//...</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">current</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">alternate</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">finishedLanes</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">lanes</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#82AAFF;">commitRoot</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">root</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#82AAFF;">ensureRootIsScheduled</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">now</span><span style="color:#F07178;">())</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">commitRoot</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">renderPriorityLevel</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">getCurrentPriorityLevel</span><span style="color:#F07178;">()</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// \u8C03\u5EA6\u4F18\u5148\u7EA7</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#82AAFF;">runWithPriority</span><span style="color:#F07178;">(</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">ImmediateSchedulerPriority</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">commitRootImpl</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">bind</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">null,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">renderPriorityLevel</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#F07178;">  )</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u6700\u7EC8\u8C03\u7528 commitRootImpl</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">commitRootImpl</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">renderPriorityLevel</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">do</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// \u6267\u884C\u5728\u672C\u6B21 commit \u4E4B\u524D\u6CA1\u6709\u6267\u884C\u7684 useEffect\u56DE\u8C03\u548C\u5176\u4ED6\u540C\u6B65\u4EFB\u52A1</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// \u7531\u4E8E\u8FD9\u4E9B\u4EFB\u52A1\u56DE\u8C03\u53EF\u80FD\u89E6\u53D1\u65B0\u7684\u6E32\u67D3\uFF0C\u56E0\u6B64\u4F7F\u7528\u5FAA\u73AF</span></span>
<span class="line"><span style="color:#F07178;">		</span><span style="color:#82AAFF;">flushPassiveEffects</span><span style="color:#F07178;">()</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">while</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">rootWithPendingPassiveEffects</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!==</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u51E1\u662F\u53D8\u91CF\u540D\u5E26lane\u7684\u90FD\u662F\u4F18\u5148\u7EA7\u76F8\u5173</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">const</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">lanes</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">finishedLanes</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">===</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">finishedLanes</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">NoLanes</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u91CD\u7F6EScheduler\u7ED1\u5B9A\u7684\u56DE\u8C03\u51FD\u6570</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">callbackNode</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">callbackId</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">NoLanes</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;">  </span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u6E05\u9664\u5DF2\u5B8C\u6210\u7684discrete updates\uFF0C\u4F8B\u5982\uFF1A\u7528\u6237\u9F20\u6807\u70B9\u51FB\u89E6\u53D1\u7684\u66F4\u65B0\u3002</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">rootsWithPendingDiscreteUpdates</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!==</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#89DDFF;">!</span><span style="color:#82AAFF;">hasDiscreteLanes</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">remainingLanes</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">&amp;&amp;</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#A6ACCD;">rootsWithPendingDiscreteUpdates</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">has</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">root</span><span style="color:#F07178;">)</span></span>
<span class="line"><span style="color:#F07178;">    ) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">      </span><span style="color:#A6ACCD;">rootsWithPendingDiscreteUpdates</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">delete</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">root</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u91CD\u7F6E\u5168\u5C40\u53D8\u91CF</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">root</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">===</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">workInProgressRoot</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">workInProgressRoot</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null;</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">workInProgress</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null;</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">workInProgressRootRenderLanes</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">NoLanes</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u5C06effectList\u8D4B\u503C\u7ED9firstEffect</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u7531\u4E8E\u6BCF\u4E2Afiber\u7684effectList\u53EA\u5305\u542B\u4ED6\u7684\u5B50\u5B59\u8282\u70B9</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u6240\u4EE5\u6839\u8282\u70B9\u5982\u679C\u6709flags\u5219\u4E0D\u4F1A\u88AB\u5305\u542B\u8FDB\u6765</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u6240\u4EE5\u8FD9\u91CC\u5C06\u6709flags\u7684\u6839\u8282\u70B9\u63D2\u5165\u5230effectList\u5C3E\u90E8</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;">// \u8FD9\u6837\u624D\u80FD\u4FDD\u8BC1\u6709effect\u7684fiber\u90FD\u5728effectList\u4E2D</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">firstEffect</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">flags</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&gt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">PerformedWork</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">		</span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">lastEffect</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!==</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">			</span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">lastEffect</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">nextEffect</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">			</span><span style="color:#A6ACCD;">firstEffect</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">firstEffect</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">		</span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">			</span><span style="color:#A6ACCD;">firstEffect</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">		</span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">		</span><span style="color:#676E95;">// \u6839\u8282\u70B9\u6CA1\u6709flags</span></span>
<span class="line"><span style="color:#F07178;">		</span><span style="color:#A6ACCD;">firstEffect</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">finishedWork</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">firstEffect</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">//... before mutation\u9636\u6BB5\uFF08\u6267\u884C\`DOM\`\u64CD\u4F5C\u524D\uFF09</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#A6ACCD;">nextEffect</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">firstEffect</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">do</span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">		</span><span style="color:#82AAFF;">commitBeforeMutationEffects</span><span style="color:#F07178;">()</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">while</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">nextEffect</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!==</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// mutation\u9636\u6BB5\uFF08\u6267\u884C\`DOM\`\u64CD\u4F5C\uFF09</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#A6ACCD;">nextEffect</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">firstEffect</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">do</span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">		</span><span style="color:#82AAFF;">commitMutationEffects</span><span style="color:#F07178;">()</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">while</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">nextEffect</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!==</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// layout\u9636\u6BB5\uFF08\u6267\u884C\`DOM\`\u64CD\u4F5C\u540E\uFF09</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#A6ACCD;">nextEffect</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">firstEffect</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">do</span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">		</span><span style="color:#82AAFF;">commitLayoutEffects</span><span style="color:#F07178;">()</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">while</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">nextEffect</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">!==</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// ... \u6700\u540E\u8C03\u5EA6root\uFF0C\u7531\u4E8Ecommit\u9636\u6BB5\u53EF\u80FD\u4EA7\u751F\u65B0\u7684\u66F4\u65B0</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#82AAFF;">ensureRootIsScheduled</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">,</span><span style="color:#F07178;"> </span><span style="color:#82AAFF;">now</span><span style="color:#F07178;">())</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F07178;">	</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// \u6267\u884C\u540C\u6B65\u4EFB\u52A1\uFF0C\u8FD9\u6837\u540C\u6B65\u4EFB\u52A1\u4E0D\u9700\u8981\u7B49\u5230\u4E0B\u6B21\u4E8B\u4EF6\u5FAA\u73AF\u518D\u6267\u884C</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// \u6BD4\u5982\u5728 componentDidMount \u4E2D\u6267\u884C setState \u521B\u5EFA\u7684\u66F4\u65B0\u4F1A\u5728\u8FD9\u91CC\u88AB\u540C\u6B65\u6267\u884C</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;">// \u6216useLayoutEffect</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#82AAFF;">flushSyncCallbackQueue</span><span style="color:#F07178;">()</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">	</span><span style="color:#89DDFF;">return</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">null</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div>`,2),e=[o];function t(c,r,F,y,D,i){return a(),n("div",null,e)}const f=s(p,[["render",t]]);export{C as __pageData,f as default};
