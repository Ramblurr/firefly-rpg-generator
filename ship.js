// Some Data from Firefly RPG Corebook
// Get yours here: http://www.margaretweis.com/index.php/shop#!/~/product/id=29762279
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
gen_data['engines'] = ['{engines_adj} {engines_noun} is {engines_verb}'];
gen_data['engines_adj'] = ['Compression', 'Magnetic', 'Electric', 'Coolant', 'Resonant', 'Heat', 'Fuel', 'Lubricant', 'Thermal', 'Gravitic', 'Nuclear', 'Quantum', ];
gen_data['engines_noun'] = [ 'Coil', 'Throttle', 'Gear', 'Turbine', 'Feeder', 'Generator', 'Pressurizer', 'Exchanger', 'Catalyst', 'Actuator', 'Thrusters', 'Exhaust', ];
gen_data['engines_verb'] = [ 'Discharging', 'Leaking', 'Grinding', 'Overheating', 'Shaking', 'Clogging', 'Radiating', 'Bending', 'Shuddering', 'Seizing', 'Shifting', 'Deviating', ];

gen_data['hull'] = ['{hull_adj} {hull_noun} is {hull_verb}'];
gen_data['hull_adj'] = [ 'Steel', 'Composite', 'Airlock', 'Engine', 'Cargo', 'Jeffries', 'Scarf', 'Engine', 'Port', 'Starboard', 'Fore', 'Aft', ];
gen_data['hull_noun'] = [ 'Coupling', 'Pylon', 'Ring', 'Fork', 'Bulkhead', 'Mount', 'Casing', 'Frame', 'Jacket', 'Tube', 'Plate', 'Door', ];
gen_data['hull_verb'] = [ 'Bending', 'Snapping', 'Bulging', 'Cracking', 'Breaking', 'Sagging', 'Oxidizing', 'Twisting', 'Tearing', 'Fracturing', 'Splitting', 'Ablating', ];

gen_data['systems'] = ['{systems_adj} {systems_noun} is {systems_verb}'];
gen_data['systems_adj'] = [ 'Oxygen', 'Weapons', 'Communications', 'Waste', 'Carbon dioxide', 'Heat', 'Water', 'Sensor', 'Electrical', 'Gravity', 'Visual', 'Hydraulic', ];
gen_data['systems_noun'] = [ 'Exchanger', 'Computer', 'Lubricant', 'Antenna', 'Eliminator', 'Radiator', 'Purifier', 'Recycler', 'Relay', 'Generator', 'Wires', 'Tubes', ];
gen_data['systems_verb'] = ['Leaking', 'Sparking', 'Fluctuating', 'Crashing', 'Spraying', 'Deviating', 'Arcing', 'Scorching', 'Hesitating', 'Oscillating', 'Ghosting', 'Vibrating', ];


var components = {Hull:[], Engines:[], Systems: []};
var complications = new Array();
var components2 = {
    'hull': [
        { 'name': 'Hatches', 'complications': []},
        { 'name': 'Landing Gear', 'complications': ['Bent Strut', 'Leaky Hydraulics']},
        { 'name': 'Internal Structures', 'complications': []},
        { 'name': 'Cargo Bay Floor', 'complications': ['Massive Amounts of Cow Dung']},
        { 'name': 'Outer Hull', 'complications':['Hull Breach']},
    ],
    'engines':[
        { 'name': 'Coming Soon', 'complications':[]},
    ],
    'systems':[
        { 'name': 'Coming Soon', 'complications':[]},
    ],
};

function plural_fix(string) {
    var n = string.lastIndexOf(' is');
    if( string[n-1] == 's' ) {
        string = string.replace('is', 'are');
    }
    return string;
}

function technobabble() {
    $('#clear').click(function() {
        $('#result').empty();
    });
    $('#generate').click(function() {
        var gentype = $('input[name=attribute]:checked', '#ship').val();
        $('#result').prepend(plural_fix(generate_text(gentype)) + "<br/>");
    });
}

function partsCallback(json) {
    for(var i = 0; i < json.feed.entry.length; i++){
        var entry = json.feed.entry[i];
        var attr = entry.gsx$attribute.$t;
        var part = entry.gsx$component.$t;
        var item = {name:part, complications: []};
        for( var prop in entry ) {
            if( prop.match(/gsx\$complication/) ) {
                if( entry[prop].$t.length > 0 )
                    item.complications.push(entry[prop].$t);
            }
        }
        components[attr].push(item);
    }
    $('#ship2 :input').prop('disabled', false);
    var select = $("#components");
    select.chosen();
    var type = $('input[name=attribute2]:checked', '#ship2').val()
    populate_parts_select(type);
}

jQuery.fn.chosen_reset = function(n){
  $(this).chosen('destroy');
  $(this).prop('selectedIndex', 0);
  $(this).chosen(n)
}

function populate_parts_select(type) {
    console.log(type);
    var select = $("#components");
    select.find('option:gt(0)').remove().end();
    var parts = components[type];
    $.each(parts, function(i, part) {
        var $option = $("<option>", {
            text: part.name,
            value: part.name
        });
        $option.appendTo(select);
    });
    select.chosen_reset();
}

function realistic() {
    $('#ship2 :input:not(select)').change(function(){
        var type = $('input[name=attribute2]:checked', '#ship2').val()
        populate_parts_select(type);
    });
    $('#generate2').click(function() {
        var attr = $('input[name=attribute2]:checked', '#ship2').val()
        var part_name = $("#components").val();
        var part = $.grep(components[attr], function(e) { console.log(e);return e.name == part_name; })[0];
        var complication = select_from(part.complications);
        $('#result2').prepend( "<strong>"+part.name + "</strong>: "+ complication + "<br/>");
    });
    $('#clear2').click(function() {
        $('#result2').empty();
    });

}

$(function() {
    technobabble();
    realistic();
    $(document).ready(function() {
        $('#generate').click();
    });
});
