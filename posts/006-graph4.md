---
title: 现代图论第4讲
date: 2026-3-26
summary: Hamilton Cycle
tags:
    - Graph Theory
    - Mathematics
---
**(Ore)** Let G be a simple graph of order n ≥ 3. If σ2(G) ≥ n, then G is Hamiltonian.<br>
Explanation: σ2(G) = min(d(u) + d(v) : uv ∉ E(G))<br>
证明方法和Dirac类似，下面简述思路:<br>
1. 找一条最长路径v1~vl<br>
2. if v1vl ∈ E(G), then v1~vl is a Hamiltonian Cycle<br>
3. if v1vl ∉ E(G), 证明方法和Dirac一致(讨论Np+(vl)和Np(v1)是否有公共顶点)<br>
**推论** δ(G) ≥ n/2 和 σ2(G) ≥ n 都能推出图至少是2连通的<br>
**Lemma1:** Let G be a simple graph of order n , and let u and v be nonadjacent vertices in G such that d(u) + d(v) ≥ n.Then G is Hamiltonian if and only if G + uv is Hamiltonian.<br>
**用法**不停地向图中添加边，直到不能添加为止<br>
cl(G) : 在一个图中递归地将两个不相邻且度数之和至少为n的点连起来得到的图<br>
**Lemma2:** The closure of a graph is well-defined.<br>
**Theoreme:** A simple graph G is Hamiltonian if and only if its closure cl(G) is Hamiltonian.<br>
**Lemma3:** Let G be a simple graph of order n , and let u and v be nonadjacent vertices in G such that d(u) + d(v) ≥ n - 1.Then G has a Hamilton Path if and only if G + uv has a Hamilton Path.<br>
**范条件：**<br>
G is a 2-connected graph of order n. If max{d(u), d(v)} ≥ n/2 for any u, v with d(u,v) = 2, then G is Hamiltonian.<br>
proof: 将E(G)分为U和若干连通分支<br>
**Theoreme:**<br>
Let G be a simple graph of order n ≥ 3. If α(G) ≤ κ(G), then G is Hamiltonian.<br>
α(G) = max{|S|:S is an independent set of G}<br>
κ(G) : 连通度<br>
proof: H是E(G)的一个连通分支，x1, x2, ..., xk是H的所有邻点<br>
则x1~xk是一个cut set => κ(G) 小于等于k<br>
同时{x1+, ... , xk+, h} 是一个独立集 => α(G) 大于等于k<br>
所以α(G) ≥ κ(G)