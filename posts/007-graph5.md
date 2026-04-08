---
title: 现代图论第5讲
date: 2026-4-8
summary: Vertex Coloring of Graphs
tags:
    - Graph Theory
    - Mathematics
---
**色数**<br>
c: V(G)->{1, 2, ..., k}<br>
c is proper if no two adjacent vertices are assigned the same color.<br>
A graph G is k-colorable if G has a  proper k-coloring.<br>
最小的k称为G的色数，表示为X(G)<br>
染色等价于划分顶点独立集(independent set)<br>

**The Greedy Heuristic Algorithm**<br>
1. Arrange the vertices of G in a linear order.<br>
2. Color the vertices one by one in this order, assigning to vi the smallest positive integer not yet assigned to one of its already-colored neighbours.<br>
X(G) ≤ Δ(G) + 1，其中Δ(G)为G中的最大度数<br>
当且仅当G为奇圈或完全图时取等<br>
**Theorem(Brooks)**<br>
Let G be a connected graph with Δ(G) = Δ. If G is neither an odd cycle nor a complete graph, then X(G) ≤ Δ.<br>
**Theorem**<br>
A graph G with at least three vertices is 2-connected if and only if any two vertices are connected by at least two internally disjoint paths.<br>
**推论**
G is 2-connected if and only if any two vertices of G lie on a common cycle.<br>
block: 没有割点的连通图<br>
A block of a graph is a subgraph that is a block and is maximal with respect to this property.<br>
block-cut graph: 将块和割点当作新节点，记为B(G)<br>
Let G be a connected graph. Then B(G) is a tree.