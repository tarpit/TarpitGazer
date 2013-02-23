function K(x) {
    return function (y) {
        return x;
    }
}

function S(x) {
    return function (y) {
        return function (z) {
            return x(z)(y(z));
        }
    }
}

function compile_jot(s) {
    if(s.length > 1) {
        F = compile_jot(s.substr(0, s.length - 1));

        if(s[s.length - 1] == '0') {
            return F(S)(K);
        }
        else if(s[s.length - 1] == '1') {
            return S(K(F));
        }
        else {
            console.error("Error parsing " + s);
        }
    }
    else return S(K)(K); // I
}

function K_cps(x, k) {
    return k(function (y, k) {
        return k(x);
    });
}

function S_cps(x, k) {
    return k(function (y, k) {
        return k(function (z, k) {
            return x(z, function (xx) {
                return y(z, function (yy) {
                    return xx(yy, k);
                });
            });
        });
    });
}

