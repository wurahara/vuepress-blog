---
series: Swift 进阶
title: 函数、闭包与函数式编程初步
enable html: true
categories: Swift
tags:
  - function
  - closure
date: 2019-12-03 09:45:56
---

开始本章之前，让我们先来回顾一些关于函数的重要概念。要理解 Swift 中的函数和闭包，你需要切实弄明白三件事情，我们把这三件事按照重要程度进行了大致排序：

1. 函数可以被赋值给变量，也可以作为另一个函数的输入参数或者返回值；
2. 函数能**捕获**存在于其局部作用域之外的变量；
3. 有两种方式可以创建函数，一种是使用 `func` 关键字，另一种是 `{}`。在 Swift 中后一种被称为**闭包表达式**。

<!-- more -->

## 函数和闭包

有时候，新接触闭包的人会认为上面这三点的重要程度是反过来的，并且会忽略其中的某一点，或把**闭包**和**闭包表达式**混为一谈。尽管这些概念确实容易引起困惑，但这三点却是鼎足而立，互为补充的。如果你忽视其中任何一条，终究会在函数的应用上，狠狠地摔伤一跤。

### 函数赋值

Swift 和很多现代化编程语言一样，都把函数作为“头等对象”，你既可以把函数赋值给变量，也可以将它作为其他函数的参数或返回值。这一点是我们需要理解的**最重要**的东西，在函数式编程中明白这一点，就和在 C 语言中明白**指针**的概念一样。

为什么函数可以作为变量使用的能力如此关键呢？因为它让你很容易写出高阶函数，高阶函数将函数作为参数的能力使得它们在很多方面都非常有用，我们已经在内建集合类型一章中领教过它的威力了。

### 捕获变量

当函数引用了在其作用域之外的变量时，这个变量就被**捕获**了，它们将继续存在，而不是在超过作用域之后被摧毁。你可以将这些函数和它们所捕获的变量想象为一个类的实例，这个类拥有一个单一的方法（也就是这里的函数）以及一些成员变量（这里被捕获的变量）。在编程术语中，一个函数和它所捕获的变量环境组合起来被称为**闭包**。

### 闭包表达式

使用闭包表达式来定义函数可以被想象成**函数的字面量** (function literals)，就像 1 是整数字面量，`"hello"` 是字符串字面量一样。和 `func` 相比，它的区别仅在于闭包表达式是匿名的，它们没有被赋于一个名字。使用它们的方式只能是在它们被创建时将其赋值给一个变量，或者将它们传递给另一个函数或方法。

要说明的是，那些使用 `func` 声明的函数也可以是闭包，就和用 `{}` 声明的是一样的。记住，闭包指的是一个函数以及被它捕获的所有变量的集合。而使用 `{}` 来创建的函数被称为**闭包表达式**，人们常常会把这种语法简单地称作**闭包**。但不要因此就认为使用闭包表达式语法声明的函数和其他方法声明的函数有什么本质不同。它们都是一样的，它们都是函数，也都可以是闭包。

## inout 参数和可变方法

如果你有一些 C 或者 C++ 的背景，Swift 中用在 inout 参数前面的 `&` 可能会给你一种这是在传递引用的错觉。但事实并非如此，inout 的作用是传值，然后再复制回来，**并不是**传递引用。

为了了解什么样的表达式可以作为 inout 参数，我们需要区分 lvalue 和 rvalue。lvalue 描述的是一个内存地址，它是左值 (left value) 的缩写，因为 lvalues 是可以存在于赋值语句左侧的表达式。举例来说，`array[0]` 是一个 lvalue，因为它描述了数组中第一个元素所在的内存位置。而 rvalue 描述的是一个值。`2 + 2` 是一个 rvalue，它描述的是 4 这个值。你不能把 `2 + 2` 或者 `4` 放到赋值语句的左侧去。

对于一个 inout 参数，你只能传递左值，因为右值是不能被更改的。当你在普通的函数或者方法中使用 inout 时，需要显式地将它们传入：即在每个左值前面加上 `&` 符号：


```swift
func increment(value: inout Int) {
    value += 1
}
var i = 0
increment(value: &i)
```

编译器可能会把 inout 变量优化成引用传递，而非传入和传出时复制。但是文档明确指出我们不能依赖这种行为。

### 嵌套函数和 inout

你可以在嵌套函数中使用 inout 参数，Swift 会保证你的使用是安全的。比如说，你可以使用 `func` 或者闭包表达式定义一个嵌套函数，然后安全地改变一个 inout 的参数：


```swift
func incrementTenTimes(value: inout Int) {
    func inc() {
        value += 1
    }
    for _ in 0 ..< 10 {
        inc()
    }
}

var x = 0
incrementTenTimes(value: &x)
// x = 10
```

不过，你不能够让这个 inout 参数逃逸：


```swift
func escapeIncrement(value: inout Int) -> () -> () {
    func inc() {
        value += 1
    }
    return inc      // error: 嵌套函数不能捕获 inout 参数然后让其逃逸
}
```

可以这么理解，因为 inout 参数的值会在函数返回之前复制回去，那么要是我们可以在函数返回之后再去改变它，会发生什么呢？是说值应该在某个时间点再复制回去吗？要是调用源已经不存在了怎么办？编译器必须对此进行验证，因为这对保证安全十分关键。

### & 不意味 inout 的情况

说到不安全的函数，你应该小心 `&` 的另一种语义：把一个函数参数转换成一个不安全指针。

如果一个函数接受 `UnsafeMutablePointer` 作为参数，你可以用和 inout 参数类似的方法，在一个变量之前加上 `&` 传递它。在这种情况下，你**确实**在传递引用，更确切地说，是在传递指针。

这里是一个没有使用 inout，而是接收不安全的可变指针作为参数的 increment 函数的例子：

```swift
func incref(pointer: UnsafeMutablePointer<Int>) -> () -> Int {
    // 将指针的复制存储在闭包中
    return {
        pointer.pointee += 1
        return pointer.pointee
    }
}
```

Swift 数组可以无缝地隐式退化为指针，这使得将 Swift 和 C 一起使用的时候非常方便。现在，假设在调用这个函数之前，你传入的数组已经离开其作用域了：

```swift
let fun: () -> Int
do {
    var array = [0]
    fun = incref(pointer: &array)
}

fun()
```

这个操作为我们打开了充满“惊喜”的未知世界大门。在测试的时候，每次运行上面的代码都将打印出不同的值，有时候甚至会直接崩溃。

这个例子告诉我们的是：了解并确定你正在传递的参数。当你使用 `&` 时，它代表的既有可能是 Swift 安全且优秀的 inout 语义，也可能把你的变量带到不安全指针的蛮荒之地。当处理不安全指针时，你需要非常小心变量的生命周期。

## 属性

有两种方法和其他普通的方法有所不同，那就是计算属性和下标操作符。计算属性看起来和存储属性很像，但是它们并不使用任何内存来存储自己的值。相反，这个属性每次被访问时，返回值都将被实时计算出来。计算属性实际上是一个方法，只是它的定义和调用约定不太寻常。

### 变更观察者

我们也可以为属性和变量实现 `willSet` 和 `didSet` 方法，每当一个属性被设置时（就算它的值没有发生变化），这两个方法都会被调用。它们会分别在设置前和设置后被立即调用。在使用 Inteface Builder 时，这个技巧会很有用：我们可以为 IBOutlet 实现一个 `didSet`，这样就可以知道它是什么时候被连接的了。在这个 `didSet` 中我们可以执行额外的配置操作。比如说，如果我们想要在标签可用时就设置文本颜色，那么可以这样做：

```swift
class SettingsController: UIViewController {
    @IBOutlet weak var label: UILabel? {
        didSet {
            label?.textColor = .black
        }
    }
}
```

属性观察者必须在声明一个属性的时候就被定义，无法在扩展里进行追加。所以，这不是一个提供给类型用户的工具，而是专门提供给类型设计者的。`willSet` 和 `didSet` 本质上是一对属性的缩写：一个是存储值的私有存储属性，另一个是读取值的公开计算属性，这个计算属性的 setter 会在将值存储到私有存储属性之前和/或之后，进行额外的工作。这和 Foundation 中的键值观察 (KVO, Key-value Observing) 有本质的不同，键值观察通常是对象的**消费者**来观察对象内部变化的手段，而与类的设计者是否希望如此无关。

不过，你可以在子类中重写一个属性，来添加观察者：

```swift
class Robot {
    enum State {
        case stopped
        case movingForward
        case turningRight
        case turningLeft
    }
    var state = State.stopped
}

class ObservableRobot: Robot {
    override var state: State {
        willSet {
            print("Transitioning from \(state) to \(newValue)")
        }
    }
}

var robot = ObservableRobot()
robot.state = .movingForward
// Transitioning from stopped to movingForward
```

这种做法和“改变观察者是一个类型的内部特性”并不矛盾。即便这种做法不被允许，子类也还是可以通过使用一个计算属性的 setter 对父类存储属性进行重写，并完成那些额外的工作。

### 惰性存储属性

延迟初始化一个值在 Swift 中是一种常见的模式，为了定义一个延迟初始化的属性，Swift 提供了一个专用的关键字 `lazy`。该关键字用来定义一个惰性属性 (Lazy Property)。要注意的是，惰性属性只能用 `var` 定义，因为在初始化完成之后，它的初始值可能仍然是未设置的。Swift 对常量有着严格的规则，它必须在实例初始化器执行完毕**之前**就拥有值。和计算属性不同，存储属性和需要存储的惰性属性不能被定义在扩展中。

```swift
struct Point {
    var x: Double
    var y: Double
    private(set) lazy var distanceFromOrigin: Double = (x * x + y * y).squareRoot()
    
    init(x: Double, y: Double) {
        self.x = x
        self.y = y
    }
}
```

当我们创建一个点后，可以访问 `distanceFromOrigin` 属性，这将会计算出值，并存储起来等待重用。不过，如果我们之后改变了 `x` 的值，这个变化将不会反映在 `distanceFromOrigin` 中：

```swift
var point = Point(x: 3, y: 4)
print(point.distanceFromOrigin)     // 5.0
point.x += 10
print(point.distanceFromOrigin)     // 5.0
```

想要让 `distanceFromOrigin` 能始终反映 `x` 和 `y` 的变化，一种解决的办法是在 `x` 和 `y` 的 `didSet` 中重新计算 `distanceFromOrigin`，不过这样一来 `distanceFromOrigin` 就不是真正的惰性属性了，在每次 `x` 或者 `y` 变化的时候它都将会被重新计算。当然，在这个例子中更好的解决方式是，我们一开始就将 `distanceFromOrigin` 设置为一个普通的非惰性计算属性。

访问一个惰性属性是一个 `mutating` 操作，因为这个属性的初始值会在第一次访问时被设置。当结构体包含一个惰性属性时，这个结构体的所有者如果想要访问该惰性属性的话，也需要将结构体声明成变量，因为访问这个惰性属性的同时，也会潜在地对这个属性的容器进行改变。让想访问惰性属性的所有用户都使用 `var` 是非常麻烦的事情，所以在结构体中使用惰性属性通常不是一个好主意。

## 下标

在标准库中，我们已经看到过一些下标用法了，比如使用 `dictionary[key]` 这样的语法在字典中查找元素。这些下标很像函数和计算属性的混合体，只不过使用了特殊的语法。之所以说像函数，因为下标也可以接受参数；之所以说像计算属性，因为下标要么是只读的，要么是可读可写的。和普通的函数类似，我们可以通过重载提供不同类型的下标操作符。

### 自定义下标操作

我们可以为自己的类型添加下标支持，也可以为已经存在的类型添加新的下标重载。比如说，我们可以给 Collection 添加一个接受索引列表为参数的下标方法，它返回一个包含这些索引位置上的元素的数组：

```swift
extension Collection {
    subscript(indices indexList: Index...) -> [Element] {
        var result: [Element] = []
        for index in indexList {
            result.append(self[index])
        }
        return result
    }
}
```

请注意我们是如何使用一个显式的参数标签，来将我们的下标方法和标准库中的方法区分开的。三个点表示 `indexList` 是一个**可变长度参数**。我们可以像下面这样使用这个新的下标：

```swift
Array("abcdefghijklmnopqrstuvwxyz")[indices: 7, 4, 11, 11, 14]
```

### 下标进阶

下标还可以在参数或者返回类型上使用泛型。考虑下面这个类型为 `[String: Any]` 的异值词典：

```swift
var japan: [String: Any] = [
    "name": "Japan",
    "capital": "Tokyo",
    "population": 126_740_000,
    "coordinates": [
        "latitude": 35.0,
        "longitude": 139.0
    ]
]
```

如果你想改变字典中的某个嵌套值，比如 `coordinates` 中的 `latitude` 的话，你会发现这其实没有那么简单：

```swift
japan["coordinates"]?["latitude"] = 36.0     // error: 类型 Any 没有下标成员
```

这可以理解，因为 `japan["coordinates"]` 的类型为 `Any?`，所以你可能会去尝试在使用嵌套下标之前先将它的类型转为字典：

```swift
(japan["coordinates"] as? [String: Double])?["latitude"] = 36.0
// error: 不能对可变表达式赋值
```

代码变得更丑陋了，然而它依旧无法工作。问题在于你不能修改一个类型转换之后的变量：`japan["coordinates"] as? [String: Double]` 这个表达式已经不再是一个左值了。你需要先将这个嵌套的字典存储到一个局部变量中，修改它然后再将这个变量赋值回顶层的键。

我们可以通过为 Dictionary 提供一个泛型下标的扩展，来更好地完成这件事。这个下标方法的第二个参数接受目标类型，并且在下标实现中进行类型转换的尝试：

```swift
extension Dictionary {
    subscript<Result>(key: Key, as type: Result.Type) -> Result? {
        get {
            return self[key] as? Result
        }
        set {
            // 如果传入 nil，就删除现存的值
            guard let value = newValue else {
                self[key] = nil
                return
            }
            
            // 如果类型不匹配，就忽略掉
            guard let value2 = value as? Value else {
                return
            }
            
            self[key] = value2
        }
    }
}
```

因为我们不再需要将下标返回的值做向下的类型转换了，所以更改操作可以直接在顶层字典变量中进行：

```swift
japan["coordinates", as: [String: Double].self]?["latitude"] = 36.0
print(japan["coordinates"])     // Optional(["latitude": 36.0, "longitude": 139.0])
```

泛型下标方法为类型系统填上了一个大洞。不过你可能会觉得这个例子最终的语法仍然很丑陋。基本上来说，Swift 并不适合用来处理像上面字典这样的异值集合。在大多数情况下，可能为你的数据定义一个自定义类型，然后让这些类型满足 Codable 协议来在值和数据交换格式之间进行转换会是更好的选择。

## 键路径

Swift 4 中添加了**键路径** (Key Paths) 的概念。键路径是一个指向属性的未调用的引用，它和对某个方法的未使用的引用很类似。键路径也为 Swift 的类型系统补全了缺失的很大一块拼图。在之前，你无法像引用方法（比如 `String.uppercased`）那样引用一个类型的属性（比如 `String.count`）。

键路径以一个反斜杠开头，比如 `\String.count`。反斜杠是为了将键路径和同名的类型属性区分开来。类型推断对键路径也是有效的，在上下文中如果编译器可以推断出类型，就可以省略类型名，只留下 `\.count`。

正如其名，键路径描述了一个值从根开始的层级**路径**。举例来说，在下面的 `Person` 和 `Address` 类型中，`Person.address.street` 表达了一个人的街道住址的键路径：

```swift
struct Address {
    var street: String
    var city: String
    var zipCode: Int
}

struct Person {
    let name: String
    var address: Address
}

let streetKeyPath = \Person.address.street  // WritableKeyPath<Person, String>
let nameKeyPath = \Person.name              // KeyPath<Person, String>
```

键路径可以由任意的存储和计算属性组合而成，其中还可以包括可选链操作符。编译器会自动为所有类型生成 `[keyPath:]` 下标方法。你通过这个方法来“调用”某个键路径。对键路径的调用，也就是在某个实例上访问由键路径所描述的属性。所以，`"Hello"[keyPath: \.count]` 等效于 `"Hello".count`。

```swift
let simpsonResidence = Address(street: "1094 Evergreen Terrance", city: "Springfield", zipCode: 97475)
var lisa = Person(name: "Lisa Simpson", address: simpsonResidence)
lisa[keyPath: nameKeyPath]      // Lisa Simpson
```

如果你观察上面的两个键路径变量的类型，你会注意到 `nameKeyPath` 的类型是 `KeyPath<Person, String>`。这个键路径是强类型的，它表示该键路径可以作用于 `Person`，并返回一个 `String`。而 `streetKeyPath` 是一个 `WritableKeyPath`，这是因为构成这个键路径的所有属性都是可变的，所以这个可写键路径本身允许其中的值发生变化：

```swift
lisa[keyPath: streetKeyPath] = "742 Evergreen Terrance"
```

然而对 `nameKeyPath` 做同样的操作会造成错误，这是因为它背后的属性不是可变的。

键路径不仅可以描述属性，也可以用于描述下标操作。例如可以使用下面这样的语法来提取数组里第二个 `Person` 对象的 `name` 属性：

```swift
var bart = Person(name: "Bart Simpson", address: simpsonResidence)
let people = [lisa, bart]

people[keyPath: \.[1].name]     // Bart Simpson
```

同样的语法也可用于在键路径中包含字典下标。

### 可以通过函数建模的键路径

一个将基础类型 `Root` 映射为类型为 `Value` 的属性的键路径，和一个具有 `(Root) -> Value` 类型的函数十分相似。而对于可写键路径来说，则对应着**一对**获取和设置值的函数。相对于这样的函数，键路径除了在语法上更加简洁外，最大的优势在于它们是**值**。你可以测试键路径是否相等，也可以将它们用作字典的键（因为它们遵守 Hashable）。另外不像函数，键路径是不包含状态的，所以它也不会捕获可变的状态。如果使用普通的函数，这些都是无法做到的。

键路径还可以通过将一个键路径附加到另一个键路径的方式来生成。这么做时，类型必须要匹配；如果你有一个从 A 到 B 的键路径，那么你要附加的键路径的根类型必须为 B，得到的将会是一个从 A 到 C 的键路径，其中 C 是所附加的键路径的值类型：

```swift
let nameCountKeyPath = nameKeyPath.appending(path: \.count)
// KeyPath<Person, Int>
```

让我们尝试用键路径来替代函数重写一个排序描述符。采用函数的方式，我们可以通过一个 `(Root) -> Value` 函数来定义了 sortDescriptor：

```swift
typealias SortDescriptor<Root> = (Root, Root) -> Bool
func sortDescriptor<Root, Value>(key: @escaping (Root) -> Value) -> SortDescriptor<Root> where Value: Comparable {
    return { key($0) < key($1) }
}
```

我们通过下面的方法使用这个排序描述符：

```swift
let streetSortDescriptor: SortDescriptor<Person> = sortDescriptor { $0.address.street }
```

我们可以通过键路径来添加一种排序描述符的构建方式。通过键路径的下标来访问值：

```swift
func sortDescriptor<Root, Value>(key: KeyPath<Root, Value>) -> SortDescriptor<Root> where Value: Comparable {
    return { $0[keyPath: key] < $1[keyPath: key] }
}
```

通过下面的方法来使用这个排序描述符：

```swift
let streetSortDescriptorKeyPath: SortDescriptor<Person> = sortDescriptor(key: \.address.street)
```

不过虽然拥有一个接受键路径的排序描述符很有用，它并没有给我们和函数一样的灵活度。键路径依赖 `Value` 满足 `Comparable` 这一前提。只使用键路径的话，我们无法很轻易地使用另一种排序断言（比如忽略大小写的按区域设置的比较）。

### 可写键路径

可写键路径比较特殊：你可以用它来读取**或者**写入一个值。因此，它和一对函数等效：一个负责获取属性值 `((Root) -> Value)`，另一个负责设置属性值 `((inout Root, Value) -> Void)`。可写键路径对于**数据绑定**相当有用，有时候你想将两个属性互相绑定：属性 1 发生变化的时候，属性 2 的值会自动更新，反之亦然。比如，你可以将一个 `model.name` 属性绑定到 `textField.text` 上。

### 键路径层级

键路径有五种不同的类型，每种类型都在前一种上添加了更加精确的描述和功能：

* AnyKeyPath：和 `(Any) -> Any?` 类型的函数类似；
* PartialKeyPath<Source>：和 `(Source) -> Any?` 类型的函数类似；
* KeyPath<Source, Target>：和 `(Source) -> Target` 类型的函数类似；
* WritableKeyPath<Source, Target>：和 `(Source) -> Target` 与 `(inout Source, Target) -> ()` 这一对函数类似；
* ReferenceWritableKeyPath<Source, Target>：和 `(Source) -> Target` 与 `(Source, Target) -> ()` 这一对函数类似。第二个函数可以用 `Target` 来更新 `Source` 的值，且要求 `Source` 是一个引用类型。对 WritableKeyPath 和 ReferenceWritableKeyPath 进行区分是有必要的，前一个类型的 setter 要求它的参数是 inout 的。

我们前面也提到，键路径不同于函数，它们是满足 Hashable 的，而且在将来很有可能还会满足 Codable。这也是为什么我们强调 AnyKeyPath 和 `(Any) -> Any?` 只是**类似**的原因。虽然我们能够将一个键路径转换为对应的函数，但是我们无法做相反的操作。

键路径还在活跃的讨论中，而且可能在未来加入更多功能。一个可能的特性是通过 Codable 进行序列化，这将允许我们将键路径持久化，或者通过网络传递。一旦我们可以访问到键路径的结构，我们就可以进行**内省** (Introspection)。比如，我们可以通过键路径的结构来构建带有类型的数据库查询语句。如果类型能够自动提供它们的属性的键路径数组的话，就可以作为运行时反射 API 的基础了。

## 逃逸闭包

你有可能已经注意到了，在一些闭包表达式中，编译器要求你显式地访问 self，而在另外一些表达式中却不需要这样。例如，我们需要在一个网络请求的完成回调中显式地使用 self，但是在传递给 map 或 filter 的闭包中却不需要这样做。两者的不同在于是否会为了稍后的使用而把闭包保存下来（正如网络请求），或者说闭包是否只在函数的作用域中被同步调用（就像 map 和 filter 这样）。

一个被保存在某个地方（比如一个属性中）等待稍后再调用的闭包就叫做**逃逸闭包**。相对的，永远不会离开一个函数的局部作用域的闭包就是**非逃逸闭包**。对于逃逸闭包，编译器强制我们在闭包表达式中显式地使用 self，因为无意中对于 self 的强引用事发生引用循环的最常见原因之一。当一个函数返回的时候，非逃逸闭包会自动销毁，所以它不会创造出一个固定的引用循环。

### @escaping 标注

闭包参数默认是非逃逸的。如果你想要保存一个闭包稍后使用，你需要将闭包参数标记为 `@escaping`。编译器会对此进行验证，如果你没有将闭包标记为 `@escaping`，编译器将不允许你保存这个闭包（或者将其返回给调用者）。

::: tip
在 Swift 3 之前，情况正好完全相反：那时候逃逸闭包是默认的，对非逃逸闭包，你需要标记出 `@noescape`。现在的行为更好，因为它默认是安全的：如果一个函数参数可能导致引用循环，那么它需要被显式地标记出来。`@escaping` 标记可以视作一个警告，来提醒使用这个函数的开发者注意引用关系。
:::

在排序描述符的例子中，我们已经看到过几个必须使用 `@escaping` 的函数参数了：

```swift
func sortDescriptor<Root, Value>(
    key: @escaping (Root) -> Value, 
    by areInIncreasingOrder: @escaping (Value, Value) -> Bool) 
    -> SortDescriptor<Root> 
{
    return { areInIncreasingOrder(key($0), key($1)) }
}
```

注意默认非逃逸的规则只针对函数参数，以及那些**直接参数位置** (Immediate Parameter Position) 的函数类型有效。也就是说，如果一个存储属性的类型是函数的话，那么它将会是逃逸的。出乎意料的是，对于那些使用闭包作为参数的函数，如果闭包被封装到像是元组或者可选值类型的话，这个闭包参数也是逃逸的。因为在这种情况下闭包不是**直接**参数，它将自动变成逃逸闭包。这样的结果是，你不能写出一个函数，使它接受的函数参数同时满足可选值和非逃逸。很多情况下，你可以通过为闭包提供一个默认值来避免可选值。如果这样做行不通的话，可以通过重载函数提供一个包含可选值（逃逸）的函数，以及一个不是可选值，非逃逸的函数来绕过这个限制。

### withoutActuallyEscaping

可能你会遇到这种情况：你确实知道一个**闭包**不会逃逸，但是编译器无法**证明**这点，所以它会强制你添加 `@escaping` 标注。为了说明这一点，让我们看一个标准库文档中的例子。我们在 Array 上实现一个自定义的 allSatisfy 方法，这个方法在内部使用一个数组的**延迟视图** (Lazy View)。然后我们在这个延迟视图上应用一个 filter 来检查是否有任何的元素满足 filter 的条件（也就是说至少有一个元素不满足断言）。我们的首次尝试导致了一个编译错误：

```swift
extension Array {
    func allSatisfy(_ predicate: (Element) -> Bool) -> Bool {
        // error: 使用非逃逸参数 predicate 的闭包有可能允许它逃逸
        return self.lazy.filter({ !predicate($0) }).isEmpty
    }
}
```

我们会在后续的文章中讨论延迟集合 API。对于现在来说，你只需要知道延迟视图为了之后使用后续的转换（比如这里传递给 filter 的闭包）会把它们保存到一个内部属性中去。这就要求传入的任何闭包都是逃逸的，这也就是这里报错的原因，因为我们的 predicate 参数是非逃逸的。

我们可以通过把参数标注成 `@escaping` 来解决这个问题，但在这个情况下，我们**知道**这个闭包是不会逃逸的，因为这个延迟视图的生命周期是同这个函数的生命周期相绑定的。对于类似这样的情况，Swift 提供了一个 withoutActuallyEscaping 函数来作为一种“安全出口”。这个函数允许你对一个接受逃逸闭包的函数传入一个非逃逸的闭包。

```swift
extension Array {
    func allSatisfy2(_ predicate: (Element) -> Bool) -> Bool {
        return withoutActuallyEscaping(predicate) { escapablePredicate in
            self.lazy.filter { !escapablePredicate($0) }.isEmpty
        }
    }
}

let areAllEven = [1, 2, 3, 4].allSatisfy2 { $0 % 2 == 0 }   // false
let areAllOneDigit = [1, 2, 3, 4].allSatisfy2 { $0 < 10 }   // true
```

注意，使用 withoutActuallyEscaping 后，你就进入了 Swift 中不安全的领域。让闭包的复制从 withoutActuallyEscaping 调用的结果中逃逸的话，会造成不确定的行为。

## 参考文献

1. [Chris Eidhof, Ole Begemann, Airspeed Velocity. Swift 进阶 (第4版).](https://objccn.io/products/advanced-swift/)
