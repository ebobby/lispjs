////////////////////////////////////////////////////////////////////////////////////////////
// Very simple Lisp on Javascript system
// Author: Francisco Soto <ebobby@ebobby.org>
////////////////////////////////////////////////////////////////////////////////////////////
var Lisp = (function () {
    ////////////////////////////////////////////////////////////////////////////////
    // Lisp objects
    ////////////////////////////////////////////////////////////////////////////////
    var Objects = {
        cons_cell: function (car, cdr) {
            this.car = car;
            this.cdr = cdr;
        }
    };

    ////////////////////////////////////////////////////////////////////////////////
    // Lisp primitives
    ////////////////////////////////////////////////////////////////////////////////
    function cons (car, cdr) {
        return new Objects.cons_cell(car, cdr);
    }

    function car (obj) {
        return obj.car;
    }

    function cdr (obj) {
        return obj.cdr;
    }

    function atom (exp) {
        return !(exp instanceof Objects.cons_cell);
    }

    function eq (obj1, obj2) {
        return obj1 === obj2;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Lisp system (read/eval/print)
    ////////////////////////////////////////////////////////////////////////////////

    // Evaluate special form cond
    function eval_cond (sexp) {
        function eval_conditions(conditions) {
            if (conditions === null) {
                return null;
            }

            if (leval(car(car(conditions)))) {
                return leval(car(cdr(car(conditions))));
            }
            else {
                return eval_conditions(cdr(conditions));
            }
        }

        return eval_conditions(cdr(sexp));
    }

    // Evaluate special form progn
    function eval_progn(sexp) {
        function eval_forms(forms, last) {
            if (forms === null) {
                return last;
            }
            else {
                return eval_forms(cdr(forms), leval(car(forms)));
            }
        }

        return eval_forms(cdr(sexp), null);
    }

    function leval (sexp) { // eval is a reserved word so we call this leval instead.
        if (atom(sexp)) {
            return sexp;
        }

        if (atom(car(sexp))) {
            // Function calls
            if (eq(car(sexp), "atom"))   { return atom(leval(car(cdr(sexp)))); }
            if (eq(car(sexp), "car"))    { return car(leval(car(cdr(sexp)))); }
            if (eq(car(sexp), "cdr"))    { return cdr(leval(car(cdr(sexp)))); }
            if (eq(car(sexp), "eq"))     { return eq(leval(car(cdr(sexp))), leval(car(cdr(cdr(sexp))))); }
            if (eq(car(sexp), "cons"))   { return cons(leval(car(cdr(sexp))), leval(car(cdr(cdr(sexp))))); }

            // Special forms
            if (eq(car(sexp), "quote"))  { return car(cdr(sexp)); }
            if (eq(car(sexp), "progn"))  { return eval_progn(sexp); }
            if (eq(car(sexp), "cond"))   { return eval_cond(sexp); }
        }

        throw "Can't evaluate.";
    }

    function read (exp) {
        if (Array.isArray(exp)) {
            if (exp.length === 0) {
                return null;
            }

            return cons(read(exp[0]), read(exp.slice(1)));
        }
        else {
            return exp;
        }
    }

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

    ////////////////////////////////////////////////////////////////////////////////
    // Lisp system interface
    ////////////////////////////////////////////////////////////////////////////////
    return {
        eval: function (exp) {
            return print(leval(read(exp)));
        }
    };
})();
