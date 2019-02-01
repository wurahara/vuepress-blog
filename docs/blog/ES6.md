---
title: ES2015新特性概述
date: 2017-08-16 15:56:48
tags: [JavaScript, ECMAScript6]
---
本文部分翻译自[Babel Learn ES2015](https://babeljs.io/learn-es2015/ "Source")，简单罗列了ES2015的一些新特性和新功能。

<!-- more -->

## 箭头函数和词法作用域 (Arrows and Lexical This)

箭头函数是以`=>`形式缩写的常规函数。箭头函数和其环境代码有相同的`this`字面量。（函数体内的`this`对象，绑定定义时所在的对象，而不是使用时所在的对象。）如果一个箭头函数出现在另一个函数的函数体内，该箭头函数和其父函数有共同的`arguments`变量。

```JavaScript
// 表达式形式
var odds = evens.map(v => v + 1);
var nums = evens.map((v, i) => v + i);

// 函数体形式
nums.forEach(v => {
  if (v % 5 === 0)
    fives.push(v);
});

// this词法作用域
var bob = {
  _name: "Bob",
  _friends: [],
  printFriends() {
    this._friends.forEach(f =>
      console.log(this._name + " knows " + f));
  }
};

// arguments词法作用域
function square() {
  let example = () => {
    let numbers = [];
    for (let number of arguments) {
      numbers.push(number * number);
    }

    return numbers;
  };

  return example();
}

square(2, 4, 7.5, 8, 11.5, 21); // returns: [4, 16, 56.25, 64, 132.25, 441]
```

## 类 (Classes)

ES2015 中的类只是传统的基于原型的面向对象模式的语法糖。类支持基于原型的继承、上层调用、实例生成、静态方法和构造器。

```JavaScript
class SkinnedMesh extends THREE.Mesh {
  constructor(geometry, materials) {
    super(geometry, materials);

    this.idMatrix = SkinnedMesh.defaultMatrix();
    this.bones = [];
    this.boneMatrices = [];
    //...
  }
  update(camera) {
    //...
    super.update();
  }
  static defaultMatrix() {
    return new THREE.Matrix4();
  }
}
```

## 强化的对象字面量 (Enhanced Object Literals)

对象字面量在 ES2015 中得到进一步的强化，现在允许在构造时设定原型，简化像`foo: foo`这样的赋值操作，定义方法和上级调用。从这个层面上看，对象声明和类声明越来越接近。

```JavaScript
var obj = {
    // 设定原型. "__proto__" 或者 '__proto__' 都可以
    __proto__: theProtoObj,
    // 计算属性式的写法不会设定原型名，也不会触发早期错误
    ['__proto__']: somethingElse,
    // ‘handler: handler’形式的缩写
    handler,
    // 方法
    toString() {
     // 上层调用(Super call)
     return "d " + super.toString();
    },
    // 计算属性（动态属性）
    [ "prop_" + (() => 42)() ]: 42
};
```

## 模板字符串 (Template Strings)

模板字符串提供了一个语法糖，在字符串构造时提供更大的便利。字符串中可以加入自定义标签，可以防止注入攻击，也可以用字符串构造更高级的数据结构。

```JavaScript
// 基本的模板字符串创建
`This is a pretty little template string.`

// 多行字符串
`In ES5 this is
 not legal.`

// 变量绑定插值
var name = "Bob", time = "today";
`Hello ${name}, how are you ${time}?`

// 模板字符串中不会使用转义
String.raw`In ES5 "\n" is a line-feed.`

// 创建一个HTTP请求头的模板字符串，使用插值替换内容
GET`http://foo.org/bar?a=${a}&b=${b}
    Content-Type: application/json
    X-Credentials: ${credentials}
    { "foo": ${foo},
      "bar": ${bar}}`(myOnReadyStateChangeHandler);
```

## 解构 (Destructuring)

解构赋值允许数组或任意对象通过模式匹配进行绑定。

```JavaScript
// 数组匹配
var [a, ,b] = [1,2,3];
a === 1;
b === 3;

// 对象匹配
var { op: a, lhs: { op: b }, rhs: c }
       = getASTNode()

// 对象匹配缩写
// 绑定当前作用域内的 `op`, `lhs` 和 `rhs`
var {op, lhs, rhs} = getASTNode()

// 可以在参数传递时使用
function g({name: x}) {
  console.log(x);
}
g({name: 5})

// 解构的失效弱化(fail-soft)
var [a] = [];
a === undefined;

// 失效弱化与默认值
var [a = 1] = [];
a === 1;

// 解构赋值和默认参数
function r({x, y, w = 10, h = 10}) {
  return x + y + w + h;
}
r({x:1, y:2}) === 23
```

## 默认参数 (Default)、不定参数 (Rest) 和对象展开运算符 (Spread)

调用具有默认参数的函数，将数组转换为函数参数，将连续的函数参数转换为数组。不定参数功能让我们不再需要`arguments`变量。

```JavaScript
function f(x, y=12) {
  // 没有参数传入或传入undefined时，y的值为12
  return x + y;
}
f(3) == 15
```

```JavaScript
function f(x, ...y) {
  // y是个数组
  return x * y.length;
}
f(3, "hello", true) == 6
```

```JavaScript
function f(x, y, z) {
  return x + y + z;
}
// 将数组的各元素展开为函数的参数
f(...[1,2,3]) == 6
```

## let 和 const 关键字

具有块级作用域的`let`可以代替`var`的使用。`const`仅允许一次赋值。

```JavaScript
function f() {
  {
    let x;
    {
      // 可以这样写，因为在块级作用域内
      const x = "sneaky";
      // 不能这样写，应为在当前作用域内x为常量
      x = "foo";
    }
    // 可以这样写，因为在当前作用域内x由let定义
    x = "bar";
    // 不能这样写，因为x在当前作用域内已被声明过
    let x = "inner";
  }
}
```

## 迭代器和 for..of 语法 (Iterators + For..Of)

可迭代对象允许像 CLR IEnumerable 或者 Java Iterable 一样自定义迭代器。将`for..in`转换为自定义的基于迭代器的形如`for..of`的迭代，不需要实现一个数组，支持像 LINQ 一样的惰性设计模式。

```JavaScript
let fibonacci = {
  [Symbol.iterator]() {
    let pre = 0, cur = 1;
    return {
      next() {
        [pre, cur] = [cur, pre + cur];
        return { done: false, value: cur }
      }
    }
  }
}

for (var n of fibonacci) {
  // 循环将在 n > 1000 时结束
  if (n > 1000)
    break;
  console.log(n);
}
```

## 生成器函数 (Generators)

生成器通过使用`function*`和 yield 关键字简化了迭代器的设定。一个通过`function*`声明的函数会返回一个 Generator 实例。生成器是迭代器包含额外的`next`和`throw`方法的子类型。这些特性使得值可以流回 Generator，所以`yield`是一个可以返回（或抛出）值的表达式。

此外，生成器函数也可以用于编写`await`式的异步逻辑，详见ES7的[await部分](https://github.com/lukehoban/ecmascript-asyncawait "await")。

```JavaScript
var fibonacci = {
  [Symbol.iterator]: function*() {
    var pre = 0, cur = 1;
    for (;;) {
      var temp = pre;
      pre = cur;
      cur += temp;
      yield cur;
    }
  }
}

for (var n of fibonacci) {
  // 循环将在 n > 1000 时结束
  if (n > 1000)
    break;
  console.log(n);
}
```
## Unicode 字符支持

新增了一系列的特性来完整支持 Unicode，包括字符串中的 Unicode 字面量和新的正则表达式 u 模式。此外，还增加了处理 21bit 代码点的字符串的新的 API。这些新特性能辅助构件 JavaScript 的国际化应用。

```JavaScript
// 和ES5.1相同的写法
"𠮷".length == 2

// 新的正则写法，使用u模式
"𠮷".match(/./u)[0].length == 2

// 新的Unicode格式
"\u{20BB7}" == "𠮷" == "\uD842\uDFB7"

// 新的字符串方法
"𠮷".codePointAt(0) == 0x20BB7

// for-of 迭代
for(var c of "𠮷") {
  console.log(c);
}
```

## 模块支持 (Modules)

首次在语言层面支持模块和组件定义。部分借鉴了现下流行的模块加载机制 (AMD, CommonJS)。隐式异步模型允许懒加载，即在获取和加载所需模块前代码不会执行。

```JavaScript
// lib/math.js
export function sum(x, y) {
  return x + y;
}
export var pi = 3.141593;
```

```JavaScript
// app.js
import * as math from "lib/math";
console.log("2π = " + math.sum(math.pi, math.pi));
```

```JavaScript
// otherApp.js
import {sum, pi} from "lib/math";
console.log("2π = " + sum(pi, pi));
```

还有一些额外的功能，比如`export default`和`export *`：

```JavaScript
// lib/mathplusplus.js
export * from "lib/math";
export var e = 2.71828182846;
export default function(x) {
    return Math.exp(x);
}
```

```JavaScript
// app.js
import exp, {pi, e} from "lib/mathplusplus";
console.log("e^π = " + exp(pi));
```

## 新数据结构 (Map, Set, WeakMap and WeakSet)

ES6为常见的算法提供更强有力的数据结构，其中WeakMaps提供了针对对象的弱引用。

```JavaScript
// Sets
var s = new Set();
s.add("hello").add("goodbye").add("hello");
s.size === 2;
s.has("hello") === true;

// Maps
var m = new Map();
m.set("hello", 42);
m.set(s, 34);
m.get(s) == 34;

// Weak Maps
var wm = new WeakMap();
wm.set(s, { extra: 42 });
wm.size === undefined

// Weak Sets
var ws = new WeakSet();
ws.add({ data: 42 });
// 传入的对象没有其他引用，将不会被set保存
```

## 代理 (Proxies)

代理对象允许创建一个对象，该对象拥有目标对象的所有行为。代理对象功能可以用于拦截、对象虚拟化、日志记录分析等场合。

```JavaScript
// 代理一个普通对象
var target = {};
var handler = {
  get: function (receiver, name) {
    return `Hello, ${name}!`;
  }
};

var p = new Proxy(target, handler);
p.world === "Hello, world!";
```

```JavaScript
// 代理一个函数对象
var target = function () { return "I am the target"; };
var handler = {
  apply: function (receiver, ...args) {
    return "I am the proxy";
  }
};

var p = new Proxy(target, handler);
p() === "I am the proxy";
```

代理还提供了一些针对运行时元操作(_runtime-level meta-operations_)的`traps`:

```JavaScript
var handler =
{
  // target.prop
  get: ...,
  // target.prop = value
  set: ...,
  // 'prop' in target
  has: ...,
  // delete target.prop
  deleteProperty: ...,
  // target(...args)
  apply: ...,
  // new target(...args)
  construct: ...,
  // Object.getOwnPropertyDescriptor(target, 'prop')
  getOwnPropertyDescriptor: ...,
  // Object.defineProperty(target, 'prop', descriptor)
  defineProperty: ...,
  // Object.getPrototypeOf(target), Reflect.getPrototypeOf(target),
  // target.__proto__, object.isPrototypeOf(target), object instanceof target
  getPrototypeOf: ...,
  // Object.setPrototypeOf(target), Reflect.setPrototypeOf(target)
  setPrototypeOf: ...,
  // for (let i in target) {}
  enumerate: ...,
  // Object.keys(target)
  ownKeys: ...,
  // Object.preventExtensions(target)
  preventExtensions: ...,
  // Object.isExtensible(target)
  isExtensible :...
}
```

::: warning 警告：不支持的特性
由于 ES5 的功能限制，代理对象无法通过 **Babel** 转换或使用 **polufill** 兼容。
:::

## 符号类型 (Symbols)

`Symbol`类型允许对对象状态进行访问控制。符号类型允许通过`string`或`symbol`类型来指定对象的属性。`Symbol`类型是 JavaScript 的一个新的基本数据类型。`Symbol`的`name`参数一般用于调试，但并不作为`Symbol`类型的一部分。`Symbol`实例都是唯一的，但并非私有，可以使用类似`Object.getOwnPropertySymbols`的方法暴露。

```JavaScript
(function() {

  // 模块域内的Symbol
  var key = Symbol("key");

  function MyClass(privateData) {
    this[key] = privateData;
  }

  MyClass.prototype = {
    doStuff: function() {
      ... this[key] ...
    }
  };

  // 被Babel部分支持，原生环境可以完全实现
  typeof key === "symbol"
})();

var c = new MyClass("hello")
c["key"] === undefined
```

::: warning 注意：部分支持的特性
通过 **Babel** 的 **polyfill** 可以部分转换该功能，还有一部分功能由于语言限制无法被转换实现。
:::

## 可子类化内建对象 (Subclassable Built-ins)

在 ES6 中，内建属性和方法，比如`Array`，`Date`和DOM `Element`都可以被子类化。

```JavaScript
// Array子类化
class MyArray extends Array {
    constructor(...args) { super(...args); }
}

var arr = new MyArray();
arr[1] = 12;
arr.length == 2
```

## 几种数据类型的新 API (Math, Number, String and Object new APIs)

新增了很多库函数支持，比如`Math`核心库，数组转换辅助函数和用于对象拷贝的`Object.assign`。

```JavaScript
Number.EPSILON
Number.isInteger(Infinity) // false
Number.isNaN("NaN") // false

Math.acosh(3) // 1.762747174039086
Math.hypot(3, 4) // 5
Math.imul(Math.pow(2, 32) - 1, Math.pow(2, 32) - 2) // 2

"abcde".includes("cd") // true
"abc".repeat(3) // "abcabcabc"

Array.from(document.querySelectorAll("*")) // 返回一个真实的的Array
Array.of(1, 2, 3) // 类似 new Array(...),但单参数时表现不同
[0, 0, 0].fill(7, 1) // [0,7,7]
[1,2,3].findIndex(x => x == 2) // 1
["a", "b", "c"].entries() // 迭代器 [0, "a"], [1,"b"], [2,"c"]
["a", "b", "c"].keys() // 迭代器 0, 1, 2
["a", "b", "c"].values() // 迭代器 "a", "b", "c"

Object.assign(Point, { origin: new Point(0,0) })
```

::: warning 注意：部分支持的特性
大部分API都可以通过 **Babel** 的 **polyfill** 支持，但是仍有一些特性因为种种原因未能实现（比如`String.prototype.normalize`的实现需要大量额外代码的支持）。
:::

## 二进制和八进制字面量 (Binary and Octal Literals)

新增了支持二进制(`b`)和八进制(`o`)的数字字面量。

```JavaScript
0b111110111 === 503 // true
0o767 === 503 // true
```
::: warning 注意：部分支持的特性 
**Babel** 只支持转换字面量格式，即可以转换`0o767`，并不能转换`Number("0o767")`。
:::
## Promise

Promise是一个用于异步编程的代码库。

```JavaScript
function timeout(duration = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    })
}

var p = timeout(1000).then(() => {
    return timeout(2000);
}).then(() => {
    throw new Error("hmm");
}).catch(err => {
    return Promise.all([timeout(100), timeout(200)]);
})
```

## 反射 API (Reflect API)

反射 API 暴露了对象的运行时元操作 (runtime-level meta-operations)。这实际上是代理 API 的逆操作，允许调用相应的的元操作，比如代理 traps。

```JavaScript
var O = {a: 1};
Object.defineProperty(O, 'b', {value: 2});
O[Symbol('c')] = 3;

Reflect.ownKeys(O); // ['a', 'b', Symbol(c)]

function C(a, b){
  this.c = a + b;
}
var instance = Reflect.construct(C, [20, 22]);
instance.c; // 42
```

## 尾递归调用 (Tail Calls)

新特性保证尾部调用不会使得栈区无限制的增长，这保证了在不定长输入时调用递归算法的安全性。

```JavaScript
function factorial(n, acc = 1) {
    "use strict";
    if (n <= 1) return acc;
    return factorial(n - 1, n * acc);
}

// 大部分语言实现下会出现栈溢出错误，但是在ES6中任意数值都是安全的
factorial(100000)
```

## 参考文献

1. [Learn ES2015, Babel.](https://babeljs.io/docs/en/learn/)
