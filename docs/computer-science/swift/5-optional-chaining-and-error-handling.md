---
series: Swift 基础
title: 可选链与错误处理
enable html: true
categories: Swift
tags:
  - optional chaining
  - error handling
date: 2019-11-08 11:00:50
---

本篇中我们关注可选链式调用和 Swift 中的错误处理。可选值类型和其链式调用是 Swift 语言中为了防止运行时出现空指针异常的特殊设计。Swift 的可选值设计借鉴了 Haskell 和 Scala 的先进经验，其主要的设计思路是通过严格的编译期语法检查暴露出程序中可能出现的 NPE 问题，以防止 NPE 在运行时出现而影响整个项目的良好运行。我们可以发现其他的现代语言也纷纷借鉴了这一设计，除了 Swift 外，Java 和 Kotlin 中也引入了类似的可选类型。和这些语言相比，Swift 的可选类型设计更进一步，以可选链的方式进一步增强了代码的表现能力，显著提升了代码的可读性和可维护性，并且极大缩减了解包所带来的冗余模版代码。

<!-- more -->

## 可选链 (Optional Chaining)

可选链式调用是一种在当前值可能为nil的可选值上请求和调用属性、方法或下标的方法。如果可选值有值，那么调用就会成功；如果可选值是 `nil`，那么调用将返回 `nil`。多个调用可以连接在一起形成一个调用链，如果其中任何一个节点为 `nil`，整个调用链都会失败，即返回 `nil`。

### 使用可选链式调用代替强制展开

通过在想调用的属性、方法或下标的可选值后面放一个问号 `?`，可以定义一个可选链。这一点很像在可选值后放一个叹号 `!` 来强制展开。它们的主要区别在于当可选值为空时可选链式调用只会调用失败，然而强制展开将会出发运行时错误。

```swift
class Person {
    var residence: Residence?
}
class Residence {
    var numberOfRooms = 1
}

let john = Person()
```

上面的代码中，`john` 有一个值为 `nil` 的 `residence` 属性。如果使用强制展开获得这个 `john` 的 `residence` 属性中的 `numberOfRooms` 值，会触发运行时错误，因为这时 `residence` 没有可以展开的值：

```swift
let roomCount = john.residence!.numberOfRooms
// 会触发运行时错误
```

可选链式调用提供了另一种访问 `numberOfRooms` 的方式，使用问号代替叹号：

```swift
if let roomCount = john.residence?.numberOfRooms {
    print("John's residence has \(roomCount) room(s).")
} else {
    print("Unable to retrieve the number of rooms.")
}
// 打印 Unable to retrieve the number of rooms.
```

### 为可选链式调用定义模型类

通过使用可选链式调用可以调用多层属性、方法和下标，这样可以在复杂的模型中向下访问各种子属性，并且判断能否访问子属性的属性、方法和下标。

下面这段代码定义了四个模型类，这些例子包括多层可选链式调用。为了方便说明，在 `Person` 和 `Residence` 的基础上增加了 `Room` 类和 `Address` 类，以及相关的属性、方法以及下标。

```swift
class Person {
    var residence: Residence?
}

class Residence {
    var rooms = [Room]()
    var numberOfRooms: Int {
        return rooms.count
    }
    subscript(i: Int) -> Room {
        get {
            return rooms[i]
        }
        set {
            rooms[i] = newValue
        }
    }
    func printNumberOfRooms() {
        print("The number of rooms is \(numberOfRooms)")
    }
    var address: Address?
}

class Room {
    let name: String
    init(name: String) {
        self.name = name
    }
}

class Address {
    var buildingName: String?
    var buildingNumber: String?
    var street: String?
    func buildingIdentifier() -> String? {
        if buildingName != nil {
            return buildingName
        } else if let buildingNumber = buildingNumber, let street = street {
            return "\(buildingNumber) \(street)"
        } else {
            return nil
        }
    }
}
```

### 通过可选链式调用访问属性

如前所述，可以通过可选链式调用在一个可选值上访问其属性，并判断访问是否成功。

```swift
let john = Person()
if let rootCount = john.residence?.numberOfRooms {
    print("John's residence has \(rootCount) rooms(s).")
} else {
    print("Unable to retrieve the number of rooms.")
}
// 打印 Unable to retrieve the number of rooms.
```

因为 `john.residence` 为 `nil`，所以这个可选链式调用依旧会像先前一样失败。

还可以通过可选链式调用来设置属性值：

```swift
let someAddress = Address()
someAddress.buildingNumber = "29"
someAddress.street = "Acacia Road"
john.residence?.address = someAddress
```

在这个例子中，通过 `john.residence` 来设定 `address` 属性也会失败，因为 `john.residence` 当前为 `nil` 。当可选链式调用失败时，等号右侧的代码不会被执行。对于上面的代码来说很难验证这一点，因为这样赋值一个常量没有任何副作用。

下面的代码完成了同样的事情，但是它使用了一个函数来创建了 `Address` 实例，然后将该实例返回用于赋值。

```swift
func createAddress() -> Address {
    print("Function was called.")
    
    let someAddress = Address()
    someAddress.buildingNumber = "29"
    someAddress.street = "Acacia Road"
    
    return someAddress
}
john.residence?.address = createAddress()
```

没有打印出任何消息，说明 `createAddress()` 没有被执行。

### 通过可选链式调用来调用方法

可以通过可选链式调用来调用方法，并判断调用是否成功，即使方法没有返回值。

`Residence` 类中的 `printNumberOfRooms()` 方法打印当前的 `numberOfRooms` 值，但该方法没有返回值。然而，没有返回值的方法具有隐形的返回类型 `Void`，这意味着没有返回值的方法也会返回 `()`，或者一个空的元组。

如果在可选值上通过可选链式调用来调用该方法，该方法的返回类型会是 `Void?`，而不是 `Void`，因为通过可选链式调用得到的返回值都是可选的。这样我们就可以通过if语句来判断能够成功调用 `printOfRooms()` 方法，即使方法本身没有定义返回值。通过判断返回值是否为 `nil` 可以判断调用是否成功：

```swift
if john.residence?.printNumberOfRooms() != nil {
    print("It was possible to print the number of rooms.")
} else {
    print("It was not possible to print the number of rooms.")
}
// 打印 It was not possible to print the number of rooms.
```

同样的，可以据此判断通过可选链式调用为属性赋值是否成功。在上面的例子中，我们曾尝试给 `john.residence` 的 `address` 属性赋值，即使 `residence` 为 `nil` 。通过可选链式调用给属性赋值会返回 `Void?`，通过判断返回值是否是 `nil` 就可以知道赋值是否成功：

```swift
if (john.residence?.address = someAddress) != nil {
    print("It was possible to set the address.")
} else {
    print("It was not possible to set the address.")
}
// 打印 It was not possible to set the address.
```

### 通过可选链式调用访问下标

通过可选链式调用，我们可以在一个可选值上访问下标，并且判断下标调用是否成功。通过可选链式调用访问可选值的下标时，应该将问号放在下标方括号之前而不是之后。可选链式调用的问号一般直接跟在可选表达式的后面。

```swift
if let firstRoomName = john.residence?[0].name {
    print("The first room name is \(firstRoomName).")
} else {
    print("Unable to retrieve the first room name.")
}
// 打印 Unable to retrieve the first room name.
```

## 错误处理 (Error Handling)

### 表示错误

在 Swift 中，错误用遵循 `Error` 协议的类型的值来表示。`Error` 协议表明该类型可以用于错误处理。Swift 的枚举尤为适合构建一组相关的错误状态，枚举的关联值还可以提供错误状态等额外信息。例如，在游戏中操作自动贩卖机时，你可以这样表示可能会出现的错误状态：

```swift
enum VendingMachineError: Error {
    case invalidSelection
    case insufficientFunds(coinNeeded: Int)
    case outOfStock
}
```

### 错误处理

Swift 中有 4 种处理错误的方式：

- 将函数抛出的错误传递给调用此函数的代码；
- 用 do-catch 语句处理错误；
- 将错误作为可选类型处理；
- 断言此错误根本不会发生。


### 用 throwing 函数传递错误

为了表示一个函数、方法或初始化器可能抛出错误，在函数声明参数表后加上 `throws` 关键字。一个标有 `throws` 关键字的函数被称为 `throwing` 函数。只有 `throwing` 函数能够传递错误。任何在某个非 `throwing` 函数内部抛出的错误只能在函数内部处理。

```swift
struct Item {
    var price: Int
    var count: Int
}

class VendingMachine {
    var inventory = [
        "Candy Bar": Item(price: 12, count: 7),
        "Chips": Item(price: 10, count: 4),
        "Pretzels": Item(price: 7, count: 11)
    ]
    var coinsDeposited = 0
    
    func vend(itemNamed name: String) throws {
        guard let item = inventory[name] else {
            throw VendingMachineError.invalidSelection
        }
        guard item.count > 0 else {
            throw VendingMachineError.outOfStock
        }
        guard item.price <= coinsDeposited else {
            throw VendingMachineError.insufficientFunds(coinNeeded: item.price - coinsDeposited)
        }
        coinsDeposited -= item.price
        
        var newItem = item
        newItem.count -= 1
        inventory[name] = newItem
        print("Dispensing \(name)")
    }
}
```

`vend(itemNamed:)` 方法中，如果请求的物品不存在、缺货或者投入金额小于物品价格，该方法就会抛出一个相应的 `VendingMachineError`。在 `vend(itemNamed:)` 方法的实现中使用了 `guard` 语句来确保任意条件不满足时，能提前退出方法并抛出相应错误。由于 `throw` 语句会立即退出方法，所以物品只有在所有条件都满足时才会被售出。

在代码调用此方法的地方，必须直接处理这些错误，或者继续将这些错误传递上去。

```swift
let favoriteSnacks = [
    "Alice": "Chips",
    "Bob": "Licorice",
    "Eve": "Pretzels"
]
func buyFavoriteSnack(person: String, vendingMachine: VendingMachine) throws {
    let snackName = favoriteSnacks[person] ?? "Candy Bar"
    try vendingMachine.vend(itemNamed: snackName)
}
```

### 用 do-catch 处理错误

你可以用一个 do-catch 语句运行一段闭包来处理错误。如果在 `do` 子句中的代码抛出了一个错误，这个错误会与 `catch` 子句做匹配，从而决定哪条子句能处理它。如果一条 `catch` 子句没有指定匹配模式，那么该条子句可以匹配任何错误，并把错误绑定到一个名为 `error` 的局部变量上。

```swift
var vendingMachine = VendingMachine()
vendingMachine.coinsDeposited = 8

do {
    try buyFavoriteSnack(person: "Alice", vendingMachine: vendingMachine)
    print("Success! Yum.")
} catch VendingMachineError.invalidSelection {
    print("Invalid Selection.")
} catch VendingMachineError.outOfStock {
    print("Out of stock.")
} catch VendingMachineError.insufficientFunds(let coinsNeeded) {
    print("Insufficient funds. Please insert an additional \(coinsNeeded) coins.")
} catch {
    print("Unexpected error: \(error)")
}
// 打印 Insufficient funds. Please insert an additional 2 coins.
```

### 将错误转换成可选值

可以使用 `try?` 通过将错误转换成一个可选值来处理错误。如果是在计算 `try?` 表达式时抛出错误，该表达式的结果就是 `nil`。如果你想对所有的错误都使用相同的方式处理，用 `try?` 就可以让你写出简洁的错误处理代码。

```swift
func fetchData() -> Data? {
    if let data = try? fetchDataFromDisk() { return data }
    if let data = try? fetchDataFromServer() { return data }
    return nil
}
```

### 禁用错误传递

有时你知道某个 `throwing` 函数其实在运行时不会抛出错误。在这种情况下，你可以在表达式前写 `try!` 来禁用错误传递，这会把调用包装在一个不会有错误抛出的运行时断言中。如果真的抛出了错误，你会得到一个运行时错误。

```swift
let photo = try! loadImage(atPath: "./Resources/John Appleseed.jpg")
```

### 指定清理操作

你可以使用 `defer` 语句在即将离开当前代码块时执行一系列语句。该语句能让你执行一些必要的清理工作，不管是以何种方式离开当前代码块的，无论是由于抛出错误而离开，还是由于 `return` 或 `break` 语句。因此，你可以使用 `defer` 语句来确保文件描述符得以关闭，以及手动分配的内存得以释放。

`defer` 延迟执行的语句不能包涵任何控制转移语句，例如 `break`、`return` 语句，或者抛出一个错误。延迟执行的操作会按照它们声明的顺序从后往前执行，即第一条 `defer` 语句中的代码最后才执行，第二条 `defer` 语句中的代码倒数第二个执行，以此类推。

```swift
func processFile(filename: String) throws {
    if exists(filename) {
        let file = open(filename)
        defer {
            close(file)
        }
        while let line = try file.readline() {
            // 处理文件
        }
        // close(file) 会在这里被调用，即作用域的最后
    }
}
```
