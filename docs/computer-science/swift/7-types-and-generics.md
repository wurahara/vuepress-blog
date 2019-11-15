---
series: Swift 基础
title: 类型转换、泛型与不透明类型
enable html: true
categories: Swift
tags:
  - generic
  - opaque type
date: 2019-11-10 11:31:51
---

本篇中我们关注的是 Swift 中的泛型和不透明类型。这两个语法元素提供了几乎相反的功能。具有不透明返回类型的函数或方法会隐藏返回值的类型信息，函数不再提供具体的类型作为返回类型，而是根据它支持的协议来描述返回值，这为一些表达提供了更为优雅的实现。

<!-- more -->

## 类型转换 (Type Casting)

类型转换可以判断实例的类型，也可以将实例看作是其父类或者子类的实例。类型转换在 Swift 中使用 `is` 和 `as` 操作符实现，这两个操作符分别提供了一种简单达意的方式检查值的类型或者转换它的类型。也可以使用它来检查一个类型是否遵循了某个协议。

### 为类型转换定义类层次

你可以将类型转换用在类和子类的层次结构上，检查特定类实例的类型并且转换这个类实例的类型称为这个层次结构中的其他类型。

下面的代码定义了一个基类 `MediaItem`，为媒体提供基础功能。

```swift
class MediaItem {
    var name: String
    init(name: String) {
        self.name = name
    }
}
```

下面的代码定义了 `MediaItem` 的两个子类。第一个子类 `Movie` 封装了与电影相关的额外信息。第二个子类 `Song` 在父类的基础上新增了歌曲的相关信息。

```swift
class Movie: MediaItem {
    var director: String
    init(name: String, director: String) {
        self.director = director
        super.init(name: name)
    }
}

class Song: MediaItem {
    var artist: String
    init(name: String, artist: String) {
        self.artist = artist
        super.init(name: name)
    }
}
```

下面的代码创建了一个数组常量 `library`，包含 `Movie` 和 `Song` 的实例。`library` 的类型是在它被初始化时根据它数组中包含的内容推导出来的。Swift 的类型检测器能够推导出 `Movie` 和 `Song` 有共同父类 `MediaItem`，所以它推断出 `library` 的类型是 `Array<MediaItem>`。

```swift
let library = [
    Movie(name: "Casablanca", director: "Michael Curtiz"),
    Song(name: "Blue Suede Shoes", artist: "Elvis Presley"),
    Movie(name: "Citizen Kane", director: "Orson Welles"),
    Song(name: "The One And Only", artist: "Chesney Hawkes"),
    Song(name: "Never Gonna Give You Up", artist: "Rick Astley")
]
// 数组 library 的类型被推断为 [MediaItem]
```

在幕后，`library` 里存储的元素依然是 `Movie` 和 `Song` 类型的。但是如果迭代 `library`，取出的元素将是 `MediaItem` 类型的，而不是 `Movie` 或者 `Song` 类型。为了让这些元素作为原本的类型工作，需要检查它们的类型或者向下转换它们到其他类型。

### 检查类型

用类型检查操作符 `is` 检查一个实例是否属于特定子类。

```swift
var movieCount = 0
var songCount = 0
for item in library {
    if item is Movie {
        movieCount += 1
    } else if item is Song {
        songCount += 1
    }
}
print("Media library contains \(movieCount) movies and \(songCount) songs")
// 打印 Media library contains 2 movies and 3 songs
```

### 向下转型

某类型的常量或变量可能在幕后属于一个子类。当确定是这种情况时，可以尝试用类型转换操作符 `as?` 或 `as!` 向下转型。转型不会真的改变实例或它的值。根本的实例保持不变，只是简单地把它作为被转换成的类型来使用。

```swift
for item in library {
    if let movie = item as? Movie {
        print("Movie: \(movie.name), dir \(movie.director)")
    } else if let song = item as? Song {
        print("Song: \(song.name), by \(song.artist)")
    }
}
// Movie: Casablanca, dir. Michael Curtiz
// Song: Blue Suede Shoes, by Elvis Presley
// Movie: Citizen Kane, dir. Orson Welles
// Song: The One And Only, by Chesney Hawkes
// Song: Never Gonna Give You Up, by Rick Astley
```

### Any 和 AnyObject 类型

Swift 为不确定类型提供了两种特殊的类型别名：

- `Any` 可以表示任何类型，包括函数类型；
- `AnyObject` 可以表示任何类的实例。

下面是一个使用 `Any` 类型来混合不同类型一起工作的示例。

```swift
var things = [Any]()

things.append(0)
things.append(0.0)
things.append(42)
things.append(3.14159)
things.append("hello")
things.append((3.0, 5.0))
things.append(Movie(name: "Ghostbusters", director: "Ivan Reitman"))
things.append({ (name: String) -> String in "Hello, \(name)" })
```

可以在 `switch` 表达式中判断具体类型，并进行具体操作。

```swift
for thing in things {
    switch thing {
    case 0 as Int:
        print("zero as an integer.")
    case 0 as Double:
        print("zero as a double float.")
    case let someInt as Int:
        print("an integer value of \(someInt).")
    case let someDouble as Double where someDouble > 0:
        print("a positive double value of \(someDouble).")
    case is Double:
        print("some other double value that I don't want to print.")
    case let someString as String:
        print("a string value of \"\(someString)\".")
    case let (x, y) as (Double, Double):
        print("an (x, y) point at \(x), \(y).")
    case let movie as Movie:
        print("a movie called \(movie.name), dir. \(movie.director).")
    case let stringConvertor as (String) -> String:
        print(stringConvertor("Michael"))
    default:
        print("something else.")
    }
}

// zero as an Int
// zero as a Double
// an integer value of 42
// a positive double value of 3.14159
// a string value of "hello"
// an (x, y) point at 3.0, 5.0
// a movie called Ghostbusters, dir. Ivan Reitman
// Hello, Michael
```

`Any` 类型可以表示所有类型的值，包括可选类型。Swift 会在你用 `Any` 类型来表示一个可选值的时候给你一个警告。如果你确实想用 `Any` 类型来承载可选值，你可以使用 `as` 操作符显式转换为 `Any`：

```swift
let optionalNumber: Int? = 3
things.append(optionalNumber)             // 警告
things.append(optionalNumber as Any)      // 没有警告
```

## 泛型 (Generics)

泛型代码让你能根据自定义的需求，编写出适用于任意类型的、灵活可复用的函数及类型。你可避免编写重复的代码，而是用一种清晰抽象的方式来表达代码的意图。

## 类型约束 (Type Constraints)

类型约束可以指定类型参数必须继承自指定类、遵循特定协议或协议组合。在一个类型参数名后放置一个类名或协议名来定义类型约束。

下面是一个用于在 `String` 数组中查找给定 `String` 值的索引的非泛型函数：

```swift
func findIndex(ofString valueToFind: String, in array: [String]) -> Int? {
    for (index, value) in array.enumerated() {
        if value == valueToFind {
            return index
        }
    }
    return nil
}

let strings = ["cat", "dog", "llama", "parakeet", "terrapin"]
if let foundIndex = findIndex(ofString: "llama", in: strings) {
    print("The index of llama is \(foundIndex).")
}
// 打印 The index of llama is 2.
```

下面展示了 `findIndex(ofString:in:)` 的泛型版本：

```swift
func findIndex<T: Equatable>(of valueToFind: T, in array: [T]) -> Int? {
    for (index, value) in array.enumerated() {
        if value == valueToFind {
            return index
        }
    }
    return nil
}
```

上述函数使用 `Equatable` 协议对泛型进行约束，要求任何遵循该协议的类型必须实现 `==` 和 `!=`，从而能对两个该类型的值进行比较。

```swift
let doubleIndex = findIndex(of: 9.3, in: [3.14159, 0.1, 2.5])
// doubleIndex 类型为 Int?，其值为 nil，因为 9.3 不在数组中
let stringIndex = findIndex(of: "Andrea", in: ["Mike", "Malcolm", "Andrea"])
// stringIndex 类型为 Int?，其值为 2
```

### 关联类型 (Associated Types)

定义一个协议时，声明若干个关联类型作为协议定义的一部分会非常有用。关联类型为协议中的某个类型提供了一个占位符，其代表的类型在协议被遵循时才会被指定。

```swift
protocol Container {
    associatedtype Item
    mutating func append(_ item: Item)
    var count: Int { get }
    subscript(i: Int) -> Item { get }
}
```

上面的 `Container` 协议没有指定容易中元素的类型，只声明了一个关联类型 `Item`。让泛型类型遵循 `Container` 协议：

```swift
struct Stack<Element>: Container {
    var items = [Element]()
    mutating func push(_ item: Element) {
        items.append(item)
    }
    mutating func pop() -> Element {
        return items.removeLast()
    }
    
    mutating func append(_ item: Element) {
        self.append(item)
    }
    var count: Int {
        return items.count
    }
    subscript(i: Int) -> Element {
        return items[i]
    }
}
```

### 泛型 where 语句

对关联类型添加类型约束是非常有用的。你可以通过定义一个泛型 `where` 子句来实现。通过泛型 `where` 子句让关联类型遵从某个特定的协议，以及某个特定的类型参数和关联类型必须类型相同。

下面的例子定义了一个名为 `allItemsMatch` 的泛型函数，用来检查两个 `Container` 实例是否包含相同顺序的相同元素。

```swift
func allItemsMatch<C1: Container, C2: Container>
    (_ someContainer: C1, _ anotherContainer: C2) -> Bool 
    where C1.Item == C2.Item, C1.Item: Equatable {
        if someContainer.count != anotherContainer.count {
            return false
        }
        for i in 0 ..< someContainer.count {
            if someContainer[i] != anotherContainer[i] {
                return false
            }
        }
        return true
}
```

上述函数的类型参数表定义了对 `C1` 和 `C2` 的要求：

- `C1` 必须符合 `Container` 协议；
- `C2` 必须符合 `Container` 协议；
- `C1` 的 `Item` 必须和 `C2` 的 `Item` 类型相同；
- `C1` 的 `Item` 必须符合 `Equatable` 协议。

```swift
var stackOfStrings = Stack<String>()
stackOfStrings.push("uno")
stackOfStrings.push("dos")
stackOfStrings.push("tres")

var arraysOfStrings = ["uno", "dos", "tres"]
extension Array: Container {}
if allItemsMatch(stackOfStrings, arraysOfStrings) {
    print("All items match.")
} else {
    print("Not all items match.")
}
// 打印 All items match.
```

### 具有泛型 where 子句的扩展

也可以使用泛型 `where` 子句作为扩展的一部分。下面的示例扩展了泛型 `Stack` 结构体，添加一个 `isTop(_:)` 方法。

```swift
extension Stack where Element: Equatable {
    func isTop(_ item: Element) -> Bool {
        guard let topItem = items.last else {
            return false
        }
        return topItem == item
    }
}
```

在上述扩展中，如果尝试不使用泛型 `where` 子句，会有一个问题：在函数中使用了 `==` 运算符，但是 `Stack` 的定义没有要求其元素必须是符合 `Equatable` 协议的，所以使用 `==` 会产生一个编译期错误。使用泛型 `where` 子句可以为扩展添加新的条件，只有当 `Stack` 中的元素符合 `Equatable` 协议时，扩展才会添加 `isTop(_:)` 方法。

## 不透明类型 (Opaque Types)

具有不透明返回类型的函数或方法会隐藏返回值的类型信息。函数不再提供具体的类型作为返回类型，而是根据它支持的协议来描述返回值。在处理模块和调用代码之间的关系时，隐藏类型信息非常有用，因为返回的底层数据类型仍然可以保持私有。而且不同于返回协议类型，不透明类型能保证类型一致性，即编译器能够获取到类型信息，同时模块使用者却不能获取到。

假如你正在协议个模块，用来绘制 ASCII 符号构成的几何图形。它的基本特征是有一个 `draw()` 方法，会返回一个代表最终几何图形的字符串，你可以用包含这个方法的 `Shape` 协议来描述：

```swift
protocol Shape {
    func draw() -> String
}

struct Triangle: Shape {
    var size: Int
    func draw() -> String {
        var result = [String]()
        for length in 1 ... size {
            result.append(String(repeating: "*", count: length))
        }
        return result.joined(separator: "\n")
    }
}
let smallTriangle = Triangle(size: 3)
print(smallTriangle.draw())
// *
// **
// ***
```

可以利用泛型来实现垂直翻转之类的操作。但是这种方式有一个很大的局限：翻转操作的结果会暴露我们用于构造结果的泛型类型：

```swift
struct FlippedShape<T: Shape>: Shape{
    var shape: T
    func draw() -> String {
        let lines = shape.draw().split(separator: "\n")
        return lines.reversed().joined(separator: "\n")
    }
}
let flippedTriangle = FlippedShape(shape: smallTriangle)
print(flippedTriangle.draw())
// ***
// **
// *
```

用同样的代码实现将几何图形垂直拼接起来。

```swift
struct JoinedShape<T: Shape, U: Shape>: Shape {
    var top: T
    var bottom: U
    func draw() -> String {
        return top.draw() + "\n" + bottom.draw()
    }
}
let joinedTriangles = JoinedShape(top: smallTriangle, bottom: flippedTriangle)
print(joinedTriangles.draw())
// *
// **
// ***
// ***
// **
// *
```

暴露构造所用的具体类型会造成类型信息的泄露，因为 ASCII 几何图形模块的部分公开接口必须声明完整的返回类型，而实际上这些类型信息并不应该被公开声明。输出同一种几何图形，模块内部可能有多种实现方式，而外部使用时应该与内部各种变换顺序的实现逻辑无关。诸如 `JoinedShape` 和 `FlippedShape` 这样包装后的类型，模块使用者并不关心，它们也不应该可见。模块的公开接口应该由拼接、翻转等基础操作组成，这些操作也应该返回独立的 `Shape` 类型的值。

### 返回不透明类型

你可以认为不透明类型和泛型相反。泛型允许调用一个方法时，为该方法的形参和返回值指定一个与实现无关的类型。而在返回不透明类型的函数中，不透明类型允许函数实现时，选择一个与调用代码无关的返回类型。比如下面的例子返回了一个梯形，却没有直接输出梯形的底层类型：

```swift
struct Square: Shape {
    var size: Int
    func draw() -> String {
        let line = String(repeating: "*", count: size)
        let result = Array<String>(repeating: line, count: size)
        return result.joined(separator: "\n")
    }
}

func makeTrapezoid() -> some Shape {
    let top = Triangle(size: 2)
    let middle = Square(size: 2)
    let bottom = FlippedShape(shape: top)
    let trapezoid = JoinedShape(top: top, bottom: JoinedShape(top: middle, bottom: bottom))
    return trapezoid
}

let trapezoid = makeTrapezoid()
print(trapezoid.draw())
// *
// **
// **
// **
// **
// *
```

上面的例子中，`makeTrapezoid()` 函数将返回值类型定义为 `some Shape` ，因此该函数返回遵循 `Shape` 协议的给定类型，而不需要指定任何具体类型。这样写 `makeTrapezoid()` 函数可以表明它公共借口的基本性质，即返回的是一个几何图形，而不是部分的公共接口生成的特殊类型。

这个例子凸显了不透明类型和泛型的相反之处。`makeTrapezoid()` 中，代码可以返回任意它需要的类型，只要这个类型遵循 `Shape` 协议，就像调用泛型函数时可以使用任何需要的类型一样。这个函数的调用代码需要采用通用的方式，就像泛型函数的实现代码一样，这样才能让返回的任意 `Shape` 类型的值都能被正常使用。
