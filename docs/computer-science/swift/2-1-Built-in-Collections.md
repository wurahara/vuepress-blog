---
series: Swift 进阶
title: 内建集合类型
enable html: true
categories: Swift
tags:
  - collections
date: 2019-11-18 11:19:21
---

在所有的编程语言中，元素的容器都是最重要的数据类型。编程语言对不同容器类型的良好支持，直接决定了编程效率和幸福指数。因此，Swift 在序列和容器方面进行了特别的加强，标准库的开发者对于该部分所投入的精力远超其他部分，以至于让我们觉得标准库几乎就是用来专门处理集合类型的。在本篇中，我们将会讨论 Swift 标准库中内建的几种主要的容器类型，并重点研究如何以符合语言习惯的方式高效地利用它们。

<!-- more -->

## 数组

在 Swift 中最常用的容器类型非数组莫属。数组以有序的方式存储相同类型的元素，并且允许随机访问每个元素。

### 数组索引

Swift 数组提供了你能想到的所有常规操作方法，也允许通过下标直接访问指定索引上的数据。但是在使用下标获取元素之前，要确保索引值没有超过范围，否则程序将会崩溃。

Swift 也提供了很多无需计算索引就能操作数组的方法：

- 迭代数组：`for x in array`
- 列举数组中的元素和对应的下标：`for (num, element) in collection.enumerated()`
- 寻找一个指定元素的位置：`if let index = array.index { someMatchingLogic($0) }`
- 对数组中的所有元素进行变形：`array.map { someTransformation($0) }`
- 筛选出符合特定标准的元素：`array.filter { someCriteria($0) }`

Swift 3 中传统的 C 风格 for 循环在 Swift 4 中被移除了，这也是 Swift 不鼓励程序员手动进行索引计算的一个标志。手动计算和使用索引往往会带来很多潜在的 bug，因此最好避免这么做。

### 数组变形
#### Map

对数组中的每个值执行转换操作是一个很常见的任务。对于该操作，传统的方法是使用 for 循环遍历数组，对每个元素进行操作，然后将结果添加到一个新的数组中。比如，下面的代码计算了一个整数数组里的元素的平方：

```swift
var squared: [Int] = []
for fib in fibs {
    squared.append(fib * fib)
}
```

Swift 提供了函数式风格的方法，可以极大减少程序员的工作量。下面的例子使用 `map` 方法完成同样的操作：

```swift
let squared = fibs.map { fib in
    fib * fib
}
```

`map` 语法增强了代码的可读性，所有无关的内容都被移除了。现在一看到 `map` 你就能意识到即将有一个函数被作用在数组的每一个元素上，并返回另一个数组，这个数组包含了所有被转换后的结果。

#### 使用函数将行为参数化

是什么让 `map` 如此通用且有用？`map` 设法将模版代码分离出来，这些模版代码不会随着每次调用而发生变化，发生变化的是那些功能代码，即如何变换元素的逻辑。`map` 通过将调用者提供的变换函数作为参数来实现这一点。

纵观 Swift 标准库，这种将行为参数化的设计模式有很多。例如在 `Array` 以及其他集合类型中，有诸多方法接受一个函数作为参数，来自定义它们的行为：

- `map` 和 `flatMap` 对元素进行变换；
- `filter` 过滤特定元素；
- `allSatisfy` 针对一个条件测试所有元素；
- `reduce` 将元素聚合成一个值；
- `forEach` 遍历每个元素；
- `sort(by:), sorted(by:), lexicographicallyPrecedes(_:by), partition(by:)` 按不同标准和方法重排元素；
- `firstIndex(where:), lastIndex(where:), first(where:), last(where:), contains(where:)` 判断一个元素是否存在于集合中；
- `min(by:), max(by:)` 寻找集合中的最小值和最大值；
- `elementsEqual(_:by:), starts(with:by:)` 将元素和另一个集合比较；
- `split(whereSeparator:)` 将集合按一定条件分割；
- `prefix(while:)` 从头取元素直至某个位置；
- `drop(while:)` 丢弃元素；
- `removeAll(where:)` 删除所有符合特定条件的元素。

所有以上函数的目的都是为了摆脱代码中杂乱无趣的部分。还有一些类似的很有用的函数，可以接受一个函数来指定行为。这些函数不在 Swift 标准库中，所以需要程序员自己实现：

- `accumulate` 将所有元素合并到一个数组中，并保留合并时每一步的值；
- `count(where:)` 计算满足特定条件的元素的个数；
- `indices(where:)` 返回一个包含满足某个条件的所有元素的索引的列表。

如果你在代码中发现多个地方都有遍历一个数组并做相同或类似的工作时，可以考虑给 `Array` 写一个扩展。比如下面的代码将数组中的元素按照相邻且相等的方式拆分开：

```swift
let array: [Int] = [1, 2, 2, 2, 3, 4, 4]
var result: [[Int]] = array.isEmpty ? [] : [[array[0]]]

for (previous, current) in zip(array, array.dropFirst()) {
    if previous == current {
        result[result.endIndex - 1].append(current)
    } else {
        result.append([current])
    }
}
```

我们可以从逻辑中提取出遍历数组相邻元素的代码，来正式定义这个算法。不同的应用之间的区别就在于从哪里拆分数组，所以我们通过一个函数参数来让调用者自定义这部分逻辑：

```swift
extension Array {
    func split(where condition: (Element, Element) -> Bool) -> [[Element]] {
        var result: [[Element]] = self.isEmpty ? [] : [[self[0]]]
        for (previous, current) in zip(self, self.dropFirst()) {
            if condition(previous, current) {
                result.append([current])
            } else {
                result[result.endIndex - 1].append(current)
            }
        }
        return result
    }
}
```

这样，就可以用下面的代码替换掉 for 循环：

```swift
let parts = array.split { $0 != $1 }
```

在我们的特定情况中，甚至还可以进一步简化：

```swift
let parts = array.split(where: !=)
```

相较于 for 循环，`split(where:)` 版本的代码可读性更强。

#### 可变和带有状态的闭包

当遍历一个数组时，你固然可以使用 `map` 来执行一些带有副作用的操作，但是我们不推荐这样做：

```swift
array.map { item in
    table.insert(item)
}
```

上面的代码将副作用，即修改了另一个变量，隐藏在了一个看起来只是对数组变形的操作中。这样的场合中，使用简单的 for 循环显然是比使用 `map` 这样的函数更好的选择。这样带有副作用的写法，和故意给闭包赋予一个**局部**状态有着本质的不同，而后者是一种非常有用的技术。

闭包是指那些能够捕获和修改自身作用域之外的变量的函数，闭包和高阶函数结合能够构成一个强大的工具。比如刚才提到的 `accumulate` 函数就可以使用 `map` 结合一个带有状态的闭包来实现：

```swift
extension Array {
    func accumulate<Result>(_ initialResult: Result, _ nextPartialResult: (Result, Element) -> Result) -> [Result] {
        var running = initialResult
        return map { next in
            running = nextPartialResult(running, next)
            return running
        }
    }
}
```

这个函数创建了一个中间变量来存储每一步的值，然后使用 `map` 来从中间值逐步计算结果数组：

```swift
[1, 2, 3, 4].accumulate(0, +)
// [1, 3, 6, 10]
```

#### reduce

`map` 和 `filter` 都作用在一个数组上，并产生另一个新的、经过修改的数组。但有时候，你可能会想把数组的所有元素合并为一个新的单一的值。比如，我们可能需要把容器中的值累加：


```swift
let fibs = [0, 1, 1, 2, 3, 5]
var total = 0

for num in fibs {
    total = total + num
}

```

`reduce` 能够实现相似的功能，它把整个实现抽象成两个部分：一个初始值（本例中是 `0`），以及将中间值（`total`）和序列中的元素（`num`）进行合并的函数。使用 `reduce`，我们可以如此重写上面的例子：


```swift
let sum = fibs.reduce(0) { total, num in
    total + num
}
```

运算符也是函数，因此上面的例子还能进一步简化：


```swift
let sum = fibs.reduce(0, +)
```

`reduce` 的输出值类型不必和元素的类型相同。比如如果我们想把一个整数数组转换为一个格式化字符串，可以这样实现：


```swift
let str = fibs.reduce("") { (str, num) -> String in
    str + "\(num), "
}
```

`reduce` 的实现是这样的：

```swift
extension Array {
    func reduce<Result>(_ initialResult: Result, _ nextPartialResult: (Result, Element) -> Result) -> Result {
        var result = initialResult
        for x in self {
            result = nextPartialResult(result, x)
        }
        return result
    }
}
```

## 字典

字典包含键以及键所对应的值，对于一个字典，每个键是唯一的。通过键来获取值花费的平均时间时常数量级的，而在数组中按特定标准搜索元素所花费的时间与数组大小成正比。和数组不同，字典是无序的，这意味着在 Swift 中通过 for 循环遍历字典中的所有键值对时，遍历的顺序是不固定的。

在下面的例子中，我们虚构一个 app 的设置界面，并使用字典作为模型数据层。该界面由一系列设置项组成，每一个设置项都有自己的名字（即键）和值。值可以是文本、数字或者布尔值中的一种，我们使用一个带有关联值的枚举类型来表示：


```swift
enum Setting {
    case text(String)
    case int(Int)
    case bool(Bool)
}

let defaultSettings: [String:Setting] = [
    "Airplane Mode": .bool(false),
    "Name": .text("My iPhone"),
]

defaultSettings["Name"]
// Optional(Setting.text(“My iPhone”))
```

当我们使用下标得到字典中值的时候，字典查找总是返回一个可选值，当指定的键不存在时，它就返回 `nil`。这一点和数组不同，在数组中使用越界下标进行访问会导致程序崩溃。产生这样的区别的原因是我们使用数组索引和字典键的方式有很大的不同。我们之前说过，我们不应该过多使用数组的索引，即使使用到数组索引，这些索引也应该是由某些方式计算得来的，比如从 `0 ... array.count` 这样的范围内获取到。也就是说，使用一个无效索引通常都是程序员的失误。然而字典的键往往是从其他渠道得来的，从字典本身获取键反而很少见，因而程序员对键的正确性无法准确把握。

### 一些有用的字典方法

如果我们想要将一个默认的设置字典和某个用户更改过的自定义设置字典合并，应该怎么做呢？自定义的设置应该覆盖默认设置，同时得到的字典应该包含没有被自定义的键值。换句话说，我们想要合并两个字典，用来做合并的字典需要覆盖重复的键。

字典中有一个方法 `merge(_:uniquingKeysWith:)`，它接受两个参数，第一个参数是要进行合并的键值对，第二个参数定义如何合并相同键的的两个值的合并策略。我们可以使用这个方法将一个字典合并到另一个字典中去：


```swift
var settings = defaultSettings
let overridenSettings: [String:Setting] = [
    "Name": .text("Jane's iPhone")
]

settings.merge(overridenSettings, uniquingKeysWith: { $1 })
```

在上面的例子中，我们使用了 `{ $1 }` 作为合并策略。也就是说，当一个键同时存在于新旧两个字典中时，我们将使用新字典中的值。

### Hashable 要求

字典其实是一张哈希表。字典通过键的哈希值来为每个键在其底层作为存储的数组上指定一个位置。这也就是字典要求键的类型需要遵守 `Hashable` 协议的原因。标准库中的所有基本数据类型都是遵守 `Hashable` 协议的。

对于结构体和枚举类型，只要它们是由可哈希的类型组成的，Swift 就会自动合成 `Hashable` 协议所需要的实现。如果一个结构体的所有存储属性都是可哈希的，结构体就会自动实现 `Hashable` 协议。类似的，只要枚举类型包含可哈希的关联值，就可以自动实现 `Hashable` 协议；对于没有关联值的枚举，甚至不需要显式声明要实现 `Hashable` 协议。如果程序员由于各种原因，需要手动实现 `Hashable` 协议，那么需要让类型首先实现 `Equatable` 协议，然后再通过实现 `hash(into:)` 方法来满足 `Hashable` 协议的要求。

## 集合

标准库中另一个重要的容器类型是集合。集合是一组无序的元素，每个元素在集合中只能出现一次。和字典一样，集合也是通过哈希表实现的，并且拥有类似的性能特性和要求，集合中的元素必须满足 `Hashable` 协议。测试集合中是否包含特定元素是一个常数时间的操作。

### 集合代数

Swift 支持数学集合的基本操作。比如可以在一个集合中求另一个集合的补集：


```swift
let iPods: Set = [
    "iPod touch",
    "iPod nano",
    "iPod mini",
    "iPod shuffle",
    "iPod classic"
]

let discontinuedIPods: Set = [
    "iPod mini",
    "iPod classic",
    "iPod nano",
    "iPod shuffle"
]

let currentIPods = iPods.subtracting(discontinuedIPods)
// [“iPod touch”]
```

求两个集合的交集：


```swift
let touchScreen: Set = [
    "iPhone",
    "iPad",
    "iPod touch",
    "iPod nano"
]

let iPodWithTouch = iPods.intersection(touchScreen)
// ["iPod touch", "iPod nano"]
```

以及并集：


```swift

var discontinued: Set = [
    "iBook",
    "Powerbook",
    "Power Mac"
]
discontinued.formUnion(discontinuedIPods)
// ["iPod shuffle", "iPod mini", "iPod classic", "Power Mac", "Powerbook", "iPod nano"]
```

## 参考文献

1. [Chris Eidhof, Ole Begemann, Airspeed Velocity. Swift 进阶 (第4版).](https://objccn.io/products/advanced-swift/)
