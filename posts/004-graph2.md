---
title: 现代图论第2讲
date: 2026-3-12
summary: 图的连通性
tags:
    - Graph Theory
    - Mathematics
---
**定理**：图是连通的 ⇔ 图有一棵生成树
if v∈V(G) 且G\v是不连通的，则称v为G的割点<br>
if e∈E(G) 且G\e是不连通的，则称e为G的割边<br>
κ(G) = min{|S|: S is a cut set of G}<br>
X ⊆ V(G) , Y = V(G)\X , E(X, Y) = {uv: uv ∈ E(G) and u ∈ X and v ∈ Y}, write as ∂(X)<br>
在生成树T中，从根r到节点v的路径称为rTv，长度为l(v)，p(v)是v在rTv上的前继节点<br>
**如何确定G是否连通**<br>
1.找G中一棵树T<br>
2.1 若T是生成树，则G是连通的<br>
2.2 若T不是生成树，则看∂(T)<br>
2.2.1 若∂(T)为空，则G是不连通的<br>
2.2.2 若∂(T)不为空，则树长大<br>
**找生成树的方法**<br>
1.Breadth-First Search 广度优先搜索<br>
2.Depth-First Search 深度优先搜索<br>
Cayley's Formula: The number of labelled trees on n vertices is n^n-2<br>
**How to Count Spanning Trees**<br>
Let G be a graph and e an edge of G.<br>
Then t(G) = t(G\e) + t(G/e)