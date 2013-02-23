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

function eval_jot(s) {
    if(s.length > 1) {
        F = eval_jot(s.substr(0, s.length - 1));

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

function eval_jot_cps(s, k) {
    if(s.length > 1) {
        return eval_jot_cps(
            s.substr(0, s.length - 1),
            function(F) {
                if(s[s.length - 1] == '0') {
                    return F(S_cps, function (FS) { return FS(K_cps, k); });
                }
                else if(s[s.length - 1] == '1') {
                    return K_cps(F, function (KF) { return S_cps(KF, k); });
                }
                else {
                    console.error("Error parsing " + s);
                }
            });
    }
    else return S_cps(K_cps, function (SK) { return SK(K_cps, k); }); // I
}

function encode_jot(s) {
    var x = 0.5;
    var y = 0.25;
    for(var i = 0; i < s.length; i++) {
        if(s[i] == '0') {
            x -= y;
        }
        else if(s[i] == '1') {
            x += y;
        }
        y /= 2;
    }
    return x;
}

function decode_jot(x) {
    var s = '';
    var y = 0.5;
    var z = 0.25;

    //console.info(x);
    while(x != y) {
        //console.info(y);
        if(x > y) {
            s += '1';
            y += z;
        }
        else if(x < y) {
            s += '0';
            y -= z;
        }
        z /= 2;
    }
    //console.info(y);

    return s;
}
