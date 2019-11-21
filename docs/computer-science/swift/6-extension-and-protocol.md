---
series: Swift 基础
title: 扩展与协议
enable html: true
categories: Swift
tags:
  - extension
  - protocol
date: 2019-11-09 14:09:32
---

本篇中我们将介绍 Swift 的扩展和协议。扩展功能是 Swift 语言特有的语言特性，能够给程序员提供逆向建模的能力。通过扩展功能，程序员能够为已有的一等类型提供新的属性、下标和方法。协议类似于 Java 和 Go 中的接口，是对功能的声明而非实现。程序员实现协议的要求，能够为代码提供风格统一的功能接口。

<!-- more -->

## 扩展 (Extension)

扩展可以给一个现有的类、结构体、枚举或协议添加新的功能。扩展不需要访问被扩展类型源代码就能完成功能延拓，这种能力被称为逆向建模 (Retroactive Modeling)。Swift 中的扩展可以：

- 为实例或类添加计算属性；
- 为实例或类定义方法；
- 提供新的构造器；
- 定义下标；
- 定义和使用新的嵌套类型；
- 使已经存在的类型遵循一个协议。

### 计算属性

扩展可以添加新的计算属性，但不能添加存储属性或向现有属性添加属性观察器。

```swift
extension Double {
    var km: Double { return self * 1_000.0 }
    var m: Double { return self }
    var cm: Double { return self / 100.0 }
    var mm: Double { return self / 1_000.0 }
    var ft: Double { return self / 3.28084 }
}
let oneInch = 25.4.mm
print("One inch is \(oneInch) meters")
// 打印 One inch is 0.0254 meters
let threeFeet = 3.ft
print("Three feet is \(threeFeet) meters")
// 打印 Three feet is 0.914399970739201 meters
```

### 初始化器

扩展可以给现有的类型添加新的初始化器。扩展可以给一个类提供新的便利初始化器，但不能添加新的指定初始化器或解初始化器。指定初始化器和解初始化器必须由类的原始实现提供。

## 协议 (Protocol)

协议定义了一个蓝图，规定了用来实现某一特定任务或功能的方法、属性以及其他需求。类、结构体和枚举都可以遵循 (conform) 协议，并为协议定义的需求提供具体实现。除了遵循协议的类型必须实现的需求之外，程序员还可以对协议进行扩展，通过扩展来实现一部分要求或者实现一些附加功能，这样遵循相同协议的类型就能够使用这些功能。

### 协议语法

若是一个类拥有父类的同时还遵循若干协议，要把父类名放在协议名之前，并以逗号分隔。

### 属性要求

协议可以要求遵循协议的类型提供特定名称和类型的实例属性或类型属性。协议不指定属性是存储属性还是计算属性，只指定属性的名称和类型。此外，协议可以指定属性是只读的还是可读可写的。如果协议要求属性是可读可写的，则该属性不能是常量属性或只读的计算属性。如果协议只要求属性可读，则该属性不仅可以是可读的，也可以另外实现可写。

```swift
protocol SomeProtocol {
    var mustBeSettable: Int { get set }
    var doesNotNeedToBeSettable: Int { get }
}
```

如下所示，这是一个只含有一个属性要求的协议：

```swift
protocol FullyNamed {
    var fullName: String { get }
}
```

`FullyNamed` 除了要求遵循协议的类型必须提供 `fullName` 属性之外没有其他要求。下面是一个遵循 `FullyNamed` 协议的结构体：

```swift
struct Person: FullyNamed {
    var fullName: String
}
let john = Person(fullName: "John Appleseed")
// john.fullName 为 John Appleseed
```

下面是一个更为复杂的遵循 `FullyNamed` 协议的类 `Starship`，该类将 `fullName` 作为只读计算属性实现。

```swift
class Starship: FullyNamed {
    var prefix: String?
    var name: String
    init(name: String, prefix: String? = nil) {
        self.name = name
        self.prefix = prefix
    }
    var fullName: String {
        return (prefix != nil ? prefix! + " " : "") + name
    }
}
var ncc1701 = Starship(name: "Enterprise", prefix: "USS")
print(ncc1701.fullName)
// 打印 USS Enterprise
```

### 方法要求

协议中声明的方法不需要方法实现，不支持为协议中声明的方法提供默认参数。下面的例子定义了一个只含有一个方法的协议：

```swift
protocol RandomNumberGenerator {
    func random() -> Double
}
```

下面是一个遵循 `RandomNumberGenerator` 的类，该类实现了一个叫做线性同余生成器 (Linear Congruential Generator) 的伪随机算法：

```swift
class LinearCongruentialGenerator: RandomNumberGenerator {
    var lastRandom = 42.0
    let m = 139968.0
    let a = 3877.0
    let c = 29573.0
    func random() -> Double {
        lastRandom = ((lastRandom * a + c).truncatingRemainder(dividingBy: m))
        return lastRandom / m
    }
}
let generator = LinearCongruentialGenerator()
print("Here's a random number: \(generator.random())")
// 打印 Here's a random number: 0.37464991998171
print("And another one: \(generator.random())")
// 打印 And another one: 0.729023776863283
```

### 初始化器要求

协议可以要求遵循该协议的类型实现初始化器。在具体类型实现初始化器时，必须为初始化器实现加上 `required` 修饰符，这是为了保证实现类的子类也必须提供该初始化器的实现，继而遵循该协议。但如果实现类已经用 `final` 声明禁止继承，就不再需要在协议初始化器实现时添加 `required` 修饰符。如果一个子类重写了父类的指定初始化器，并且该初始化器满足了某个协议的要求，那么该初始化器实现需要同时标注 `required` 和 `override` 修饰符，`required` 表示遵循协议，`override` 表示继承自父类。

### 委托 (Delegation)

委托是一种设计模式，允许类或者结构体将一些需要它们负责的功能委托给其他类型的实例。委托模式的实现很简单：定义协议来封装需要被委托的功能，这样就能确保遵循协议的类型能够提供这些功能。委托模式可以用来响应特定动作，或者接收外部数据源提供的数据，而不必关心外部数据源的类型。

```swift
class Dice {
    let sides: Int
    let generator: RandomNumberGenerator
    init(sides: Int, generator: RandomNumberGenerator) {
        self.sides = sides
        self.generator = generator
    }
    func roll() -> Int {
        return Int(generator.random() * Double(sides)) + 1
    }
}

protocol DiceGame {
    var dice: Dice { get }
    func play()
}

protocol DiceGameDelegate {
    func gameDidStart(_ game: DiceGame)
    func game(_ game: DiceGame, didStartNewTurnWithDiceRoll diceRoll: Int)
    func gameDidEnd(_ game: DiceGame)
}
```

`DiceGame` 协议可以被任何涉及骰子的游戏遵循。`DiceGameDelegate` 协议可以被任意类型遵循，用于追踪 `DiceGame` 的游戏过程。

```swift
class SnakesAndLadders: DiceGame {
    let finalSquare = 25
    let dice = Dice(sides: 6, generator: LinearCongruentialGenerator())
    var square = 0
    var board: Array<Int>
    init() {
        board = Array(repeating: 0, count: finalSquare + 1)
        board[03] = +08
        board[06] = +11
        board[09] = +09
        board[10] = +02
        board[14] = -10
        board[19] = -11
        board[22] = -02
        board[24] = -08
    }
    var delegate: DiceGameDelegate?
    func play() {
        square = 0
        delegate?.gameDidStart(self)
        gameLoop: while square != finalSquare {
            let diceRoll = dice.roll()
            delegate?.game(self, didStartNewTurnWithDiceRoll: diceRoll)
            switch square + diceRoll {
            case finalSquare:
                break gameLoop
            case let newSquare where newSquare > finalSquare:
                continue gameLoop
            default:
                square += diceRoll
                square += board[square]
            }
        }
        delegate?.gameDidEnd(self)
    }
}
```

游戏 `SnakesAndLadders` 遵循 `DiceGame` 协议，并且提供了相应的可读的 `dice` 属性和 `play()` 方法。游戏中的 `delegate` 并不是必备条件，因此 `delegate` 被设定为 `DiceGameDelegate` 类型的可选属性。 `DiceGameDelegate` 协议提供了 3 个方法用来追踪游戏的过程。这三个方法被嵌入游戏的逻辑中，在相应的时间点被调用。

因为 `delegate` 是一个可选值，因此在 `play()` 方法中通过可选链式调用来调用其方法。若 `delegate` 属性为 `nil`，则调用会优雅失败，并不会产生错误。若 `delegate` 不是 `nil`，则方法能够被调用，并传递 `SnakesAndLadders` 实例作为参数。如下定义了 `DiceGameTracker` 类，遵循 `DiceGameDelegte` 协议：

```swift
class DiceGameTracker: DiceGameDelegate {
    var numberOfTurns = 0
    func gameDidStart(_ game: DiceGame) {
        numberOfTurns = 0
        if game is SnakesAndLadders {
            print("Started a new game of Snakes and Ladders.")
        }
        print("The game is using a \(game.dice.sides)-sided dice.")
    }
    
    func game(_ game: DiceGame, didStartNewTurnWithDiceRoll diceRoll: Int) {
        numberOfTurns += 1
        print("Rolled a \(diceRoll).")
    }
    
    func gameDidEnd(_ game: DiceGame) {
        print("The game lasted for \(numberOfTurns) turns.")
    }
}

let tracker = DiceGameTracker()
let game = SnakesAndLadders()
game.delegate = tracker
game.play()
// Started a new game of Snakes and Ladders.
// The game is using a 6-sided dice.
// Rolled a 3.
// Rolled a 5.
// Rolled a 4.
// Rolled a 5.
// The game lasted for 4 turns.
```

### 扩展和协议

可以通过扩展令已有类型遵循协议。

```swift
protocol TextRepresentable {
    var textualDescription: String { get }
}
extension Dice: TextRepresentable {
    var textualDescription: String {
        return "A \(sides)-sided dice."
    }
}
extension SnakesAndLadders: TextRepresentable {
    var textualDescription: String {
        return "A game of Snakes and Ladders with \(finalSquare) squares."
    }
}
```

即使满足了协议的所有要求，类型也不会自动遵循协议，必须显式声明遵循协议。当一个类型已经遵循了某个协议的所有要求，却尚未声明采纳该协议时，可以通过空的扩展来采纳该协议：

```swift
struct Hamster {
    var name: String
    var textualDescription: String {
        return "A hamster named \(name)."
    }
}
```

虽然满足了 `TextRepresentable` 的所有要求，但是`Hamster` 还不能作为 `TextRepresentable` 的类型使用。

```swift
extension Hamster: TextRepresentable {}
```

从现在起，`Hamster` 的实例可以作为 `TextRepresentable` 类型使用。

```swift
let simonTheHamster = Hamster(name: "Simon")
let somethingTextRepresentable: TextRepresentable = simonTheHamster
print(somethingTextRepresentable.textualDescription)
// 打印 A hamster named Simon
```

### 有条件地遵循协议

泛型类型可能只在某些情况下遵循某个协议，可以通过在扩展类型时列出限制来让泛型类型有条件地遵循某协议。下面的扩展让 `Array` 泛型容器只在遵循 `TextRepresentable` 协议的元素出现时遵循该协议。

```swift
extension Array: TextRepresentable where Element: TextRepresentable {
    var textualDescription: String {
        let itemsAsText = self.map { $0.textualDescription }
        return "[" + itemsAsText.joined(separator: ", ") + "]"
    }
}
var d6 = Dice(sides: 6, generator: LinearCongruentialGenerator())
var d12 = Dice(sides: 12, generator: LinearCongruentialGenerator())
let myDice = [d6, d12]
print(myDice.textualDescription)
// 打印 "[A 6-sided dice, A 12-sided dice]"
```

### 类专属的协议

当协议定义的要求需要遵循协议的类型必须是引用语义而非值语义时，应该采用类专属协议。可以通过添加 `AnyObject` 继承来限制协议只能被类采纳。

```swift
protocol SomeClassOnlyProtocol: AnyObject, SomeInheritedProtocol {
    // 这里是类专属协议的定义部分
}
```

### 协议扩展

协议可以通过扩展来为遵循协议的类型提供属性、方法以及下标实现。通过协议扩展，所有遵循协议的类型都能自动获得扩展新增的方法或属性，而无需任何额外修改。协议扩展可以为遵循协议的类型提供默认实现。

## 参考文献

1. [The Swift Programming Language. Extensions.](https://docs.swift.org/swift-book/LanguageGuide/Extensions.html)
2. [The Swift Programming Language. Protocols.](https://docs.swift.org/swift-book/LanguageGuide/Protocols.html)
3. [Swift 编程语言. 扩展.](https://swiftgg.gitbook.io/swift/swift-jiao-cheng/20_extensions)
4. [Swift 编程语言. 协议.](https://swiftgg.gitbook.io/swift/swift-jiao-cheng/21_protocols)
