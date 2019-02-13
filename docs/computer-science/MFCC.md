---
title: 倒谱分析(Cepstral Analysis)
subtitle: 梅尔频率倒谱系数(MFCC)在语音信号处理中的应用
tags: Signal processing
date: 2017-12-15 20:19:26
---


于是，我来兑现承诺了。之前说要总结一下论文用到的 MFCC 的原理和使用的，这篇文章就是简单地介绍了倒谱分析，重新地捋了一下 MFCC 提取的全过程。由于我并不是专业搞信号处理和自然语言处理的，所以难免有错误或者理解上的偏差，敬请谅解。

<!-- more -->

## 引言

在介绍 MFCC 之前，首先还是有必要说明一下什么是倒谱，以及倒谱分析的过程及作用。

考虑这样的情况：在语音信号的分析过程中，获取的原始语音波形是根本无法用于后续分析的，首先必须要进行特征的提取。特征提取这个部分有两层含义，一是将有效信息保留下来，而将背景噪声、语言情绪等不需要的信息丢弃掉，以减少后续分析的负担；二是将原始波形进行结构化和形式化，将时间序列转化成一个特征集或者一组特征向量，便于向量化的数值分析。

## 声谱图 (Spectrogram)

让我们仔细思考，对于一段声音信息，我们关注的到底有几个维度呢？有时间维度，也必然有频率维度，还有对应于某个时间、某个频率的信号幅度或者能量。也就是说，对于一段语音信息，我们需要考察其在三个维度上的变化。想要将这种数据信息可视化，看似只能借助于三维图形了。

其实并不是。有一种**声谱图** (Spectrogram) 的图像，可以很好地描述包括语音信号在内的各种信号。那么如何操作呢？首先，将原始信号在时域上切分为多帧，并将每帧进行短时FFT运算，这样就得到了各帧的频谱。通常频谱图有三种，即线性振幅谱、对数振幅谱和自功率谱。

<div align="center">  
<img
    src="http://images.herculas.cn/image/mfcc/diagrams/1.png"
    width="70%"
    alt="声谱图概述"
/>
</div>

现在，我们可以将其中任意的一帧的频谱单独表示出来。那么，当我们将这帧的频谱逆时针旋转 90 度，并将其映射到 0-255 的灰阶图中，我们就可以把这帧的 2 维信息降到 1 维表示。

<div align="center">  
<img
    src="http://images.herculas.cn/image/mfcc/diagrams/2.png"
    width="60%"
    alt="灰阶图"
/>
</div>

当考虑所有帧的时候，将所有帧的灰度图拼接，我们就可以得到基于全时域的（时间-频率-能量）分布图，这就是声谱图。

<div align="center">  
<img
    src="http://images.herculas.cn/image/mfcc/diagrams/3.png"
    width="90%"
    alt="声谱图"
/>
</div>

上图是对应一段真实语音信息的声谱图，需要注意的是，色阶较深的区域往往呈脊状排布，这些区域被称为**共振峰** (Formants)。

<div align="center">  
<img
    src="http://images.herculas.cn/image/mfcc/diagrams/4.png"
    width="50%"
    alt="共振峰"
/>
</div>

那么，为什么需要大费周章地使用声谱图呢？原因有以下几点：

- 可以得到信号（时域-频域）的复合表示；
- 声谱图可以直观地反映出语音信号的**音素** (Phones) 及其特性；
- 通过观测共振峰及其变化，可以更直观地感知声音片段的特性；
- **隐马尔科夫模型** (HMM, Hidden Markov Models) 可以对声谱图进行建模，以进行 **TTS**(Text to Speech) 变换。

## 倒谱分析 (Cepstral Analysis)

如前所述，频谱的峰值，也就是共振峰，表示了语音的主要频率成分。共振峰携带了声音的辨识属性，可以用于声音的识别。事实上，在实际的操作中，我们也是通过提取声音频谱的共振峰来对声音信号进行特征分析的。那么，如何提取共振峰呢？其实，我们可以直接提取声音频谱的包络，包络线不仅包含声音的共振峰的位置，还包含了共振峰的转化过程。

<div align="center">  
<img
    src="http://images.herculas.cn/image/mfcc/diagrams/5.png"
    width="50%"
    alt="包络分离"
/>
</div>

现在的问题变成了如何从频谱中提取包络线。对于对数域的频谱，可以做如下分解：

$$ \log X[k] = \log H[k] + \log E[k] $$

其中，$\log H[k]$ 表示信号频谱的包络，$\log E[k]$ 表示信号频谱的细节。

在介绍分解方法之前，不妨回忆一下我们是如何提取时域信号波形的包络的。在数字信号处理中，我们将时域信号通过一个低通滤波器，将信号中的高频成分滤除，就得到了信号的低频主成分。在频域中，我们也可以采用类似的思路。

如何做呢？很简单，只需要对频谱再做一次 FFT。但是并不是简单的 FFT，因为如果简单的再做一次 FFT，就相当于 IFFT，就把信号转换回了时域。我们应该在对数域上进行 FFT，这就相当于在一个**伪频率** (Pseudo-Frequency) 维度上描述信号。

在伪频率维度上，信号就被分离成了高频和低频两个部分，低频部分代表着我们所需的包络，而高频部分代表着信号的细节。此时只需要采用和时域处理的类似办法，将这时的信号通过一个低通滤波器就可以实现包络 $x[k]$ 的提取了。

## 梅尔频率倒谱系数 (Mel-Frequency Cepstral Coefficients)

在倒谱分析中，我们通过倒谱处理得到了声音频域的包络，也就是连接共振峰的平滑曲线。然而，对人类的听觉感知的相关试验表明，人类的听觉感知主要分布在几段特定的频段区域，而不是平均分布在整个频域上。事实上，人耳类似于一个滤波器组，只关注特定的频率分量，且这个滤波器组在频域上并非均匀分布的，而是从低频到高频呈渐次稀疏的分布状态。

基于这样的理论，梅尔频率倒谱系数模仿人类的听觉和识别机制，建立了特定的滤波器组，用于提取声音信号的有效识别特征。具体的，MFCC 方法将线性的频谱映射到基于听觉实际的 Mel 频谱尺度上，然后再对其进行倒谱分析。其中，将线性频率尺度转化到 Mel 尺度上的变换公式是：

$$ Mel(f) = 2595 \times log_{10}(1 + \frac{f}{700}) $$

对应该公式，有如下的尺度转化示意图：

<div align="center">  
<img
    src="http://images.herculas.cn/image/mfcc/diagrams/7.png"
    width="40%"
    alt="尺度映射"
/>
</div>

在 Mel 频率尺度下，人耳对音调（频率）的感知是线性的，这有助于对语音信号的进一步分析。

## MFCC 的提取

综上所述，提取 MFCC 的过程，大致分为如下的几个部分：

### 预加重 (Pre-Emphasis)

在语音信号中，由于声门气流的影响，每倍频衰减 12dB，而唇腔辐射会带来每倍频 6dB 的增幅，故总的增益是每倍频 -6dB。为了弥补这 6dB 的衰减，我们需要通过预加重来补偿高频部分的能量减弱。此外，往往声音采集设备如麦克风等在采集信号时会在原声中加入低频底噪，也需要预加重来调整高频以平衡高低频能量。

预加重通常通过一个高通滤波器实现，该滤波器在频域的表示为：

$$ H(z) = 1 - kz^{-1} $$

在时域则如下：

$$ s'_n = s_n - ks_{n-1} $$

### 分帧 (Framing) 和加汉明窗 (Hamming Windowing)

时间信号是连续且快速变化的，为了便于使用傅里叶变换分析信号，通常将原始连续信号切分成 20-50ms 的帧，且每帧之间有重叠 (overlap) 部分。为了平滑每帧的边缘，使得FFT后的信号能够体现每帧的品与特性，需要使用汉明窗对每帧信号进行加窗处理，让帧两端平滑地衰减到 0。这样能够降低FFT后旁瓣的幅度，减少频谱泄漏。

汉明窗的时域变换函数为：

$$ s'_n = [0.54 - 0.46 \cos(\frac{2\pi (n-1)}{N-1})] \times s_n $$

### 快速傅里叶变换 (FFT, Fast Fourier Transform)

使用 FFT 来得到每帧的频率特性。FFT 没什么好说的，信号处理的日常了。在 MFCC 中，我们通常只关注信号的幅度谱或功率谱，而忽略掉相位谱。因为在该情况下，相位指相对原点的距离，而对于等间隔的帧提取，相位是固定的。

幅度谱由以下公式提取：

$$ S_i (k) = \sum_{n=1}^{N} s_i (n)e^{-\frac{j2\pi kn}{N}} $$

功率谱为：

$$ P_i (k) = \frac{1}{N} |[\sum_{n=1}^{N} s_i (n)e^{-\frac{j2\pi kn}{N}}]^2|$$

### Mel 尺度映射 (Mel-scale Mapping) 和滤波 (Filtering)

尺度映射的原理和公式，在上面已经进行了较为详细地介绍，不再赘述。

映射后的频谱将会通过一个滤波器组。该滤波器组的构建是整个 MFCC 提取的核心，需要进行着重的介绍。

首先，我们需要规定一个起止频率范围，作为我们频率提取的取值范围，在下文中，我们以 300-8000Hz 为例。那么，对起止频点使用尺度映射公式进行变换，那么 300Hz 就映射到Mel频谱的 401.25Mels 处，8000Hz 映射到 2834.99Mels 处。对于滤波器组含 10 个子滤波器的情况，我们需要 12 个节点。在已有 2 个起止节点的情况下，我们还需要得到剩下的 10 个。这 10 个点来自：

<table>
<thead>
<tr>
<th style="text-align: center;">1</th>
<th style="text-align: center;">2</th>
<th style="text-align: center;">3</th>
<th style="text-align: center;">4</th>
<th style="text-align: center;">5</th>
<th style="text-align: center;">6</th>
</tr>
</thead>

<tbody>
<tr>
<td style="text-align: center;">401.25</td>
<td style="text-align: center;">622.50</td>
<td style="text-align: center;">843.75</td>
<td style="text-align: center;">1065.00</td>
<td style="text-align: center;">1286.25</td>
<td style="text-align: center;">1507.50</td>
</tr>
</tbody>

<thead>
<tr>
<th style="text-align: center;">7</th>
<th style="text-align: center;">8</th>
<th style="text-align: center;">9</th>
<th style="text-align: center;">10</th>
<th style="text-align: center;">11</th>
<th style="text-align: center;">12</th>
</tr>
</thead>

<tbody>
<tr>
<td style="text-align: center;">1728.74</td>
<td style="text-align: center;">1949.99</td>
<td style="text-align: center;">2171.24</td>
<td style="text-align: center;">2392.49</td>
<td style="text-align: center;">2613.74</td>
<td style="text-align: center;">2834.99</td>
</tr>
</tbody>
</table>

是的，线性分割起止点，就得到了所有的中间节点。

接下来，使用尺度变换的反变换，将Mel尺度下的频点变换回线性刻度，就得到了以下频点：

<table>
<thead>
<tr>
<th style="text-align: center;">1</th>
<th style="text-align: center;">2</th>
<th style="text-align: center;">3</th>
<th style="text-align: center;">4</th>
<th style="text-align: center;">5</th>
<th style="text-align: center;">6</th>
</tr>
</thead>

<tbody>
<tr>
<td style="text-align: center;">300</td>
<td style="text-align: center;">517.33</td>
<td style="text-align: center;">781.90</td>
<td style="text-align: center;">1103.97</td>
<td style="text-align: center;">1496.04</td>
<td style="text-align: center;">1973.32</td>
</tr>
</tbody>

<thead>
<tr>
<th style="text-align: center;">7</th>
<th style="text-align: center;">8</th>
<th style="text-align: center;">9</th>
<th style="text-align: center;">10</th>
<th style="text-align: center;">11</th>
<th style="text-align: center;">12</th>
</tr>
</thead>

<tbody>
<tr>
<td style="text-align: center;">2554.33</td>
<td style="text-align: center;">3261.62</td>
<td style="text-align: center;">4122.63</td>
<td style="text-align: center;">5170.76</td>
<td style="text-align: center;">6446.70</td>
<td style="text-align: center;">8000</td>
</tr>
</tbody>
</table>

这些点，就是各子滤波器的起止点。

接下来，我们需要将这些频点舍入到最近的 FFT 点，舍入的计算并不会影响准确性。公式如下：

$$ f(i) = \frac{floor(nfft + 1)h(i)}{F_s} $$

对于一个 8kHz 采样率，512 点的 FFT，得到以下的 FFT 点：

|1|2|3|4|5|6|7|8|9|10|11|12|
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
|9|16|25|35|47|63|81|104|132|165|206|256|

最后就是构造滤波器组。第一个子滤波器应开始于初始频点，在第 2 个频点达到峰值，随后在第 3 个频点处回落到 0。第二个子滤波器则自第 2 个频点开始，第 3 个点到达峰值，在第 4 个点归零，以此类推。计算滤波器组的频响的公式如下：

$$
f(x)= \begin{cases}
0   & k < f(m-1) \\
\frac{k-f(m-1)}{f(m)-f(m-1)} & f(m-1) \leq k \leq f(m) \\
\frac{f(m+1-k)}{f(m+1)-f(m)} & f(m) \leq k \leq f(m+1) \\
0 & k > f(m+1)
\end{cases}
$$

这样，我们就得到了一个完整的 MFCC 滤波器组。
    
<div align="center">  
<img
    src="http://images.herculas.cn/image/mfcc/diagrams/6.png"
    width="60%"
    alt="滤波器组"
/>
</div>

应用该滤波器组有三重意义：

1. 傅里叶变换的结果很多，有数百乃至数千个点，直接作为特征向量的话计算压力很大。将其通过该方式聚合，有效减少了特征集的维度；
2. 频谱的包络和细节分别对应着音色和音高。对于语音识别，音色是有用的，而音高无用。在三角滤波器内积分，能消除细节部分的影响，专注于音色；
3. 构造的滤波器组在低频密集，在高频稀疏，这也是为了模仿人耳的听觉特性。


### 能带系数 (Energy Band Logarithm)

取上述结果的对数，既是在利用倒谱分析的特性，同时也是扩大低频与高频的能量差异。

### 离散余弦变换 (DCT, Discrete Cosine Transform)

DCT 变换的作用主要有两点，一是它只有实部，没有虚部；二是其前几个系数较大，后面的系数较小，可以忽略不计，这能有效地缩减特征空间。

DCT 的计算公式为：

$$ c_{i} = \sqrt{\frac{2}{N}} \sum_{j = 1}^{N} Mel_{j} \cos[\frac{\pi i}{N} (j - 0.5)]$$

### 差分系数提取 (Time Derivatives Extraction)

信号的帧与帧之间存在联系，需要增加一些特征来表达这种关联。通常我们通过计算帧帧之间的一阶以及二阶差分来实现这个目标。其公式为：

$$ d_{i} = \frac{\sum\limits_{n=1}^{N} n(c_{i+n} - c_{i-n})} {2 \sum\limits_{n=1}^{N} n^2} $$

这样，我们就完成了 MFCC 的全部提取工作。

## 参考文献

1. [Practical Cryptography](http://practicalcryptography.com/miscellaneous/machine-learning/guide-mel-frequency-cepstral-coefficients-mfccs/)
2. [Speech Technology: A Practical Introduction Topic: Spectrogram, Cepstrum and Mel-Frequency Analysis](http://www.speech.cs.cmu.edu/15-492/slides/03_mfcc.pdf)