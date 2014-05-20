
/*
 * JS code from glimmsworkshop.com/2012/03/13/core-mechanics-mixed-dice/
var flatten = function(l) {
        return l.reduce(function(m, x) {
            if (x.length) m = m.concat(x);
            return m;
        }, []);
    };
var first = function(list) {
        return list[0];
    };
var rest = function(list) {
        return list.slice(1);
    };
var sum = function(list) {
        return list.reduce(function(total, value) {
            return total == 0 ? value : total.map(function(val, index) {
                return val + value[index];
            });
        }, 0);
    };
var enumerate = function(lists) {
        if (!lists || lists.length == 0) return [];
        if (lists.length == 1) return first(lists);
        return flatten(first(lists).map(function(value) {
            return enumerate(rest(lists)).map(function(value2) {
                return [value].concat(value2);
            });
        }));
    };
var cortex2 = function(rolls) {
        return rolls.sort(natsort).reverse().map(function(roll) {
            return roll == 1 ? 0 : roll; // turn the ones into zeros, so we don’t accidentally add them to the total
        }).reduce(function(rolls, roll) {
            return [rolls[0] + (rolls[2] < 2 ? roll : 0), rolls[1] + (roll == 0 ? 1 : 0), rolls[2] + 1];
        }, [0, 0, 0]);
};
var cortexenum = function(dice) {
    var one = sum(enumerate(dice).map(cortex2))
    var two = one.map(function(value) {
        return value / dice.reduce(function(total, die) {
            return total * die.length
        }, 1);
    });
    return two;
};
*/

//var go = cortexenum([[1,2,3,4],[1,2,3,4]]);
//
var natsort = function(a,b) {
  if (isNaN(a) || isNaN(b)) {
    return a > b ? 1 : -1;
  }
  return a - b;
}

function DieRoll(sides, result) {
    this.sides = sides;
    this.result = result;
    this.randomize =  function() {
        this.result = Math.ceil(Math.random() * this.sides);
    };
    if( this.result < 0 ) this.randomize();
};

function DiceSort(A, B) {
    if( A.result > B.result)
        return -1;
    else if (A.result < B.result)
        return 1;
    else {
        if( A.sides < B.sides)
            return -1;
        else if( A.sides > B.sides)
            return 1;
        return 0;
    }
};

function DicePool(keep) {
    this.keep = keep;
    this.pool = Array();
    this.addDie = function(sides) {
        var die = new DieRoll(sides, -1);
        this.pool.push(die);
    };
    this.addDieRoll = function(die) {
        this.pool.push(die);
    };
    this.getResult = function() {
        this.sort();
        if(this.pool.length == 0) {
            return 0;
        } else if (this.pool.length == 1) {
            return this.pool[0].result == 1 ? 0 : this.pool[0].result;
        } else {
            var bound = Math.min(this.keep, this.pool.length);
            var result = 0;
            var highest = this.pool.slice(0,bound);
            for ( var i = 0; i < bound; i++) {
                if( highest[i].result != 1 )
                    result += highest[i].result;
            }
            return result;
        }
    };
    this.getJinxes = function() {
        var jinxes = 0;
        for(var i = 0; i < this.pool.length; i++) {
            if( this.pool[i].result == 1 )
                jinxes++;
        }
        return jinxes;
    };
    this.sort = function() {
        this.pool = this.pool.sort(DiceSort);
    };
    this.clone = function() {
        var cloned = new DicePool(this.keep);
        for( var i = 0; i < this.pool.length; i++) {
            var die = this.pool[i];
            cloned.pool.push(new DieRoll(die.sides, die.result));
        }
        return cloned;
    };
}
//pool: int[], keep int
function CortexDice(pool, keep) {
    this.keep = keep;
    this.dice = pool.sort(natsort);
    this.getMaximum = function() {

        if( this.dice.length == 1)
            return this.dice[0];
        var l = this.dice.length;
        for(var i =0; i < l; i++) {
            console.log(this.dice[i]);
        }
        var result = 0;
        var bound = Math.min(l-this.keep, l);
        var min_bound = Math.max(l-this.keep, 0);
        var highest = this.dice.slice(min_bound, l);
        for ( var i = 0; i < highest.length; i++) {
            console.log("f:"+i+ " : " + highest[i]);
            result+= highest[i];
        }
        return result;
    };
    this.getResultsTable = function() {
        var possibles = Array();
        for( var i = 0; i < this.dice.length; i++) {
            var sides = this.dice[i];
            var cloned = Array();
            if( possibles.length == 0 ) {
                for ( var j = 1; j <= sides; j++ ) {
                    var pool = new DicePool(this.keep);
                    pool.addDieRoll(new DieRoll(sides, j));
                    cloned.push(pool);
                }
            } else {
                for ( var j = 1; j <= sides; j++ ) {
                    for ( var k = 0; k < possibles.length; k++ ) {
                        var oldPool = possibles[k];
                        var newPool = oldPool.clone();
                        newPool.addDieRoll(new DieRoll(sides, j));
                        cloned.push(newPool);
                    }
                }
            }
            possibles = cloned;
        }
        return possibles;
    };
    this.results = this.getResultsTable();

    this.getAverageResult = function() {
        var possibilities = this.results.length;
        var total = 0;
        var foo = [];
        for(var i=0; i < this.results.length; i++) {
            total += this.results[i].getResult();
            foo.push(this.results[i].getResult());
        }
        var mean = total/possibilities;
        return mean;
    };
    this.getChanceOf = function(value) {
        var possibilities = this.results.length;
        var total = 0;
        for(var i=0; i < this.results.length; i++) {
            if(this.results[i].getResult() == value) {
                total++;}
        };
        var proba = total/possibilities;
        return proba;

    };
    this.getAverageJinxes = function() {
        var possibilities = this.results.length;
        var total = 0;
        for(var i=0; i < this.results.length; i++) {
            total += this.results[i].getJinxes();
        }
        var mean = total/possibilities;
        return mean;
    };
    this.getJinxChance = function() {
        var possibilities = this.results.length;
        var total = 0;
        for(var i=0; i < this.results.length; i++) {
            if(this.results[i].getJinxes() > 0 )
                total++;
        }
        var probability = total/possibilities;
        return probability;
    };

}

self.addEventListener('message', function(e) {
    var pool = e.data.pool;
    var keep = e.data.keep;

    var c = new CortexDice(pool,keep);
    var mean = c.getAverageResult();
    var mean_jinx= c.getAverageJinxes();
    var chance_jinx = c.getJinxChance();
    var max = c.getMaximum();
    var freq = { 'max': max, 'start':2 };
    for( var i=2;i<=max;i++) {
        var prob = c.getChanceOf(i);
        freq[i] = prob;
    }
    var result = { 'mean': mean,
                   'mean_jinx': mean_jinx,
                   'chance_jinx': chance_jinx,
                   'max': max,
                   'frequency_dist': freq,
    };
    postMessage({'result': result});


}, false);
