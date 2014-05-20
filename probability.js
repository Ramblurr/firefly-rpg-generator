var dX = function(d,n) {
    if( isNaN(n) ) n = 0;
    if ( n == 0 ) return [];
    var all = Array(n+1).join(1).split('').map(function(){return d;})
    return all;
};

/* Check if Web Workers are supported */
function getWebWorkerSupport() {
    return (typeof(Worker) !== "undefined") ? true:false;
}

function googleCallback() {
    $('#dice_prob :input').prop('disabled', false);
}

function render(result) {
    var mean = result.mean
    var mean_jinx= result.mean_jinx;
    var chance_jinx = result.chance_jinx*100;
    var max = result.max;

    $("#mean-roll").text(mean.toFixed(2));
    $("#mean-jinx").text(mean_jinx.toFixed(2));
    $("#chance-jinx").text(chance_jinx.toFixed(2)+"%");
    $("#max-value").text(max);

    var values = [];
    for( var i = result.frequency_dist.start; i<=result.frequency_dist.max; i++) {
        var prob = result.frequency_dist[i]*100;
        var val = i.toString();
        var tip = "<div style='width:100%; padding: 5px'> "+val+": has a <strong>"+prob.toFixed(2)+"%</strong> chance to roll</div>";
        values.push([i.toFixed(0), prob, tip]);
    }

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Roll');
    data.addColumn('number', 'Percentage');
    data.addColumn({type: 'string', role: 'tooltip','p': {'html': true}});
    data.addRows(values);
    var view =  new google.visualization.DataView(data);

    var options = {
        legend: { position: 'none' },
        width: 550,
        height: 400,
        chartArea: {'width': '82%', 'height': '85%'},
        tooltip: {isHtml: true},
        vAxis: {'title': 'Pool Value'},
        hAxis: {'title': 'Chance (%)'}
    };

    $("#graph_note").removeClass('hide');
    var chart = new google.visualization.BarChart(document.getElementById('chart'));
    chart.draw(data, options);
    toggleSpinner();
};

function toggleSpinner() {
    $("#chart_container").toggleClass('hide');
    $("#results").toggleClass('hide');
    $("#spinner").toggleClass('hide');

}
google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(googleCallback);

var worker = new Worker("dice_pool_calc.js");

worker.addEventListener("message", function (e) {
    render(e.data.result);
}, false);

$(function() {
    if ( !getWebWorkerSupport() )
        $('#oldbrowser').removeClass('hide');

    $('#tt_mean').tooltip();
    $('#tt_jinxmean').tooltip();
    $('#tt_jinxchance').tooltip();
    $('#tt_max').tooltip();
    $('#but_reset').click(function() {
        $('#dice_prob :input').val("");
    });
    $('#dice_prob :input').change(function(){

        var d4 = Number($("#d4").val());
        var d6 = Number($("#d6").val());
        var d8 = Number($("#d8").val());
        var d10 = Number($("#d10").val());
        var d12 = Number($("#d12").val());

        var pool = [dX(4,d4), dX(6,d6), dX(8,d8), dX(10,d10), dX(12,d12)];
        pool = pool.filter(function(n){ return n.length != 0 }).reduce(function(a,b) { return a.concat(b)});
        if (pool.length < 2 ) return;

        worker.postMessage({'pool':pool});
        toggleSpinner();
    });
});
