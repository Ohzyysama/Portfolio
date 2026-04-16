---
title: 现代图论第7讲
date: 2026-4-16
summary: Matcheings in Graphs
tags:
    - Graph Theory
    - Mathematics
---
**Matching**<br>
A matching in a graph is a set of pairwise nonadjacent edges.<br>
完全匹配：覆盖图中每个点<br>
最大匹配：覆盖尽可能多的点<br>
极大匹配：不能扩展至更大匹配(把匹配中点去掉应为独立集)<br>
最大匹配中的边数为G的匹配数，记为α'(G)<br>
交错路：An M-alternating path or cycle of G is a path or cycle whose edges are alternately in M and E(G)\M.<br>
增广路(Augmenting Path)：一个交错路如果其起点和终点都没有被M覆盖，则称为M-增广路。<br>
**(Berge)** A matching M is a maximum matching if and only if G contains no M-augmenting path.<br>
否则存在 M' = M Δ E(P) > M<br>
**(Hall)** A bipartite graph G = G[X, Y] has a matching which covers every vertex in X if and only if |N(S)| ≥ |S| for all S ⊆ X.<br>
**推论1** G has a perfect match if and only if |X| = |Y| && |N(S)| ≥ |S| for all S ⊆ X.<br>
**推论2** Every nonempty regular bipartite graph has a perfect match.<br>
**覆盖**<br>
A covering of a graph G is a subset K of V(G) such that every edge of G has at least one end in K.<br>
**(Hall)** For any bipartite graph G = G[X, Y], α'(G) = β(G), β(G)是最小覆盖点数<br>
**一般图中的完美匹配**<br>
**(Tutte)** A graph G has a perfect match if and only if o(G - S) ≤ |S| for all S ⊆ V(G).<br>
o(G-S)：G-S中奇数连通分支的数量<br>
**(Petersen)** Every 3-regular graph without cut edges has a perfect match.