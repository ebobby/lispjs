////////////////////////////////////////////////////////////////////////////////////////////
// Very simple Lisp on Javascript system
// Author: Francisco Soto <ebobby@ebobby.org>
////////////////////////////////////////////////////////////////////////////////////////////
var Lisp = (function () {
    // This is what a cons cell is like.
    function _cell (car, cdr) {
        this.car = car;
        this.cdr = cdr;
    }

    // js lisp read, transforms arrays to cons cells.
    function read (exp) {
        if (Array.isArray(exp)) {
            if (exp.length == 0) {
                return null;
            }

            return cons(read(exp[0]), read(exp.slice(1)));
        }
        else {
            return exp;
        }
    }

    // js lisp print, transforms cons cells into arrays and rely on js printer.
    function print (sexp, acc) {
        if (sexp === null) {
            if (acc) {
                return acc;
            }

            return null;
        }

        if (atom(sexp)) {
            if (acc) {
                acc.push(".");
                acc.push(sexp);
                return acc;
            }

            return sexp;
        }
        else {
            if (acc) {
                acc.push(print(car(sexp)));
                return print(cdr(sexp), acc);
            }

            return print(cdr(sexp), [ print(car(sexp)) ] );
        }
    }

    // evaluate lisp expressions
    function eval (sexp) {

        if (atom(sexp)) {
            return sexp;
        }

        if (atom(car(sexp))) {
            // Function calls
            if (eq(car(sexp), "atom"))   { return atom(eval(car(cdr(sexp)))); }
            if (eq(car(sexp), "eq"))     { return eq(eval(car(cdr(sexp))), eval(car(cdr(cdr(sexp))))); }
            if (eq(car(sexp), "car"))    { return car(eval(car(cdr(sexp)))); }
            if (eq(car(sexp), "cdr"))    { return cdr(eval(car(cdr(sexp)))); }
            if (eq(car(sexp), "cons"))   { return cons(eval(car(cdr(sexp))), eval(car(cdr(cdr(sexp))))); }

            // Special forms
            if (eq(car(sexp), "progn"))  { return eval_progn(cdr(sexp)); }
            if (eq(car(sexp), "quote"))  { return car(cdr(sexp)); }
            if (eq(car(sexp), "cond"))   { return eval_conditions(cdr(sexp)); }
        }

        throw "Can't evaluate.";
    }

    // evaluate the conditions lists for "cond".
    function eval_conditions(conditions) {
        if (conditions === null) {
            return null;
        }

        if (eval(car(car(conditions)))) {
            return eval(car(cdr(car(conditions))));
        }
        else {
            return eval_conditions(cdr(conditions));
        }
    }

    function eval_progn(forms, last) {
        if (forms === null) {
            return last;
        }
        else {
            return eval_progn(cdr(forms), eval(car(forms)));
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Base Lisp functions
    ////////////////////////////////////////////////////////////////////////////////
    function cons (car, cdr) {
        return new _cell(car, cdr);
    }

    function car (obj) {
        return obj.car;
    }

    function cdr (obj) {
        return obj.cdr;
    }

    function atom (exp) {
        return !(exp instanceof _cell);
    }

    function eq (obj1, obj2) {
        return obj1 === obj2;
    }

    // The system public interface.
    return {
        eval: function (exp) {
            return print(eval(read(exp)));
        }
    }
})();
