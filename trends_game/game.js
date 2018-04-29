
const gamediv = $("#game");

let startscreen_html;
let startscreen_templ;
let gamescreen_html;
r_async.parallel([
    () => {startscreen_html = httpGet("/trends_game/components/start_screen.html")},
    () => {startscreen_templ = httpGet("/trends_game/components/start_screen.vueable")},
    () => {gamescreen_html = httpGet("/trends_game/components/game_screen.html")}
    ]);
let parser = new Vueable();
const comps = new Startscreen_components();

const startscreen_consts = {
    default_teamname: "Click to edit teamname"
};
// console.log(startscreen_templ);
let parsed = parser.parse(startscreen_templ);
// console.log(parsed);

Vue.component('start_screen', {
    template: parsed,
    props: {
        data: Array,
        columns: Array,
        filterKey: String
    },
    data: function () {
        var sortOrders = {}
        this.columns.forEach(function (key) {
            sortOrders[key] = 1
        })
        return {
            sortKey: '',
            sortOrders: sortOrders
        }
    },
    computed: {
        filteredData: function () {
            var sortKey = this.sortKey
            var filterKey = this.filterKey && this.filterKey.toLowerCase()
            var order = this.sortOrders[sortKey] || 1
            var data = this.data
            if (filterKey) {
                data = data.filter(function (row) {
                    return Object.keys(row).some(function (key) {
                        return String(row[key]).toLowerCase().indexOf(filterKey) > -1
                    })
                })
            }
            if (sortKey) {
                data = data.slice().sort(function (a, b) {
                    a = a[sortKey]
                    b = b[sortKey]
                    return (a === b ? 0 : a > b ? 1 : -1) * order
                })
            }
            return data
        }
    },
    filters: {
        capitalize: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1)
        }
    },
    methods: {
        sortBy: function (key) {
            this.sortKey = key
            this.sortOrders[key] = this.sortOrders[key] * -1
        }
    }
})

// bootstrap the demo
var demo = new Vue({
    el: '#demo',
    data: {
        searchQuery: '',
        gridColumns: ['name', 'power'],
        gridData: [
            { name: 'Chuck Norris', power: Infinity },
            { name: 'Bruce Lee', power: 9000 },
            { name: 'Jackie Chan', power: 7000 },
            { name: 'Jet Li', power: 8000 }
        ]
    }
})

function start_screen() {
    //gamediv.html(startscreen_html);
    let message_div = $("#message_div");
    let teams_div = $("#teams");
    let add_team_btn = $("#add_team");
    let start_game_btn = $("#start_game");
    let team_id_counter = 0;
    let max_teams = 4;
    //todo team colors

    async function add_team(){
        if(teams_div.children().length < max_teams){
            teams_div.append(comps.get_add_team_row(team_id_counter));
            team_id_counter++;
        }else{
            message_div.html(comps.get_alert_info("You can only have up to "+max_teams+" teams."))
        }
    }

    add_team_btn.click((event) => {add_team()});
    add_team();

    teams_div.click((event) => {
        let id = event.originalEvent.target.id;
        let team_del = "team_del_";

        if(id.indexOf(team_del) === 0) {
            let id_num = id.replace(team_del, "");
            $("#team_row_" + id_num).remove();
        }
    });


    start_game_btn.click((event) => {


        let teams = [];
        let team_names_labels = $("label.team_name_label").toArray();

        function Team(num, name){
            this.num = num;
            this.name = name
        }

        let _continue = true;
        team_names_labels.forEach((label) => {
            if (_continue){
                let team_num = label.parentElement.parentElement.id.replace("team_row_", "");
                let team_name = label.textContent;
                if (team_name === startscreen_consts.default_teamname ){
                    _continue = false;
                }else{
                    teams.push(new Team(team_num, team_name))
                }
            }
        });
        // right now 2 teams can have the same name since they're identified by their number
        if (_continue){
            game_screen(teams)
        }else{
            message_div.html(comps.get_alert_warning("All teams must set their name before starting the game."));
        }
    });

}

const gamescreen_consts = {

};

function game_screen(teams){
    gamediv.html(gamescreen_html);
    let message_div = $("#message_div");
    //let search_btn = $("#search");
    let search_term = $("#term");
    let search_output = $("#output");

/*    search_btn.click(() => {
        console.log("test");
        query_trends();
    });*/
    $("#query_form_div").append(comps.game.query_form(teams.length));


    teams.forEach((team) => {
        gamediv.append(`<span>${team.num} ${team.name}</span>`);
        gamediv.append(comps.get_clearfix());
    });

    $("#queries_form").submit(function( event ) {
        console.log("query form");
        event.preventDefault();
    });


    async function query_trends() {
        let terms = [$("#term1").val(), $("#term2").val()];
        console.log(terms.toString());
        if (terms.indexOf("") !== -1){
            message_div.html(comps.get_alert_warning("The search term can't be blank"))
        }else{
            let server_url = "http://18.197.12.243:5000/";
            server_url += "?";
            let q_str = "q=";
            server_url += q_str + terms[0];
            if (terms.length > 1){
                for(let i in _.range(1, terms.length)){
                    console.log(+i+1);
                   server_url += "&" + q_str + terms[+i+1]
                }
            }
            console.log(server_url);
            let result = JSON.parse(httpGet(server_url));// see jquery cors bug in notes
            result.forEach((e) => {
                gamediv.append(`<span>${e.toString()}</span>`);
                gamediv.append(comps.get_clearfix());
            })
        }
    }
}


start_screen();
