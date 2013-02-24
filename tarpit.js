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
    // This is cheating, but it makes us more robust to errors.
    if(x <= 0 || x >= 1) {
        return '';
    }

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

function K_cpst(x, k) {
    return function () {
        return k(function (y, k) {
            return function () {
                return k(x);
            }
        });
    }
}

function S_cpst(x, k) {
    return function() {
        return k(function (y, k) {
            return function () {
                return k(function (z, k) {
                    return function () {
                        return x(z, function (xx) {
                            return function () {
                                return y(z, function (yy) {
                                    return function () { return xx(yy, k); }
                                });
                            }
                        })
                    };
                })
            };
        })
    };
}

function eval_jot_cpst(s, k) {
    if(s.length > 1) {
        return function () {
            return eval_jot_cpst(
                s.substr(0, s.length - 1),
                function(F) {
                    if(s[s.length - 1] == '0') {
                        return function () {
                            return F(S_cpst, function (FS) { 
                                return function () { return FS(K_cpst, k); } 
                            });
                        }
                    }
                    else if(s[s.length - 1] == '1') {
                        return function () {
                            return K_cpst(F, function (KF) {
                                return function () { return S_cpst(KF, k); }
                            });
                        }
                    }
                    else {
                        console.error("Error parsing " + s);
                    }
                });
        }
    }
    else return function () {
        return S_cpst(K_cpst, function (SK) {
            return function () { return SK(K_cpst, k); }
        });
    }
}

function drive_cpst(p, limit) {
    var count = 0;
    var done = false;
    var thunk = eval_jot_cpst(p, function (x) {
        //alert("done!");
        return function () { done = true; }
    });
    while(count < limit && !done) {
        //console.info(thunk);
        thunk = thunk();
        count++;
    }
    return count;
}


// These functions are adapted from http://en.wikipedia.org/wiki/Hilbert_curve

//convert (x,y) to d
function xy2d(n, x, y) {
    var rx, ry, s, d=0;

    function rot() {
        if (ry == 0) {
            if (rx == 1) {
                x = n-1 - x;
                y = n-1 - y;
            }
            
            //Swap x and y
            var t = x;
            x = y;
            y = t;
        }
    }
    
    for (s=n/2; s>0; s/=2) {
        rx = (x & s) > 0;
        ry = (y & s) > 0;
        d += s * s * ((3 * rx) ^ ry);
        rot();
    }
    return d;
}

// And here's my own drawing function
function render(c) {
    //alert("hi");
    var ctx = c.getContext("2d");
    
    var limit = 200;
    var N = 32;
    var w = c.width / N;

    var log2 = Math.log(2);

    for(var i = 0; i < N; i++) {
        for(var j = 0; j < N; j++) {
            //console.info("" + i + ", " + j);
            var p = xy2d(N, i, j);
            //console.info(p);
            p /= N * N;
            p = decode_jot(p);
            //console.info("Evaluating " + p);
            var c = drive_cpst(p, limit);
            //console.info("" + p + " " + c);
            if(c < limit) {
                c /= limit;
                //c = Math.log(c + 1);
                c = Math.log(c + 1) / log2;
                c = Math.floor(c * 256);
                ctx.fillStyle = "rgb(" + c + ", " + c + ", " + c + ")";
            }
            else {
                ctx.fillStyle = "#FF0000";
            }

            ctx.fillRect(i * w, j * w, (i + 1) * w, (j + 1) * w);
        }
    }
}
