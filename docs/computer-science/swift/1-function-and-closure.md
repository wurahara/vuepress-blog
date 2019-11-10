---
series: Swift 基础
title: 函数与闭包
enable html: true
categories: Swift
tags:
  - function
  - closure
date: 2018-11-03 10:39:52
---

Swift 是由 Apple Inc. 开发的一种现代编程语言，它的性能非常优秀，并且支持面向对象编程和函数式编程等多种编程范式。接下来的几篇文章是我学习 Swift 官方文档的学习笔记，其中重点摘录了 Swift 语言和其他语言差异较大的特性部分。

今天的第一篇关注的内容是函数和闭包。Swift 中的函数和其他常用语言中的函数语法和功能相似，但是 Swift 作为一个原生支持函数式编程的语言，提供了将函数作为第一等类型的语法元素，即闭包。闭包赋予了 Swift 语言更大的灵活度，为一些常见需求提供了更高效的实现方式。

<!-- more -->

## 函数

### 函数参数标签和参数名称

每个函数参数都有一个参数标签 (argument label) 以及一个参数名称 (parameter name)。参数标签在调用函数的时候使用；调用的时候需要将函数的参数标签写在对应的参数前面。参数名称在函数的实现中使用。默认情况下，函数参数使用参数名称来作为它们的参数标签。

```swift
func greet(person: String, from hometown: String) -> String {
    return "Hello \(person)! Glad you could visit from \(hometown)."
}
print(greet(person: "Bill", from: "Cupertino"))
// 打印 Hello Bill! Glad you could visit from Cupertino.
```

### 可变参数 (Variadic Parameter)

一个可变参数可以接受 0 个或多个值。函数调用时，你可以用可变参数来指定函数参数可以被传入不确定数量的输入值。通过在变量类型名后面加入 `...` 的方式来定义可变参数。

```swift
func arithmeticMean(_ numbers: Double...) -> Double {
    var total: Double = 0
    for number in numbers {
        total += number
    }
    return total / Double(numbers.count)
}
arithmeticMean(1, 2, 3, 4, 5)
arithmeticMean(3, 8.25, 18.75)
```

可变参数的传入值在函数体中变为此类型的一个数组。一个函数最多只能拥有一个可变参数。

### 输入输出参数 (In-Out Parameters)

函数参数默认是常量。试图在函数体中更改参数值将会导致编译错误。这意味着你不能错误地更改参数值。如果你想要一个函数可以修改参数的值，并且想要在这些修改在函数调用结束后仍然存在，那么就应该把这个参数定义为输入输出参数。

你只能传递变量给输入输出参数。你不能传入常量或字面量，因为这些量是不能被修改的。当传入的参数作为输入输出参数时，需要在参数名前加 `&` 符，表示这个值可以被函数修改。输入输出参数不能有默认值，且可变参数不能用 `inout` 标记。

```swift
func swapTwoInts(_ a: inout Int, _ b: inout Int) {
    let temp = a
    a = b
    b = temp
}

var someInt = 3
var anotherInt = 107
swapTwoInts(&someInt, &anotherInt)
print("someInt is now \(someInt), and anotherInt is now \(anotherInt).")
// 打印 someInt is now 107, and anotherInt is now 3.
```

## 闭包 (Closure)

闭包是自包含的函数代码块，可以在代码中被传递和使用。闭包可以捕获和存储其所在上下文中任意常量和变量的引用。被称为包裹（closing over）常量和变量。Swift 会为你管理在捕获过程中涉及到的所有内存操作。

### 以排序为例

Swift 标准库提供了名为 `sorted(by:)` 的方法，它会基于你提供的排序闭包表达式的判断结果对数组中的值（类型确定）进行排序。一旦它完成排序过程，`sorted(by:)` 方法会返回一个与旧数组类型大小相同类型的新数组，该数组的元素有着正确的排序顺序。原数组不会被 `sorted(by:)` 方法修改。

下面的闭包表达式示例使用 `sorted(by:)` 方法对一个 `String` 类型的数组进行字母逆序排序。以下是初始数组：

```swift
let names = ["Chirs", "Alex", "Ewa", "Barry", "Daniella"]
```

`sorted(by:)` 方法接受一个闭包，该闭包需要传入与数组元素类型相同的两个值，并返回一个布尔值来表明当排序结束后传入的第一个参数排在第二个参数前面还是后面。如果第一个参数值出现在第二个参数值前面，排序闭包返回 `true` ，反之返回 `false`。

提供排序闭包的一种方式是提供一个符合其类型要求的普通函数，并将其作为 `sorted(by:)` 方法的参数传入：

```swift
func backward(_ s1: String, _ s2: String) -> Bool {
    return s1 > s2
}
var reversedNames = names.sorted(by: backward)
```
#### 闭包表达式 (Closure Expression) 语法

下面的例子展示了之前 `backward(_:_:)` 函数对应的闭包表达式版本的代码：

```swift
reversedNames = names.sorted(by: { (s1: String, s2: String) -> Bool in
    return s1 > s2
})
```

在内联闭包表达式中，函数和返回类型都写在大括号内，而不是大括号外。闭包的函数体部分由关键字 `in` 引入，该关键字表示闭包的参数和返回值类型定义已经完成，闭包函数体即将开始。

由于上面的闭包函数体部分很短，可以将其改写成一行代码：

```swift
reversedNames = names.sorted(by: { (s1: String, s2: String) -> Bool in return s1 > s2})
```
#### 根据上下文推断类型

因为排序闭包函数是作为 `sorted(by:)` 方法的参数传入的，Swift 可以推断其参数和返回类型。`sorted(by:)` 方法被一个字符串数组调用，因此其参数必须是 `(String, String) -> Bool` 类型的函数。

```swift
reversedNames = names.sorted(by: {s1, s2 in return s1 > s2})
```
#### 单表达式闭包的隐式返回

单行表达式闭包可以省略 `return` 关键字来隐式返回单行表达式的结果。

```swift
reversedNames = names.sorted(by: {s1, s2 in s1 > s2})
```
#### 参数名称缩写

Swift 自动为内联闭包提供了参数名称缩写的功能，你可以直接通过 `$0`, `$1`, `$2` 来顺序调用闭包的参数，以此类推。

如果你在闭包表达式中使用参数缩写，你甚至可以在闭包定义中省略参数表，并且对应参数名称缩写的类型会通过函数类型进行推断。`in` 关键字也同样可以被省略，因此此时闭包表达式完全由闭包函数体构成：

```swift
reversedNames = names.sorted(by: {$0 > $1})
```
#### 运算符方法

实际上还有更简短的方式来编写上面的闭包表达式。Swift 的 `String` 类型定义了关于大于号 `>` 的字符串实现，其作为参数接受两个 `String` 类型的参数并返回 `Bool` 值。而这正好与 `sorted(by:)` 方法的参数需要的函数的类型相同。因此你可以简单地传递一个大于号，Swift 可以自动推断找到系统自带的那个字符串函数的实现：

```swift
reversedNames = names.sorted(by: >)
```

### 尾随闭包 (Trailing Closure)

如果你需要将一个很长的闭包表达式作为最后一个参数传递给函数，将这个闭包替换成尾随闭包的形式很有用。尾随闭包是一个写在函数圆括号之后的闭包表达式，函数支持将其作为最后一个参数调用。在使用尾随闭包时，你不需要写出它的函数标签。

上面的字符串排序闭包也可以作为尾随闭包的形式改写在 `sorted(by:)` 方法的圆括号外面：

```swift
reversedNames = names.sorted() { $0 > $1 }
```

如果闭包表达式是函数的唯一参数，你甚至可以把 `()` 省略掉：

```swift
reversedNames = names.sorted{ $0 > $1 }
```

### 值捕获

闭包可以在其被定义的上下文中捕获常量或变量。即使定义这些常量和变量的原作用域已经不存在，闭包仍然可以在闭包函数体内引用和修改这些值。

```swift
func makeIncrementer(forIncrement amount: Int) -> () -> Int {
    var runningTotal = 0
    func incrementer() -> Int {
        runningTotal += amount
        return runningTotal
    }
    return incrementer
}
```

`incrementer()` 函数并没有任何参数，但是在函数体内访问了 `runningTotal` 和 `amount` 变量。这是因为它从外围函数捕获了 `runningTotal` 和 `amount` 变量的引用。捕获引用保证了 `runningTotal` 和 `amount` 变量在调用完 `makeIncrementer()` 后不会消失，并且保证了下一次执行 `incrementer()` 函数时，`runningTotal` 依旧存在。为了优化，如果一个值不会被闭包改变，或者在闭包创建后不会改变，Swift 可能会改为捕获并保存一份对值的拷贝。

下面是一个使用 `makeIncrementer()` 的例子：

```swift
let incrementByTen = makeIncrementer(forIncrement: 10)

incrementByTen()        // 返回的值为 10
incrementByTen()        // 返回的值为 20
incrementByTen()        // 返回的值为 30
```

如果你创建了另一个 `incrementer()`，它会有属于自己的引用，指向一个全新的、独立的 `runningTotal` 变量：

```swift
let incrementBySeven = makeIncrementer(forIncrement: 7)
incrementBySeven()      // 返回的值为 7
```

再次调用原来的 `incrementbyTen` 会继续增加它自己的 `runningTotal` 变量，该变量和` incrementBySeven` 中捕获的变量没有任何关系。

```swift
incrementByTen()        // 返回的值为 40
```

### 逃逸闭包 (Escaping Closures)

当一个闭包作为参数传到一个函数中，但是这个闭包在函数返回之后才会被执行，我们称该闭包从函数中逃逸。当你定义接受闭包作为函数的参数时，你可以在参数名之前标注 `@escaping`，用来指明这个闭包允许逃逸出该函数。

一种能使闭包逃逸出函数的方法是，将这个闭包保存在一个函数外部定义的变量中。比如，很多启动异步操作的函数接受一个闭包参数作为 completion handler。这类函数会在异步操作开始后立刻返回，但是闭包直到异步操作结束后才会被调用。在这种情况下，闭包需要逃逸出函数，因为闭包需要在函数中返回之后被调用。例如：

```swift
var completionHandlers: [() -> Void] = []
func someFunctionWithEscapingClosure(completionHandler: @escaping () -> Void) {
    completionHandlers.append(completionHandler)
}
```

`someFunctionWithEscapingClosure(_:)` 函数接受一个闭包作为参数，该闭包被添加到一个函数外定义的数组中。如果不将该参数标记为 `@escaping`，就会产生一个编译时错误。

将一个闭包标记为 `@escaping` 意味着你必须在闭包中显式地引用 `self` 。

```swift
func someFunctionWithNonescapingClosure(closure: () -> Void) {
    closure()
}
class SomeClass {
    var x = 10
    func doSomething() {
        someFunctionWithEscapingClosure { self.x = 100 }
        someFunctionWithNonescapingClosure { x = 200 }
    }
}
let instance = SomeClass()
instance.doSomething()
print(instance.x)
// 打印出 200

completionHandlers.first?()
print(instance.x)
// 打印出 100
```