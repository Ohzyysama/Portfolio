---
title: 现代图论第3讲
date: 2026-3-18
summary: 最小生成树、最短路径、Hamilton Cycle
tags:
    - Graph Theory
    - Mathematics
---
**最小生成树**<br>
J-P Algotithm<br>
1. Take any vertex, say v1, as root, and set T1 = v1<br>
2. For k ≥ 1, choose an edge xy with x ∈ Tk and y ∈ V(G) \ Tk s.t. w(xy) is minimum among all edges.Set Tk+1 = Tk ∪ {xy}.<br>
Every J-P Tree is an optimal tree.<br>
**最短路径**<br>
在赋权图中，d(u,v)是u和v之间路径的最小权重<br>
For S ⊆ V(G), d(S,v) = min{d(u,v): u ∈ S}<br>
Dijkstra's Algorithm: d(u0, Sk') = min{d(u0, u)+w(u,v): u ∈ Sk, v ∈ V(G) \ Sk}<br>
**HAMILTON CYCLE**<br>
A path or cycle which contains every vertex of the graph is called a Hamilton pth or Hamilton cycle.<br>
Hamilton Cycle 相关充分/必要条件：<br>
1. (必要)For any S ⊆ V(G), w(G-S)≤|S|<br>
petersen graph: 没有Hamilton Cycle<br>
2. (充分)Let G be a simple graph of order n ≥ 3. If δ(G) ≥ n/2, then G is Hamiltonian.<br>
其他：二部图两边点数一样多才有可能有Hamilton Cycle