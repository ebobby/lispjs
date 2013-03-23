////////////////////////////////////////////////////////////////////////////////////////////
// Very simple Lisp on Javascript system
// Author: Francisco Soto <ebobby@ebobby.org>
////////////////////////////////////////////////////////////////////////////////////////////
var Lisp = (function () {
    ////////////////////////////////////////////////////////////////////////////////
    // Lisp internal functions
    ////////////////////////////////////////////////////////////////////////////////

    function clone (obj) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = obj[attr];
            }
        }
        return copy;
    }

    // Is this a valid atom?
    function valid_or_self_evaluating_atom (atom) {
        if (eq(atom, null)) return true;
        if (functionp(atom)) return true;
        if (eq(typeof(atom), "number")) return true;
        if (eq(typeof(atom), "boolean")) return true;

        return false;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Lisp data types (we also support some javascript data types)
    ////////////////////////////////////////////////////////////////////////////////

    var Objects = {
        cons_cell: function (car, cdr) {
            this.car = car;
            this.cdr = cdr;
        },
        lambda: function (lambda_list, body, env) {
            env = clone(env);            // We do not want to overwrite other functions environments
            body = cons("progn", body);  // lambda body has an implicit progn

            return function () {
                function process_env(lambda_list, index, lambda_arguments) {
                    if (eq(lambda_list, null)) {
                        if (index < lambda_arguments.length) {
                            throw "Invalid number of arguments!";
                        }

                        return;
                    }

                    if (!eq(lambda_list, null) && eq(index, lambda_arguments.length)) {
                        throw "Invalid number of arguments!";
                    }

                    // set the argument variable in the environment to the passed value.
                    env[car(lambda_list)] = lambda_arguments[index];
                    process_env(cdr(lambda_list), ++index, lambda_arguments);
                }

                process_env(lambda_list, 0, arguments);  // Add the parameters to the function environment
                return leval(body, env);                 // eval the function body inside the lexical environment and arguments

            };
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

    function functionp (obj) {
        return eq(typeof(obj), "function");
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Lisp system (read/eval/print)
    ////////////////////////////////////////////////////////////////////////////////

    // Evaluate special form cond
    function eval_cond (sexp, env) {
        function eval_conditions(conditions) {
            if (eq(conditions, null)) {
                return null;
            }

            if (leval(car(car(conditions)), env)) {
                return leval(car(cdr(car(conditions))), env);
            }
            else {
                return eval_conditions(cdr(conditions));
            }
        }

        return eval_conditions(cdr(sexp));
    }

    // Evaluate special form progn
    function eval_progn(sexp, env) {
        function eval_forms(forms, last) {
            if (eq(forms, null)) {
                return last;
            }
            else {
                return eval_forms(cdr(forms), leval(car(forms), env));
            }
        }

        return eval_forms(cdr(sexp), null);
    }

    // Eval special form lambda
    function eval_lambda(sexp, env) {
        if (atom(car(cdr(sexp))) ||     // no argument list
            eq(cdr(cdr(sexp)), null)) { // no body
            throw "Invalid lambda form.";
        }

        return Objects.lambda(car(cdr(sexp)), cdr(cdr(sexp)), env);
    }

    // Eval a function invocation
    function eval_func_invoke(func, params, env) {
        function eval_params(args, evaled_args) {
            if (eq(args, null)) {
                return evaled_args;
            }

            evaled_args.push(leval(car(args), env));
            return eval_params(cdr(args), evaled_args);
        }

        if (!functionp(func)) {
            throw "Invalid function call!";
        }

        return func.apply(null, eval_params(params, []));
    }

    // eval is a reserved word so we call this leval instead.
    function leval (sexp, env) {
        env = env || {}; // null lexical environment

        if (atom(sexp)) {
            if (env.hasOwnProperty(sexp)) {
                return env[sexp];
            }

            if (valid_or_self_evaluating_atom(sexp)) {
                return sexp;
            }

            throw "Unknown symbol: " + sexp;
        }

        if (atom(car(sexp))) {
            // Function calls
            if (eq(car(sexp), "atom"))      { return atom(leval(car(cdr(sexp)), env)); }
            if (eq(car(sexp), "car"))       { return car(leval(car(cdr(sexp)), env)); }
            if (eq(car(sexp), "cdr"))       { return cdr(leval(car(cdr(sexp)), env)); }
            if (eq(car(sexp), "functionp")) { return functionp(leval(car(cdr(sexp)), env)); }
            if (eq(car(sexp), "eq"))        { return eq(leval(car(cdr(sexp)), env), leval(car(cdr(cdr(sexp))), env)); }
            if (eq(car(sexp), "cons"))      { return cons(leval(car(cdr(sexp)), env), leval(car(cdr(cdr(sexp))), env)); }

            // Special forms
            if (eq(car(sexp), "quote"))  { return car(cdr(sexp)); }
            if (eq(car(sexp), "progn"))  { return eval_progn(sexp, env); }
            if (eq(car(sexp), "cond"))   { return eval_cond(sexp, env); }
            if (eq(car(sexp), "lambda")) { return eval_lambda(sexp, env); }
        }

        // Common Lisp like restriction, only lambdas can be executed as inmediate call,
        // not allowing functions to return functions to be executed (use funcall).
        if (eq(car(car(sexp)), "lambda")) {
            return eval_func_invoke(leval(car(sexp), env), cdr(sexp), env);
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
        run: function (exp) {
            return print(leval(read(exp)));
        }
    };
})();
