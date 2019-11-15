---
series: Swift 基础
title: 枚举、类与结构体
enable html: true
categories: Swift
tags:
  - enumeration
  - class
  - structure
date: 2019-11-04 15:21:00
---

和其他语言类似，Swift 也提供了对属性和操作的封装类型，即类、结构体和枚举类型。但是 Swift 对这三种类型的设计和其他语言不完全相同，在 Swift 中，结构体和枚举是值类型，这意味着这两种类型在赋值或者参数传递时往往以拷贝的方式传值。与此相对，Swift 中的类和其他语言类似--是引用类型，这使得类在赋值和参数传递时总是引用已经存在的实例。对这一点的理解很重要，因为这直接影响到编程时设计数据结构的类型选择。事实上，Swift 的最佳实践总是推荐在大部分时候使用结构体进行功能和属性封装，只有在需要引用特性的时候才选用类。

<!-- more -->

## 枚举

### 枚举成员的遍历

在一些情况下，你会需要得到一个包含所有枚举成员的集合。令枚举遵循 `CaseIterable` 协议，Swift 会生成一个 `allCases` 属性，用于表示一个包含所有枚举成员的集合。

```swift
enum Beverage: CaseIterable {
    case coffee
    case tea
    case juice
}
let numberOfChoices = Beverage.allCases.count
print("\(numberOfChoices) beverages available.")
for beverage in Beverage.allCases {
    print(beverage)
}
```

### 关联值 (Associated Values)

有时候把其他类型的值和枚举成员值一起存储起来会很有用。这额外的信息被称为关联值。你每次在代码中使用该枚举成员时，还可以修改这个关联值。每个枚举成员的关联值类型可以各不相同。

```swift
enum BarCode {
    case upc(Int, Int, Int, Int)
    case qrCode(String)
}
var productBarCode = BarCode.upc(8, 85909, 51226, 3)
productBarCode = .qrCode("ABCDEFGHIJKLMNOP")

switch productBarCode {
case .upc(let numberSystem, let manufacturer, let product, let check):
    print("UPC: \(numberSystem), \(manufacturer), \(product), \(check).")
case .qrCode(let productCode):
    print("QR Code: \(productCode).")
}
```

### 原始值 (Raw Values)

作为关联值的替代，枚举成员可以被默认值，即原始值预填充，这些原始值的类型必须相同。

```swift
enum ASCIIControlCharacter: Character {
    case tab = "\t"
    case lineFeed = "\n"
    case carriageReturn = "\r"
}
```

每个原始值在枚举声明中必须是唯一的。对于一个特定的枚举成员，它的原始值始终不变。

#### 原始值的隐式赋值 (Implicitly Assigned Raw Values)

在使用原始值为整数或者字符串类型的枚举时，不需要显式地为每个枚举成员设置原始值，Swift 将会自动为你赋值。例如当使用整数作为原始值时，隐式赋值的值依次递增 1。当使用字符串作为枚举类型的原始值时，每个枚举成员的隐式原始值为该枚举成员的名称。

```swift
enum CompassPoint: String {
    case north
    case south
    case east
    case west
}
let sunsetDirection = CompassPoint.west.rawValue
```

#### 使用原始值初始化枚举实例

如果在定义枚举类型时使用了原始值，枚举会自动生成一个初始化方法。该方法接受一个名为 `rawValue` 的参数，其类型为原始值类型，返回值则是枚举成员或 `nil`。可以使用该初始化器创建新的枚举实例。

```swift
enum Planet: Int {
    case mercury = 1
    case venus
    case earch
    case mars
    case jupiter
    case saturn
    case uranus
    case neptune
}
let possiblePlanet = Planet(rawValue: 7)
```

上述示例用原始值7创建了枚举成员 `uranus`。然而，并非所有 `Int` 值都可以找到一个匹配的行星。因此，原始值初始化器总是返回一个可选的枚举成员。`possiblePlanet` 是 `Planet?` 类型，即可选的 `Planet`。如果你试图寻找一个位置为 11 的行星，通过原始值初始化器返回的值将是 `nil`。

```swift
let positionToFind = 11
if let somePlanet = Planet(rawValue: positionToFind) {
    switch somePlanet {
    case .earch:
        print("Mostly harmless")
    default:
        print("Not a safe place for humans")
    }
} else {
    print("There is no planet at position \(positionToFind)")
}
```

### 递归枚举(Recursive Enumerations)

递归枚举是一种枚举类型，它有一个或多个枚举成员使用该枚举类型的实例作为关联值。使用递归枚举时，编译器会插入一个间接层。你可以在枚举成员前面加上 `indirect` 来表示该成员可递归。

```swift
enum ArithmeticExpression {
    case number(Int)
    indirect case addition(ArithmeticExpression, ArithmeticExpression)
    indirect case multiplication(ArithmeticExpression, ArithmeticExpression)
}

let five = ArithmeticExpression.number(5)
let four = ArithmeticExpression.number(4)
let sum = ArithmeticExpression.addition(five, four)
let product = ArithmeticExpression.multiplication(sum, ArithmeticExpression.number(2))
```

要操作具有递归性质的数据结构，使用递归函数是一种直截了当的方式。

```swift
func evaluate(_ expression: ArithmeticExpression) -> Int {
    switch expression {
    case let .number(value):
        return value
    case let .addition(left, right):
        return evaluate(left) + evaluate(right)
    case let .multiplication(left, right):
        return evaluate(left) * evaluate(right)
    }
}
print(evaluate(product))
```

## 类和结构体

### 结构体和类的对比

Swift 中的结构体 (Structure) 和类 (Class) 有很多共同点。两者都可以：

- 定义属性 (Property) 用于存储值；
- 定义方法 (Method) 用于提供功能；
- 定义下标 (Subscript) 用于通过下标语法访问它们的值；
- 定义初始化器 (Initializer) 用于设置初始值；
- 通过扩展 (Extension) 增加默认实现之外的功能；
- 通过协议 (Protocol) 提供某种标准功能。

与结构体相比，类还有以下附加功能：

- 继承 (Inheritance)：允许类继承另一个类的功能；
- 类型转换 (Casting)：允许在运行时检查和解释另一个类实例的类型；
- 解初始化器 (Deinitializer)：允许一个类实例释放任何为其分配的资源；
- 引用计数 (Reference Counting)：允许对一个类的多次引用。

类所支持的附加功能是以增加复杂性为代价的。作为一般准则，优先使用结构体，因为结构体更容易理解。仅在适当或必要时才使用类。

#### 结构体的逐一初始化器 (Memberwise Initializers)

所有的结构体都有一个自动生成的逐一初始化器，用于初始化新结构体实例中成员的属性。新实例中各个属性的初始值可以通过属性的名称传递到逐一初始化器中。注意，只有结构体有逐一初始化器，类没有默认的逐一初始化器。

```swift
struct Resolution {
    var width = 0
    var height = 0
}
let vga = Resolution(width: 640, height: 480)
```

### 结构体和枚举是值类型

值类型的特点是，当它被赋值给一个变量、常量或被传递给一个函数时，它的值会被拷贝。Swift 中的所有结构体和枚举都是值类型。这意味着它们的实例以及实例中包含的任何值类型属性，在代码中传递时都会被复制。事实上，Swift 中的所有基本类型都是值类型，在底层使用结构体实现。

```swift
let hd = Resolution(width: 1920, height: 1080)
var cinema = hd

cinema.width = 2048

print("cinema is now \(cinema.width) pixels wide")
// 打印 cinema is now 2048 pixels wide
print("hd is still \(hd.width) pixels wide")
// 打印 hd is still 1920 pixels wide
```

### 类是引用类型

和值类型不同，引用类型在被赋值给一个变量、常量或被传递到一个函数时，其值不会被拷贝。它使用的是已存在的实例的引用，而不是其拷贝。

```swift
class VideoMode {
    var resolution = Resolution()
    var interlaced = false
    var frameRate = 0.0
    var name: String?
}

let tenEighty = VideoMode()
tenEighty.resolution = hd 
tenEighty.interlaced = true
tenEighty.frameRate = 25.0
tenEighty.name = "1080i"

let alsoTenEighty = tenEighty
alsoTenEighty.frameRate = 30.0

print("The frameRate property pf tenEighty is now \(tenEighty.frameRate).")
// 打印 The frameRate property of theEighty is now 30.0.
```

#### 恒等运算符 (Identity Operators)

因为类是引用类型，所以多个常量和变量可能在幕后同时引用同一个类实例。判断两个常量或变量是否引用自同一个类实例有时很有用。为了达到这个目的，Swift 提供了两个恒等运算符：

- 恒等 `===`
- 非恒等 `!==`

恒等表示两个常量或变量引用自同一个类实例。

```swift
if tenEighty === alsoTenEighty {
    print("tenEighty and alsoTenEighty refer to the same VideoMode instance.")
}
// 打印 tenEighty and alsoTenEighty refer to the same VideoMode instance.
```
