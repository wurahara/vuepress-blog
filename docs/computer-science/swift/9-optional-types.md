---
series: Swift 进阶
title: 可选值及其应用
enable html: true
categories: Swift
tags:
  - optional
date: 2019-11-23 20:00:56
---

可选值是 Swift 的一大卖点，它是让开发者得以书写更安全的代码的最大特性之一。但是仔细想想，真正带来变化的其实不是可选值，而是**非可选值**。几乎所有主流语言都有类似 null 或者 nil 的概念；但它们中的大多数所缺乏的是把一个值声明为“从不为 nil”的能力。或者反过来想，有一些类型，比如 Java 中的非 class 类型，它们总是不为 nil，这又让开发者必须使用某个魔数来表示缺少一个值的情况。

设计 API 的过程中，根据实际需要让输入输出包含精心设计过的可选值，不仅会让调用函数的代码更有表现力，这些函数用起来也会更简单。因为通过函数签名能够传递更多信息，开发者也就不必总是诉诸文档了。

<!-- more -->

## 哨岗值

在编程世界中有一种非常通用的模式，那就是某个操作是否要返回一个有效值。

### 其他语言的情况

比如当你在读取文件并读到文件末尾时，也许期望的是不返回值，就像下面的 C 代码一样：


```C
int ch;
while ((ch = getchar()) != EOF) {
    printf("Read character %c\n", ch);
}
printf("Reached end-of-file\n");
```

`EOF` 只是对于 `-1` 的一个宏定义。如果文件中还有其他字符，`getchar()` 将会返回它们。一旦到达文件末尾，`getchar()` 将会返回它们。一旦到达文件末尾，`getchar()` 将返回 `-1`。

又或者返回空值意味着“未找到”，就像下面这段 C++ 代码一样：


```Cpp
auto vec = {1, 2, 3};
auto iterator = std::find(vec.begin(), vec.end(), someValue);
if (iterator != vec.end()) {
    std::cout << "vec contains " << *iterator << std::endl;
}
```

在这里，`vec.end()` 返回的迭代器表示容器最后一个元素的下一个位置。这是一个特殊的迭代器，你可以用它来检查容器末尾，但是不能实际用它获取一个值。

再或者，是因为函数处理过程中发生了某些错误，导致没有值能够返回。其中最**臭名昭著**的例子大概就是空指针异常了。下面这段 Java 代码就将抛出一个空指针异常：


```Java
int i = Integer.getInteger("123");
```

因为实际上 `Integer.getInteger()` 做的事情并不是将字符串解析为整数，它实际上会去尝试获取一个叫 `"123"` 的系统属性的整数值。而由于系统中并不存在这样的属性，所以这个方法将返回 `null`。接下来 JVM 会将 `null` 拆箱并赋予一个整型数，这个拆箱过程会抛出一个空指针异常。

### 哨岗值与魔数

上面所有的例子中，这些函数都返回了一个“魔数”来表示其并没有返回真实的值。这样的值被称为哨岗值 (Sentinel Values)。这种策略其实是有问题的，因为返回的结果不管从哪个角度来看都很像一个真实值。`-1` 也是一个有效的整数，但是你却不想它被打印出来。`vec.end()` 也是一个迭代器，但是当你读取这个位置的值时，结果却是未定义的。当你的 Java 程序抛出一个空指针异常时，所有人都想看的是栈转储信息 (stack dump)。

哨岗值的另一个问题是使用它们还需要一些前置知识。比如像是 C++ 的 `end` 迭代器，或者是 Objective-C 中错误处理的约定俗成的用法。如果没有这些约定，或者你不知道它们，那你只能依赖文档进行开发。另外，一个函数也没有办法来表明自己**不会**失败。也就是说，当一个函数返回指针时，这个指针有可能绝对不会是 `nil` 或 `null`。但是除了阅读文档之外，程序员没有办法能知道这个事实。更有甚者，文档本身就是错的。

## 通过枚举解决魔数问题

当然，每个有经验的程序员都知道使用魔数不好。大多数语言都支持某种形式的枚举类型，用它表达某个类型可能包含的所有值是一种更为安全的做法。

而 Swift 更进了一步，在枚举中引入了**关联值**的概念。也就是说，枚举类型可以在它们的成员中包含另外的关联的值。Swift 中的可选值类型也是通过枚举类型实现的：


```swift
enum Optional<Wrapped> {
    case none
    case some(Wrapped)
}
```

获取枚举类型关联值的唯一方式是通过**模式匹配**，就像在 `switch` 或 `if case let` 中使用的匹配方法一样。和哨岗值不同，除非你显式地检查并解包，否则是不可能意外地获取到一个 `Optional` 中包装的值的。

因此，Swift 中和 C++ 的 `std::find()` 等效的方法 `firstIndex(of:)` 返回的不是一个哨岗值，而是一个 `Optional<Index>`。以下是一个简单的实现：


```swift
extension Collection where Element: Equatable {
    func firstIndex(of element: Element) -> Optional<Index> {
        var idx = startIndex
        while idx != endIndex {
            if self[idx] == element {
                return .some(idx)
            }
            formIndex(after: &idx)
        }
        return .none
    }
}
```

::: tip
由于可选值是 Swift 中非常重要和基础的类型，所以有很多让它用起来更简洁的语法：`Optional<Index>` 可以写成 `Index?`；可选值遵守 `ExpressibleByNilLiteral` 协议，因此可以使用 `nil` 替代 `.none`；像上面 `idx` 这样的非可选值将在必要的时候自动升级称为可选值，这样你就可以直接写 `return idx`，而不用 `return .some(idx)` 了。
:::

现在，程序员就不会再没有检查的情况下错误地使用一个值了：


```swift
var array = ["one", "two", "three"]
let index = array.firstIndex(of: "four")
array.remove(at: index)
// Error: value of optional type ‘Int?’ must be unwrapped to a value of type ‘Int’.
```

相反，假设得到的结果不是 `.none`，为了使用包装在可选值中的索引，你必须对其进行解包：


```swift
switch array.firstIndex(of: "four") {
case .some(let index):
    array.remove(at: index)
case .none:
    break
}
```

在这个 `switch` 语句中，我们使用了匹配普通枚举的语法来处理可选值。这种做法非常安全，但是读写都不够顺畅。一种更简明的写法是使用 `?` 作为在 `switch` 中对 `some` 进行匹配时的模式后缀，还可以使用 `nil` 字面量来匹配 `none`：


```swift
switch array.firstIndex(of: "four") {
case let index?:
    array.remove(at: index)
case nil:
    break
}
```

但是这仍然有点笨重。我们接下来会看看是否还有其他更加简短清晰的表达方式可供选择。

## 可选值的表达与使用

可选值在 Swift 中有很多来自语言内建的支持。下面我们会介绍一些在 Swift 中使用可选值的常见方式。

### if let

使用 `if let` 来进行可选值绑定 (Optional Binding) 要比使用 `switch` 语句稍好一些。`if let` 语句会检查可选值是否为 `nil`，如果不是 `nil` 就会解包可选值并赋值，赋值变量仅在 `if let` 的作用域中有效。


```swift
if let index = array.firstIndex(of: "four") {
    array.remove(at: index)
}
```

你也可以在同一个 `if` 语句中绑定多个值，在后面的绑定中可以使用之前成功解包出来的结果。当你要连续调用多个返回可选值的函数时，这个功能就特别有用了。比如下面的 `URL` 和 `UIImage` 的初始化器都是可失败的 (failable)，也就是说，如果你的 URL 是无效的，或者数据不是一个图片数据，这些方法都会返回 `nil`。而 `Data` 的初始化器会抛出错误，我们可以通过 `try?` 来把它转化为一个可选值。它们三者的调用可以通过下面的方式串联起来：

```swift
let urlString = "https://www.objc.io/logo.png"
if let url = URL(string: urlString), let data = try? Data(contentsOf: url), let image = UIImage(data: data) {
    let view = UIImageView(image: image)
    PlaygroundPage.current.liveView = view
}
```

### while let

`while let` 语句和 `if let` 语句非常相似，表示一个条件返回 `nil` 时终止循环。

标准库中的 `readLine()` 函数从标准输入中读取内容，并返回一个可选字符串。当到达输入末尾时，该函数将返回 `nil`。所以可以使用 `while let` 实现一个非常基础的和 Unix 中 `cat` 命令等价的功能：


```swift
while let line = readLine() {
    print(line)
}
```

`for x in seq` 这样的循环语句需要 `seq` 遵守 `Sequence` 协议，该协议提供了 `makeIterator()` 方法来创建迭代器，而迭代器中的 `next()` 方法将不断返回序列中的值，并在序列中的值被耗尽的时候返回 `nil`。`while` 非常适合用在这个场景中：


```swift
let array = [1, 2, 3]
var iterator = array.makeIterator()
while let i = iterator.next() {
    print(i, terminator: " ")
}
// 1, 2, 3
```

### 双重可选值

一个可选值的包装类型也可以是一个可选值，这会导致可选值的嵌套。这既不是一个奇怪的边界情况，编译器也不应该自动合并嵌套的可选值类型。

为了了解这种应用场景，假设有一个表示数字的字符串数组，为了把它转换成整数数组，你可能会使用 `map` 进行转换：


```swift
let stringNumbers = ["1", "2", "three"]
let maybeInts = stringNumbers.map { Int($0) }
// [Optional(1), Optional(2), nil]
```

你现在得到了一个元素类型为 `Optional<Int>` 的数组，即 `Int?` 数组，这是因为 `Int.init(String)` 是可失败初始化器，当字符串无法转换成整数时失败。由于 `next()` 方法会把序列中的每个元素包装成可选值，所以 `iterator.next()` 返回的其实是一个 `Optional<Optional<Int>>` 值，即一个 `Int??`。而 `while let` 会解包并检查这个值是不是 `nil`，如果不是就绑定解包的值并运行循环体：


```swift
var iterator = maybeInts.makeIterator()
while let maybeInt = iterator.next() {
    print(maybeInt, terminator: " ")
}
// Optional(1), Optional(2), nil
```

当循环到达最后一个值，也就是从 `"three"` 转化成的 `nil` 时，从 `next()` 返回的其实是一个非 `nil` 的值 `.some(nil)`。`while let` 将该值解包，并将解包结果绑定到 `maybeInt` 上。


### 解包后可选值的作用域

有时候只能在 `if` 块的内部访问被解包的变量。比如：


```swift
if let firstElement = array.first {
    print(firstElement)
}

// if 块的外部不能使用 firstElement
```

解包后的值只能在 `if let` 块内部使用，这在绝大多数情况下都很好。但当 if 语句的目的是在某些条件不满足时提前退出函数时，这个特性就不太实用了。提前退出 (early exit) 可以帮助我们在这个函数稍后的部分避免嵌套或者重复检查。比如你可能会编写下面这样的代码：


```swift
func doStuff(withArray a: [Int]) {
    if a.isEmpty {
        return
    }
}
```

在上面的例子中，`if let` 无法为我们实现期望的功能，因为在 if 语句块之后绑定的值就离开它的作用域了。想要实现我们期望的功能，我们可以使用 `guard let`。

```swift
func doStuff(withArray a: [Int]) {
    guard let firstElement = a.first else {
        return
    }
    // firstElement 在这里已经被解包了
}
```

在 `guard` 的 `else` 代码块中，你可以执行任意代码，唯一的要求是必须离开当前的作用域，通常这意味着一条 `return` 语句或者抛出一个错误，或者调用 `fatalError`以及其他返回 `Never` 的方法。

## 参考文献

1. [Chris Eidhof, Ole Begemann, Airspeed Velocity. Swift 进阶 (第4版).](https://objccn.io/products/advanced-swift/)
