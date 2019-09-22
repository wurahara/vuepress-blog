---
series: 光栅化渲染器
title: 布雷森汉姆直线绘制算法
enable html: true
categories: Rasterizer
tags:
  - C++
  - rasterizer
  - renderer
date: 2019-09-15 20:07:20
---

这个系列的目的是用 C++ 实现一个简易的光栅化渲染器，用来展示 OpenGL 的工作方式。本任务将不使用第三方库以及任何 C++ 图形库实现光栅渲染。这个项目参考自 Dimitry V. Sokolov 的教程，详情可以点击[这里](https://github.com/ssloy/tinyrenderer)。

<!-- more -->

在开始本文之前，我们首先需要明确几个概念：

- **光栅化** (Rasterization)：又称栅格化或者像素化。简而言之就是把矢量图形数据转化为像素点的过程。以一段线段为例，该线段在计算机中以方程或者端点坐标的方式储存，当渲染到屏幕时需要将方程转化为一系列像素点，这个过程就是光栅化。
- **图形渲染管线** (Graphic Pipeline)：指在三维渲染过程中显示处理单元执行的从几何体到最终渲染图像的数据传输处理计算的过程。
- **着色器** (Shader)：用于指示显示处理单元图像如何构造、如何上色的小程序。着色器按功能通常分为两种：
  - 顶点着色器 (Vertex Shader)：处理顶点、法线等数据的小程序；
  - 片面着色器 (Fragment Shader)：处理光线、阴影、遮挡、环境等对物体表面的影响，最终生成图像的小程序。

在今天的第一节中，我们首先需要实现一个简单的直线算法，输入线段的两个端点，渲染出整条线段。

## 布雷森汉姆 (Bresenham) 直线绘制算法

在标题中，我们已经透露了最终的算法为布雷森汉姆算法，你当然可以直接去搜索这个算法，但是为了明白这个算法的原委以及各个直线算法的优缺点，我们首先从几个简单的尝试开始。

### 参数方程表达

对于一条从 $(x_0, y_0)$ 出发到 $(x_1, y_1)$ 的线段，我们在高中时学过这样的参数方程：

$$ \left\{
    \begin{array}{lr}
        x=x_0+(x_1-x_0)t \\
        y=y_0+(y_1-y_0)t
    \end{array}
\right. $$

其中，$t \in [0, 1)$。基于参数方程的表达形式，我们可以实现以下算法：

```Cpp
void line(int x0, int y0, int x1, int y1, TGA_Image &image, TGA_Color color) {
    for (float t = 0; t < 1; t += 0.01) {
        int x = x0 + (x1 - x0) * t;
        int y = y0 + (y1 - y0) * t;
        image.set(x, y, color);
    }
}
```

上述代码画出的从点 $(13, 20)$ 到点 $(80, 40)$ 的线段如下：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/renderer/line/renderer1-1.png"
    width="30%"
    alt="line1"
/>
</div>

### 改进的参数方程表达

上面的算法有什么问题呢？显然，该算法的效率很低。除此之外，循环时选择的步进长度也是问题的关键。在上面的示例中，我们的步进长度选择的是 0.01，如果我们将步进改为 0.1，画出的线段就变成了下面这个样子：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/renderer/line/renderer1-2.png"
    width="30%"
    alt="line2"
/>
</div>

这种算法显然存在问题，它对粒度的选择存在很大的依赖性。如果我们简单的将步长设置为端点横坐标的差值的整型值，就可以得到如下的改进算法：

```Cpp
void line(int x0, int y0, int x1, int y1, TGA_Image &image, TGA_Color color) {
    for (int x = x0; x <= x1; x++) {
        float t = (x - x0) / (float) (x1 - x0);
        int y = y0 * (1.0 - t) + y1 * t;
        image.set(x, y, color);
    }
}
```

但是这样的算法在实际使用中仍然存在问题，如果我们需要画下面的这三条线段：

```Cpp
line(13, 20, 80, 40, image, white);
line(20, 13, 40, 80, image, red);
line(80, 40, 13, 20, image, red);
```

最终画出来的图像是这个样子的：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/renderer/line/renderer1-3.png"
    width="30%"
    alt="line3"
/>
</div>

请注意，我们的第一条线段和第三条线段其实是同一条线段，差别仅在于起止点正好相反，且颜色不同。如果一切正常的话，第三条红色线段本该覆盖第一条白色线段，但是这并没有发生。这说明，我们的算法无法处理对称的情况。合理的算法应该不依赖于输入点的顺序，无论输入的是 $A$ 到 $B$ 还是 $B$ 到 $A$ ，画出来的应该是同一条线段。

此外，此算法画出来的第二条线段也存在问题，该直线点与点之间的距离过大，以至于渲染的结果看起来像是一条虚线，这显然也不应该是正常的结果。

### 修复对称性

修复对称性的一个简单的办法，就是将横坐标小的点交换在横坐标较大的点前面。

```Cpp
if (x0 > x1) {
    std::swap(x0, x1);
    std::swap(y0, y1);
}
```

另一个问题，也就是点之间存在空洞的原因，是某些线段的纵坐标差远大于横坐标差，即这些线段的斜率过大。由于我们在绘制时以横坐标差作为步长，就会出现两点之间间隔过大的情况。对于这个问题的修复方法，Sokolov 的学生有如下想法：

```Cpp
if (dx > dy) {
    for (int x ...) {
        // ...
    }
} else {
    for (int y ...) {
        // ...
    }
}
```

Sokolov 则倾向于同样使用交换与转置解决问题：

```Cpp
void line(int x0, int y0, int x1, int y1, TGA_Image &image, TGA_Color color) {
    bool steep = false;
    if (std::abs(x0 - x1) < std::abs(y0 - y1)) {
        // If the line is steep, transpose the image
        std::swap(x0, y0);
        std::swap(x1, y1);
        steep = true;
    }
    if (x0 > x1) {
        std::swap(x0, x1);
        std::swap(y0, y1);
    }
    
    for (int x = x0; x <= x1; x++) {
        float t = (x - x0) / (float) (x1 - x0);
        int y = y0 * (1.0 - t) + y1 * t;
        if (steep) {
            // If transposed, de-transpose
            image.set(y, x, color);
        } else {
            image.set(x, y, color);
        }
    }
}
```

这样，画出的三条直线就完美符合我们预想的效果：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/renderer/line/renderer1-4.png"
    width="30%"
    alt="line4"
/>
</div>

### 时间和绘制优化

上述代码的时间复杂度已经达到最优化的状态，但是具体的时间消耗依然很高。举个例子，在上述代码中，计算 `t`的代码每次都会计算一遍`x1 - x0`作为分母。我们可以将这个计算从循环中提出来。

此外，在新的算法中，我们还引入了一个误差变量`error`，这个变量给出了我们绘制的某个`(x, y)`的值到理论线段的距离。每当这个距离大于一个像素时，我们就会修正`y`和`error`值。这个操作将使得我们的直线的锯齿更小。

```Cpp
void line(int x0, int y0, int x1, int y1, TGA_Image &image, TGA_Color color) { 
    bool steep = false; 
    if (std::abs(x0 - x1) < std::abs(y0 - y1)) { 
        std::swap(x0, y0); 
        std::swap(x1, y1); 
        steep = true; 
    } 
    if (x0 > x1) { 
        std::swap(x0, x1); 
        std::swap(y0, y1); 
    } 
    int dx = x1 - x0; 
    int dy = y1 - y0; 
    float derror = std::abs(dy / float(dx)); 
    float error = 0; 
    int y = y0; 
    for (int x = x0; x <= x1; x++) { 
        if (steep) { 
            image.set(y, x, color); 
        } else { 
            image.set(x, y, color); 
        } 
        error += derror; 
        if (error > 0.5) { 
            y += (y1 > y0 ? 1 : -1); 
            error -= 1.0; 
        } 
    } 
} 
```

### 浮点数优化

上面的代码中，我们多次使用浮点数进行运算。众所周知，浮点数将会在很大程度上托慢程序的运行速度。将浮点数全部换成整型数，我们可以如下操作：

```Cpp
void line(int x0, int y0, int x1, int y1, TGA_Image &image, TGA_Color color) { 
    bool steep = false; 
    if (std::abs(x0 - x1) < std::abs(y0 - y1)) { 
        std::swap(x0, y0); 
        std::swap(x1, y1); 
        steep = true; 
    } 
    if (x0 > x1) { 
        std::swap(x0, x1); 
        std::swap(y0, y1); 
    } 
    int dx = x1 - x0; 
    int dy = y1 - y0; 
    int derror2 = std::abs(dy) * 2; 
    int error2 = 0; 
    int y = y0; 
    for (int x = x0; x <= x1; x++) { 
        if (steep) { 
            image.set(y, x, color); 
        } else { 
            image.set(x, y, color); 
        } 
        error2 += derror2; 
        if (error2 > dx) { 
            y += (y1 > y0 ? 1 : -1); 
            error2 -= dx * 2; 
        } 
    } 
} 
```

在上面的代码中，我们稍微修改了误差参数的计算方法，将其全部修改成了整型数。据 Sokolov 的测试，上面的代码将运行时间从 2.95 秒减少到 0.64 秒。

## 线框渲染

基于上面的直线渲染算法，我们现在可以进行模型的线框渲染了。代码接受一个 obj 格式的输入文件，这个文件记录了线框中线段的参数。渲染器将从模型文件中读出这样的数据行：

```Cpp
v 0.608654 -0.568839 -0.416318

f 1193/1240/1193 1180/1227/1180 1179/1226/1179
```

其中，`v` 开头的行后面的三个参数指代的是一个顶点的 $(x, y, z)$ 坐标。对于以 `f` 开头的行，我们关心的是没个空格之后的第一个数字。以上面的行为例，它代表第1193，1180和1179个顶点构成了一个三角形面。渲染器中使用如下代码进行线框的绘制：

```Cpp
for (int i = 0; i < model->nfaces(); i++) { 
    std::vector<int> face = model->face(i); 
    for (int j = 0; j < 3; j++) { 
        Vec3f v0 = model->vert(face[j]); 
        Vec3f v1 = model->vert(face[(j + 1) % 3]); 
        int x0 = (v0.x + 1.0) * width / 2.0; 
        int y0 = (v0.y + 1.0) * height / 2.0; 
        int x1 = (v1.x + 1.0) * width / 2.0; 
        int y1 = (v1.y + 1.0) * height / 2.0; 
        line(x0, y0, x1, y1, image, white); 
    } 
}
```

下图就是线框渲染的结果：

<div align="center">  
<img
    src="http://images.herculas.cn/image/blog/renderer/line/renderer1-5.png"
    width="70%"
    alt="line5"
/>
</div>

## 参考文献

1. [Dmitry V. Sokolov. Lesson 1: Bresenham’s Line Drawing Algorithm. TinyRenderer. 2019/01/28.](https://github.com/ssloy/tinyrenderer/wiki/Lesson-1:-Bresenham's-Line-Drawing-Algorithm)
2. [zauonlok. 如何开始用C++写一个光栅化渲染器？ 知乎. 2019/09/12.](https://www.zhihu.com/question/24786878/answer/820931418)

