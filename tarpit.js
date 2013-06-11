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

//convert d to (x,y)
// This is adapted from http://bit-player.org/2013/mapping-the-hilbert-curve
function d2xy(d) {
    var pt, t, x, y;

    if(d == 0)
        return [0.5, 0.5];
    else {
        t = Math.floor(d * 4);
        pt = d2xy(d * 4 - t);
        x = pt[0];
        y = pt[1];

        switch(t) {
            case 0:
            return [y * .5, x * .5];
            
            case 1:
            return [x * .5, y * .5 + .5];
            
            case 2:
            return [x * .5 + .5, y * .5 + .5];

            case 3:
            return [y * -.5 + 1, x * -.5 + .5];
        }

        console.info(t);
    }

    console.info("This shouldn't have happened.");
}

// And here's my own drawing function
function render(limit, res) {
    var N = 1 << res;

    var data = new Int32Array(N * N);

    for(var i = 0; i < N; i++) {
        for(var j = 0; j < N; j++) {
            var p = xy2d(N, i, j);
            p /= N * N;
            p = decode_jot(p);
            var c = drive_cpst(p, limit);

            data[i * N + j] = c;
        }
        postMessage({cmd: 'progress', 'percent': i * 100 / N});
    }

    return data;
}

//addEventListener('message', function(m) {
//    var m = m.data;
//    switch(m.cmd) {
//        case 'render':
//        var data = render(m.limit, m.res);
//        postMessage({cmd: 'complete',
//                     'data': data,
//                     limit: m.limit,
//                     res: m.res});
//        break;
//    }
//});

function randomBits(N) {
    var s = ""
    for(var i = 0; i < N; i++) {
        s += Math.floor(Math.random() + 0.5);
    }
    return s;
}

// taken from http://billmill.org/static/canvastutorial/ball.html
function fillCircle(ctx, cx, cy, r) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function startup() { 
    var c = document.getElementById('#tarpit');
    var cx = c.getContext("2d");

    cx.lineWidth = 1;

    var N = 128;
    var limit = 10000;

    var max_radius = c.width / 10;
    var max_len = 1;

    var scale = c.width;

    var old_pos = false;

    function drawPoints() {
        for(var i = 0; i < 100; i++) {
            var length = Math.floor(Math.random() * max_len + 1);
            var prog = randomBits(length);
            
            var count = drive_cpst(prog, limit);
            
            var pos = d2xy(encode_jot(prog));
            
            var color = count / limit;
            color = Math.floor(color * 360);
            
            //cx.fillStyle = "rgba(" + color + ", " + color + ", " + color + ", 0.5)";
            
            if(count == limit)
                cx.fillStyle = "rgb(0, 0, 0)";
            else
                cx.fillStyle = "hsl(" + color + ", 100%, 50%)";

            //cx.strokeStyle = "hsl(" + max_len * 360 / N / N + ", 100%, 50%)";
            
            //if(old_pos != false) {
            //    cx.beginPath();
            //    cx.moveTo(old_pos[0] * scale, old_pos[1] * scale);
            //    cx.lineTo(pos[0] * scale, pos[1] * scale);
            //    cx.stroke();
            //    cx.closePath();
            //}
            //old_pos = pos;
            
            //var radius = Math.max(1, max_radius / (1 + Math.log(length)));
            //var radius = 1;
            var radius = count * 10 / limit;
            
            fillCircle(cx, pos[0] * scale, pos[1] * scale,
                       radius);
            
            //console.info("Plotting " + prog);
            //console.info(color);
            //console.info(pos);
        }

        max_len += 1;
        window.setTimeout(drawPoints, 0);
        //if(max_len < N * N)
        //    window.setTimeout(drawPoints, 0);
        //else
        //    console.info("All done!");
    }

    window.setTimeout(drawPoints, 0);
}

startup();
