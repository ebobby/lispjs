lisp.js - A simple lisp implementation in Javascript
===

This has no practical use whatsoever is just a simple artifact out of exploratory programming. I wanted to see how simple was to implement a Lisp and I decided to use Javascript for it because using Lisp to create a Lisp is just too easy and because I happen to enjoy Javascript.

The code is simple and clean enough so it can be read and understood if you are curious about Lisp and language implementation but I am not a compiler/interpreter programmer by any means so I am not sure if this code can be used as a reference for that matter.

I wrote this README just to make clear what the "interpreter" can do. Again, this has as much practical use as [brain fuck](http://en.wikipedia.org/wiki/Brainfuck).

## Syntax

I cheated on the syntax front and decided that to keep things simple I would not parse strings, so this interpreter takes Javascript arrays instead and reads them into cons cells. Also, since Javascript doesn't have symbols so I used strings as replacements. There are no literal strings in this Lisp.

Normal Lisp:

```Lisp
(cons 1 2) => (1 . 2)
```

This Lisp:

```Javascript
Lisp.run([ "cons", 1, 2 ]) => [ 1, ".", 2 ]
```

## Special forms

### quote

Returns whatever is passed to it without evaluation.

```Javascript
> Lisp.run( "x" )
Unknown symbol: x
> Lisp.run( [ "quote", "x" ] )
'x'
> Lisp.run( [1, 2] )
Can't evaluate.
> Lisp.run( [ "quote", [1, 2] ] )
[ 1, 2 ]
```

### progn

Evaluates a group of expressions and returns the value of the last one.

```Javascript
> Lisp.run( [ "progn" ] )
null
> Lisp.run( [ "progn", [ "cons", 1, null ] ] )
[ 1 ]
> Lisp.run( [ "progn", [ "cons", 1, null ], [ "cons", 2, null ] ] )
[ 2 ]
```

### cond

Conditional evaluation. Evaluates the first elements of the given forms in sequence, when one of them is not null, evaluates the second part and returns it.

```Javascript
> Lisp.run( [ "cond" ] )
null
> Lisp.run( [ "cond", [ false, [ "quote", "one" ] ] ] )
null
> Lisp.run( [ "cond", [ false, [ "quote", "one" ] ],
                      [ true,  [ "quote", "second" ] ] ])
'second'
> Lisp.run( [ "cond", [ false, [ "quote", "one" ] ],
                      [ false,  [ "quote", "second" ] ],
                      [ [ "eq", 1, 1 ], [ "quote", "third" ] ] ])
'third'
```

### lambda

Builds a function object. Lambdas can be invoked when they are the first part of an expression. Closures are supported since lambdas have access to the lexical environment that surrounds them.

```Javascript
> Lisp.run( [ "lambda", [ "x" ], "x" ] )
[Function]
> Lisp.run([ [ "lambda", [ "x" ], "x" ],  1 ])
1
> Lisp.run([ [ "lambda", [ "x" ], "x" ],  [ "quote", "hello, world" ] ])
'hello, world'
> Lisp.run( [ [ "lambda", [ "x" ],
               [ "cons", "x", [ "cons", "y", null ] ] ], [ "quote", "hello, " ] ])
Unknown symbol: y
> Lisp.run([ [ "lambda", [ "y" ],
               [ [ "lambda", [ "x" ],
                 [ "cons", "x", [ "cons", "y", null ] ] ], [ "quote", "hello, " ] ] ], [ "quote", "world" ] ])
[ 'hello, ', 'world' ]
```

## Functions

### cons

Builds a cons cell with the given parameters, cons cells can be chained into lists and trees.

```Javascript
> Lisp.run( [ "cons", 1, 2 ] )
[ 1, '.', 2 ]
> Lisp.run( [ "cons", 1, null ] )
[ 1 ]
> Lisp.run( [ "cons", 1, [ "cons", 2, [ "cons", 3, null ] ] ])
[ 1, 2, 3 ]
```

### car

Returns the first value stored in a cons cell.

```Javascript
> Lisp.run( [ "car", [ "cons", 2, 1 ] ] )
2
> Lisp.run( [ "car", [ "quote", [ 1, 2, 3 ] ] ] )
1
> Lisp.run( [ "car", [ "quote", [ 3 ] ] ] )
3
```

### cdr

Returns the second value stored in a cons cell.

```Javascript
> Lisp.run( [ "cdr", [ "cons", 2, 1 ] ] )
1
> Lisp.run( [ "cdr", [ "quote", [ 1, 2, 3 ] ] ] )
[ 2, 3 ]
> Lisp.run( [ "cdr", [ "quote", [ 3 ] ] ] )
null
```

### atom

Returns true if the argument is not a cons cell.

```Javascript
> Lisp.run( [ "atom", 1 ] )
true
> Lisp.run( [ "atom", [ "quote", [ 1, 2 ] ] ] )
false
> Lisp.run( [ "atom", [ "cons", 1, 2 ] ] )
false
```

### eq

Returns true if both atoms are the same atom.

```Javascript
> Lisp.run( [ "eq", 1, 1 ] )
true
> Lisp.run( [ "eq", 1, 2 ] )
false
> Lisp.run( [ "eq", [ "quote", "x" ], 2 ] )
false
> Lisp.run( [ "eq", [ "quote", "x" ], [ "quote", "x" ] ] )
true
```

### functionp

Returns true if argument is a function.

```Javascript
> Lisp.run( [ "functionp", 1 ])
false
> Lisp.run( [ "functionp", [ "quote", "x" ] ])
false
> Lisp.run( [ "functionp", [ "lambda", [ "x" ], "x" ] ])
true
```

### apply

Calls a function using the given list as arguments for it.

```Javascript
> Lisp.run( [ "apply", [ "lambda", ["x"], "x" ], [ "quote", [ 1 ] ] ])
1
> Lisp.run( [ "apply", [ "lambda", ["x", "y"], [ "cons", "y", "x" ] ], [ "quote", [ 1 ] ] ])
Invalid number of arguments!
> Lisp.run( [ "apply", [ "lambda", ["x", "y"], [ "cons", "y", "x" ] ], [ "quote", [ 1, 2 ] ] ])
[ 2, '.', 1 ]
```

## Final remarks

That's pretty much it, enjoy.
