---
series: Swift 基础
title: 初始化过程
enable html: true
categories: Swift
tags:
  - Initialization
date: 2019-11-07 09:19:33
---

Swift 类的初始化是一个较为复杂的过程，在 Cocoa 编程中，最佳实践一般推荐我们不要自己手写初始化器而是直接对属性赋初始值，因为初始化器的继承和重写机制极其复杂，非常容易出错。因此，本篇我们将介绍 Swift 中类、结构体和枚举类型在初始化时的内部操作，以及手动对一等类型进行初始化时的操作步骤和注意点。

<!-- more -->

## 实例初始化

初始化是使用类、结构体或枚举的实例之前的准备过程，包括设置实例中每个存储属性的初始值和执行其他必须的设置或初始化过程。

### 存储属性的初始赋值

类和结构体在实例化时，必须为所有存储属性设置合适的初始值。存储属性不能处于未知状态。你既可以在初始化器中为存储属性分配默认值，也可以在定义属性时分配默认值。当你为存储属性分配默认值或者在初始化器中设置初始值时，它们的值是直接设置的，不会出发任何属性观察器。

```swift
struct Fahrenheit {
    var temperature = 32.0
}
var f = Fahrenheit()
print("The default temperature is \(f.temperature)° F.")
// 打印 The default temperature is 32.0° F
```

### 初始化过程中常量属性的赋值

你可以在初始化过程中的任意时间点给常量属性赋值，只要在初始化过程结束时把它设置成确定的值。一旦常量属性被赋值，它将永远不可更改。对于类的实例来说，它的常量属性只能在定义它的类的初始化过程中修改，不能在子类中修改。

```swift
class SurveyQuestion {
    let text: String
    var response: String?
    init(text: String) {
        self.text = text
    }
    func ask() {
        print(text)
    }
}
let beetsQuestion = SurveyQuestion(text: "Do you like cheese?")
beetsQuestion.ask()
beetsQuestion.response = "I do like cheese."
```

### 指定初始化器 (Designated Initializer) 和便利初始化器 (Convenience Initializer)

指定初始化器是类中最主要的初始化器。一个指定初始化器将初始化类中提供的所有属性，并调用合适的父类初始化器让初始化过程沿着父类链继续向上进行。类倾向于拥有极少的指定初始化器，一般一个类只拥有一个指定初始化器。

便利初始化器是类中比较次要的、辅助性的初始化器。你可以定义便利初始化器来调用同一个类中的指定初始化器，并未部分形参提供默认值。你也可以定义便利初始化器来创建一个特殊用途或特定输入值的实例。你应该只在必要的时候为类提供便利初始化器，比方说某种情况下通过使用便利初始化器来快捷调用某个指定初始化器，能够节省更多开发时间并让类的构造过程更清晰明了。


### 类的初始化器代理 (Initializer Delegation for Class Types)

为了简化指定初始化器和便利初始化器之间的调用关系，Swift 初始化器之间的代理调用遵循以下3条原则：

- 指定初始化器必须调用其直接父类的指定初始化器；
- 便利初始化器必须调用同类中定义的其他初始化器；
- 便利初始化器最后必须调用指定初始化器。

更简单的记忆方法是：

- 指定初始化器必须总是向上代理；
- 便利初始化器必须总是横向代理。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/swift/initialization/4-1-initializer-delegation.png"
    width="70%"
    alt="复杂构造器代理图"
/>
</div>

### 两段式初始化 (Two-phase Initialization)

Swift 中类的初始化分为两个阶段。第一个阶段，类中的每个存储属性被赋于一个初值。当每个存储属性都得到初始赋值之后，第二个阶段开始。第二个阶段给每个类一次机会，在新实例准备使用之前进一步自定义其存储属性。

Swift 编译器将执行4种有效的安全检查，以确保两段式初始化过程不出错地完成：

1. 指定初始化器必须保证它所在的类的所有属性都必须先初始化完成，之后才能将其他初始化任务向上代理给父类中的初始化器。一个对象的内存只有在其所有存储属性确定之后才能完全初始化。为了满足这一原则，指定初始化器必须保证它所在的类的属性在它往上代理之前先完成初始化。
2. 指定初始化器必须在为继承的属性设置新值前向上代理调用父类初始化器。如果不这么做，指定初始化器赋予的新值将被父类中的初始化器覆盖。
3. 便利初始化器必须在为任意属性（包括所有同类中定义的）赋新值之前代理调用其他构造器。如果不这么做，便利初始化器赋予的新值将会被该类的指定初始化器覆盖。
4. 初始化器在第一阶段初始化完成前，不能调用任何实例方法，不能读取任何实例属性的值，不能引用self作为一个值。类的实例在第一阶段结束前并不是完全有效的。只有第一阶段完成后，类的实例才是有效的，才能访问属性和调用方法。

以下是基于上述安全检查的两段式初始化过程：

阶段1:

- 类的某个指定初始化器或便利初始化器被调用；
- 完成类的新实例内存的分配，但此时内存尚未被初始化；
- 指定初始化器确保其所在类引入的所有存储属性都已经赋了初值，存储属性所属的内存完成初始化；
- 指定初始化器切换到父类的初始化器，对其存储属性完成相同的任务；
- 该过程沿着类继承链一直向上执行，直到到达继承链的最顶部；
- 当到达了继承链的最顶部，而且继承链的最后一个类已确保所有的存储属性都已经得到赋值，该实例的内存完成初始化。阶段1完成。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/swift/initialization/4-2-two-phase-initialization.png"
    width="70%"
    alt="构建过程阶段1"
/>
</div>

 阶段2:

- 从继承链顶部往下，继承链中每个类的指定初始化器都有机会进一步自定义实例。初始化器此时可以访问 `self`、修改它的属性并调用实例方法；
- 最终，继承链中任意的便利初始化器有机会自定义实例和使用 `self`。

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/swift/initialization/4-3-two-phase-initialization.png"
    width="70%"
    alt="构建过程阶段2"
/>
</div>

### 初始化器实践

接下来我们用一个实例来展示指定初始化器、便利初始化器和初始化器的自动继承。该实例包含了 3 个类 `Food`, `RecipeIngredient` 以及 `ShoppingListItem` 的层级结构，并将演示它们的构造器是如何相互作用的。

类层次中的基类是 `Food`，它是一个简单的用来封装食物名字的类。`Food` 类引入了一个叫做 `name` 的 `String` 类型属性，并提供了 2 个初始化器用于创造 `Food` 实例：

```swift
class Food {
    var name: String
    init(name: String) {
        self.name = name
    }
    
    convenience init() {
        self.init(name: "[Unnamed]")
    }
}
let namedMeat = Food(name: "Bacon")
let mysteryMeat = Food()
```

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/swift/initialization/4-4-initializers-example.png"
    width="70%"
    alt="Food 构造器链"
/>
</div>

层级中的第二个类是 `Food` 的子类 `RecipeIngredient`。`RecipeIngredient` 类用于表示食谱中的一项原料。它引入了 `Int` 类型的属性 `quantity` 并且定义了 2 个初始化器来创建 `RecipeIngredient` 实例：

```swift
class RecipeIngredient: Food {
    var quantity: Int
    init(name: String, quantity: Int) {
        self.quantity = quantity
        super.init(name: name)
    }
    override convenience init(name: String) {
        self.init(name: name, quantity: 1)
    }
}
```

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/swift/initialization/4-5-initializers-example.png"
    width="70%"
    alt="RecipeIngredient 构造器"
/>
</div>

类层级中第三个也是最后一个类是 `RecipeIngredient` 的子类，叫做 `ShoppingListItem`。这个类构建了购物单中出现的某一种食谱原料。`ShoppingListItem` 引入一个布尔型属性 `purchased`，默认值是 `false`。`ShoppingListItem` 还新增了一个计算属性 `description`，提供了简单的文字描述：

```swift
class ShoppingListItem: RecipeIngredient {
    var purchased = false
    var description: String {
        var output = "\(quantity) x \(name)"
        output += purchased ? "✔" : "✘"
        return output
    }
}
```

<div align="center">  
<img
    src="https://images.herculas.cn/image/blog/swift/initialization/4-6-initializers-example.png"
    width="70%"
    alt="三类构造器图"
/>
</div>

你可以使用三个继承来的构造器来创建 `ShoppingListItem` 的新实例：

```swift
var breakfastList = [
    ShoppingListItem(),
    ShoppingListItem(name: "Bacon"),
    ShoppingListItem(name: "Eggs", quantity: 6)
]
breakfastList[0].name = "Orange juice"
breakfastList[0].purchased = true
for item in breakfastList {
    print(item.description)
}
// 1 x orange juice ✔
// 1 x bacon ✘
// 6 x eggs ✘
```

## 参考文献

1. [The Swift Programming Language. Initialization.](https://docs.swift.org/swift-book/LanguageGuide/Initialization.html)
2. [Swift 编程语言. 构造过程.](https://swiftgg.gitbook.io/swift/swift-jiao-cheng/14_initialization)
