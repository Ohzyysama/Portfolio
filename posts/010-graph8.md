---
title: 现代图论第8讲
date: 2026-4-23
summary: Edge Colorings of Graphs
tags:
    - Graph Theory
    - Mathematics
---
A k-edge-coloring of G is a mapping c: E(G) → {1, 2, ..., k}.<br>
一个边染色是合法的当任意两条相邻的边不染同一个颜色<br>
最小的k值称为G的边色数，记为X'(G)<br>
**Proposition 8** Let G be a connected graph with Δ(G) = Δ. Then X'(G) ≥ Δ.<br>
Petersen Graph X'(G) ＞ 3. 证明：任意一个外圈的颜色在内圈种至少出现两次，而内圈只有5条边。<br>
边染色本质上是划分成边独立集。<br>
**Edge Colorings of Bipartite Graphs**<br>
If G is a bipartite graph with Δ(G) = Δ, then X'(G) = Δ.<br>
**(Vizing)** For any simple graph G with Δ(G) = Δ, X'(G) ≤ Δ + 1.