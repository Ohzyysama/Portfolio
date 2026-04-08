---
title: 现代图论第6讲
date: 2026-4-8
summary: Vertex Coloring of Graphs
tags:
    - Graph Theory
    - Mathematics
---
Let G be a connected graph of order n. Then X(G) ≥ n/α(G).<br>
**色临界**<br>
A graph G is called color-critical if X(H) < X(G) for every proper subgraph H of G.<br>
proposition: A connected graph G is 3-critical if and only if G is odd cycle.<br>
证明：X(G) = 3 => G不是二部图 => G包含奇圈 => G是奇圈<br>
If G is k-critical, then:
1. δ(G) ≥ k-1<br>
2. G has no clique cut<br>
3. G has no cut vertices<br>

**List Coloring of Graphs**<br>
Let G be a graph and let L be a function which assigns to each vertex v of G a set L(v) of positive integers, called the list of v.<br>
A coloring c: V -> N such that c(v) ∈ L(v) is called a list coloring of G with respect to L.<br>
A graph G is said to be k-list-colorable if it is L-colorable when ever all the lists have length k.<br>
The smallest value of k for which G is k-list-colorable is called the list chromatic number of G, denoted by XL(G).<br>
k色图划分成k个独立集， 则每个独立集中至少有一个点在别的独立集中有邻点。<br>
X(G) ≤ XL(G) ≤ Δ(G) + 1