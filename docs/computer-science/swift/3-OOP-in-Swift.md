---
series: Swift 基础
title: Swift 的面向对象编程
enable html: true
categories: Swift
tags:
  - OOP
date: 2018-11-05 20:01:14
---

本篇中我们将介绍在 Swift 中进行面向对象编程的注意点和重点。我们重点关注 Swift 类、结构体和枚举中属性和方法的实现和应用，以及类继承的原则与实现。

<!-- more -->

## 属性

### 惰性存储属性 (Lazy Stored Propeties)

惰性存储属性是指当第一次被调用的时候才会计算其出示值的属性。必须将惰性存储属性声明成变量，因为属性的初始值可能在实例初始化完成之后才会得到。而常量属性在初始化完成之前必须要有初始值，因此无法声明为惰性属性。

当属性的值依赖于一些外部因素且这些外部因素只有在初始化过程结束后才会得到的时候，惰性属性就会很有用。或者当获得属性的值需要复杂或者大量的计算，而需要采用按需计算的方式，惰性属性也会很有用。

```swift
class DataImporter {
    /*
    DataImporter 是一个负责将外部文件中的数据导入的类。
    这个类的初始化会消耗不少时间。
    */
    var fileName = "data.txt"
    // 这里会提供数据导入功能
}

class DataManager {
    lazy var importer = DataImporter()
    var data = Array<String>()
    // 这里会提供数据管理功能
}

let manager = DataManager()
manager.data.append("Some data")
manager.data.append("Some more data")
// DataImporter 实例的 importer 属性还没有被创建
```

### 计算属性 (Computed Properties)

除存储属性外，类、结构体和枚举可以定义计算属性。计算属性不直接存储值，而是提供一个 getter 和一个可选的 setter ，来间接获取和设置其他属性或变量的值。

```swift
struct Point {
    var x = 0.0
    var y = 0.0
}

struct Size {
    var width = 0.0
    var height = 0.0
}

struct Rect {
    var origin = Point()
    var size = Size()
    
    var center: Point {
        get {
            let centerX = origin.x + (size.width / 2)
            let centerY = origin.y + (size.height / 2)
            return Point(x: centerX, y: centerY)
        }
        set(newCenter) {
            origin.x = newCenter.x - (size.width / 2)
            origin.y = newCenter.y - (size.height / 2)
        }
    }
}
var square = Rect(origin: Point(x: 0.0, y: 0.0), size: Size(width: 10.0, height: 10.0))
let initialSquareCenter = square.center
square.center = Point(x: 15.0, y: 15.0)
print("square.origin is now at (\(square.origin.x), \(square.origin.y))")
// 打印 square.origin is now at (10.0, 10.0)
```

#### 简化的 setter 和 getter 声明

如果一个计算属性的 setter 没有定义表示新值的参数名，则可以使用默认名称 `newValue`。如果整个 getter 是单一表达式，getter 会隐式返回这个表达式的结果。这时可以省略 `return` 关键字。

```swift
struct CompactRect {
    var origin = Point()
    var size = Size()
    var center: Point {
        get {
            Point(x: origin.x + (size.width / 2), y: origin.y + (size.height / 2))
        }
        set {
            origin.x = newValue.x - (size.width / 2)
            origin.y = newValue.y - (size.height / 2)
        }
    }
}
```

#### 只读计算属性 (Read-Only Computed Properties)

只有 getter 没有 setter 的计算属性被称为**只读计算属性**。只读计算属性总是返回一个值，可以通过点运算符访问，但不能设置新的值。只能把计算属性定义为变量，因为它们的值是不固定的。

只读计算属性可以省略 `get` 关键字和花括号：

```swift
struct Cuboid {
    var width = 0.0
    var height = 0.0
    var depth = 0.0
    var volume: Double {
        width * height * depth
    }
}
let fourByFiveByTwo = Cuboid(width: 4.0, height: 5.0, depth: 2.0)
print("The volume of fourByFiveByTwo is \(fourByFiveByTwo.volume)")
// 打印 the volume of fourByFiveByTwo is 40.0
```

### 属性观察器 (Property Observers)

属性观察器监控并响应属性值的变化，每次属性值被设置的时候都会调用属性观察器，即使新值和当前值相同的时候也不例外。

可以为除了惰性存储属性之外的其他存储属性添加属性观察器，也可以在子类中通过重写父类属性的方式为继承的存储属性和计算属性添加属性观察器。但没有必要为非重写的计算属性添加属性观察器，因为可以直接在 setter 中监控和响应值的变化。

可以为属性添加两种属性观察器：

- `willSet`: 在新的值被设置之前调用；
- `didSet`: 在新的值被设置之后调用。

`willSet` 观察器会将新的属性值作为常量参数传入，在 `willSet` 的实现代码中可以为该参数指定拍一个名称，若不指定则使用默认名称 `newValue` 表示。同样，`didSet` 观察器会将旧属性值作为常量参数传入，可以为该参数指定一个新名称或使用其默认名称 `oldValue`。如果在 `didSet` 方法中再次对该属性赋值，那么新值将会覆盖旧值。

```swift
class StepCounter {
    var totalSteps: Int = 0 {
        willSet(newTotalSteps) {
            print("About to set totalSteps to \(newTotalSteps)")
        }
        didSet {
            if totalSteps > oldValue {
                print("Added \(totalSteps - oldValue) steps")
            }
        }
    }
}

let stepCounter = StepCounter()
stepCounter.totalSteps = 200
// About to set totalSteps to 200
// Added 200 steps
stepCounter.totalSteps = 360
// About to set totalSteps to 360
// Added 160 steps
stepCounter.totalSteps = 896
// About to set totalSteps to 896
// Added 536 steps
```

如果将带有观察器的属性通过 in-out 方式传入函数，`willSet` 和 `didSet` 也会被调用。这是因为 in-out 参数采用了拷入拷出内存模式：即在函数内部使用的是参数的拷贝，函数结束后又对参数重新赋值。

## 方法

### 在实例方法中修改值类型

结构体和枚举是值类型。默认情况下，值类型的属性不能在它的实际方法中被修改。但是，如果你确实需要在某个特定的方法中修改结构体或枚举的属性，你可以为这个方法声明可变 (mutating) 行为，然后就可以从其方法内部改变其属性。并且，这个方法所做的任何改变都会在方法执行结束时写回到原始结构中。

方法甚至还可以给其隐含的 `self` 属性赋于一个全新的实例，这个新实例在方法结束时会替换现有实例。

```swift
struct Point {
    var x = 0.0
    var y = 0.0
    mutating func moveBy(x deltaX: Double, y deltaY: Double) {
        x += deltaX
        y += deltaY
    }
}
var somePoint = Point(x: 1.0, y: 1.0)
somePoint.moveBy(x: 2.0, y: 3.0)
print("The point is now at (\(somePoint.x), \(somePoint.y))")
// 打印 The point is now at (3.0, 4.0)
```

## 下标 (Subscripts)

下标可以定义在类、结构体和枚举中，是访问集合、列表或序列中元素的快捷方式。可以使用下标的索引设置或获取值，而不必再调用对应的存取方法。

### 下标语法

下标允许你通过在实例名称之后的方括号中传入一个或多个索引值来对实例进行查询。其语法类似于实例方法和计算属性的语法。定义下标使用 `subscript` 关键字，可以指定一个或多个输入参数和一个返回类型。

```swift
struct TimeTable {
    let multiplier: Int
    subscript(index: Int) -> Int {
        return multiplier * index
    }
}
let threeTimesTable = TimeTable(multiplier: 3)
print("six times three is \(threeTimesTable[6])")
// 打印 six times three is 18
```

### 下标选项 (Subscript Options)

下标可以接受任意数量的入参，并且这些入参可以是任意类型。下标的返回值也可以是任意类型。下标可以使用变长参数，但不能使用 in-out 参数，也不能提供参数默认值。

一个类或结构体可以根据自身需要提供多个下标实现，使用下标时将通过入参的数量和类型进行区分，自动匹配合适的下标。是为下标的重载。

```swift
struct Matrix {
    let rows: Int
    let columns: Int
    var grid: [Double]
    init(rows: Int, columns: Int) {
        self.rows = rows
        self.columns = columns
        self.grid = Array(repeating: 0.0, count: rows * columns)
    }
    func indexIsValid(row: Int, column: Int) -> Bool {
        return row >= 0 && row < rows && column >= 0 && column < columns
    }
    subscript(row: Int, column: Int) -> Double {
        get {
            assert(indexIsValid(row: row, column: column), "Index out of range.")
            return grid[(row * columns) + column]
        }
        set {
            assert(indexIsValid(row: row, column: column), "Index out of range.")
            grid[(row * columns) + column] = newValue
        }
    }
}
var matrix = Matrix(rows: 2, columns: 2)
matrix[0, 1] = 1.5
matrix[1, 0] = 3.2
```

## 继承与派生
### 基类 (Base Class)

不继承自其他类的类被称为基类。Swift 中的类并不是从一个通用的基类继承而来。如果不手动定义一个类作为基类，该类自己就会自动称为一个基类。

```swift
class Vehicle {
  var currentSpeed = 0.0
  var description: String {
  return "traveling at \(currentSpeed) miles per hour"
  }
  func makeNoise() {
      // Do noting - an arbitrary vehicle doesn't necessarily make a noise
  }
}
class Bicycle: Vehicle {
  var hasBasket = false
}
let bicycle = Bicycle()
bicycle.currentSpeed = 15.0
print("Bicycle: \(bicycle.description)")
// 打印 Vehicle: traveling at 0.0 miles per hour
```

### 重写 (Overriding)

如果要重写基类的某个特性，需要在重写定义之前加上 `override` 关键字。这么做，显式地标明了你想提供一个重写版本，而非错误地提供了一个相同的定义。意外的重写行为可能会导致不可预知的错误，任何缺少 `override` 关键字的重写都会在编译期被认定为错误。`override` 关键字会提醒编译器检查该类的父类是否有匹配重写版本的声明，该检查可以确保你的重写定义是正确的。

```swift
class Train: Vehicle {
  override func makeNoise() {
      print("Choo choo")
  }
}
```
