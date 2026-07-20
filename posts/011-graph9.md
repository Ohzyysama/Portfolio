---
title: 现代图论第9讲
date: 2026-4-30
series: 现代图论
summary: Planar Graphs
tags:
    - Graph Theory
    - Mathematics
---
**平面图**<br>
边只在端点处相交<br>
**(Jordan)** Any simple closed curve C in the plane partitions the rest of the plane into two disjoint arcwise-connected open sets.<br>
K5不是平面图，K5\e是平面图<br>
**Subdivisions 细分**<br>
Any graph derived from a graph G by a sequence of edge subdivisions is called a subdivision of G or a G-subdivision.<br>
一个图是平面图当且仅当它的细分是平面图<br>
K5和K3,3不是平面图<br>
A graph is planar if and only if it contains no subdivision of either K5 or K3,3.<br>
平面图将平面划分为若干个弧连通的开集，每个开集叫做一个面(face)。<br>
面的边界 记作∂(f)<br>
**对偶**<br>
把原图中的面当作点，当原图中两个面被一条边分开则在新图中连接这条边。<br>
一个图是平面图，则它的对偶图也是平面图<br>
面的度：面所有的边数(绕一圈)<br>
同构图的对偶图不一定同构<br>
**欧拉公式**<br>
在连通平面图中，v(G) + f(G) - e(G) = 2<br>
扩展：如果有k个连通分支，则v(G) + f(G) - (e(G) + k - 1) = 2<br>
G是一个顶点数为n≥3，边数为m，则m≤3n-6，当且仅当每个G的平面嵌入都是三角形时取等<br>
每一个简单平面图都有一个点度数不超过5