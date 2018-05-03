
let startscreen_templ;
let game_templ;
r_async.parallel([
    () => {startscreen_templ = httpGet("/trends_game/components/start_screen.vueable")},
    () => {game_templ = httpGet("/trends_game/components/game_screen.vueable")}

]);
let parser = new Vueable();
let startscreen_active = false;

Vue.component('start_screen', {
    template:  parser.parse(startscreen_templ),
    data: function () {
        return {
            teams: [],
            default_teamname: "Click to edit teamname",
            t_input_id: "t_input_",
            max_teams: 4,
            team_id_counter: 0,
            active: startscreen_active,
            alert_templ: new Global_Comps()
        }
    },
    mounted: function(){
        this.add_team();
    },
    methods: {
        add_team: function (){
            if (this.teams.length >= this.max_teams){
                this.show_msg(this.alert_templ.get_alert_info("You can only have up to "+this.max_teams+" teams."))
            }else{
                this.teams.push(
                    this.get_new_team(this.team_id_counter));
                this.team_id_counter++;
            }
        },
        update_teamname: _.debounce(function(event){
            let id;
            try{
                id = + event.target.id.replace(this.t_input_id, "")
            }catch{
                this.show_msg(this.template.global.get_alert_danger("could not update team name. id parse failed."));
                return;
            }
            let get_team_num = (team) => {return team.num};
            let did_update = false;
            this.teams.forEach((t) => {
                if (!did_update && get_team_num(t) === +id){
                    t.name = event.target.textContent;
                    did_update = true;
                }
            });
            if (!did_update){
                this.show_msg(this.alert_templ.get_alert_danger("could not update team name. could not find team with id "+id+"."));
            }
        }, 200),
        delete_team: function(team_num){
            let _t = this.teams;
            let team_idx = _t.map((e) => {return e.num}).indexOf(+ team_num);
            if (team_idx > -1){
                _t.splice(team_idx, 1)
            }else{
                this.show_msg(this.alert_templ.get_alert_warning("Can't delete team, doesn't seem to exist."))
            }
        },
        show_msg: function(msg_html) {
            $("#message_div").html(msg_html)
        },
        get_new_team: function(team_num) {
            let ret = {
                num: team_num,
                name: this.default_teamname
            };
            return ret;
        },
        start_game: function() {
            let found = [];
            let game_is_ready = true;

            this.teams.map((e) => {return e.name}).forEach((name) => {
                if (game_is_ready){
                    if (name === this.default_teamname ){
                        game_is_ready = false;
                        this.show_msg(this.alert_templ.get_alert_info("All teams need have changed their name before starting."));
                    }else if(found.indexOf(name) !== -1){
                        game_is_ready = false;
                        this.show_msg(this.alert_templ.get_alert_info("All teamnames need to be unique."));
                    }else{
                        found.push(name);
                    }
                }
            });
            if (game_is_ready){
                console.log("starting game");
                this.teams.forEach((e) => {
                    console.log(e.name + e.num);
                });
                this.active = false;
            }
        }
    }
});

let start_screen = new Vue({
    el: '#startscreen'
});


const canvas_cntx = document.createElement("canvas").getContext("2d");
function get_max_text_width (strings, font) {
    canvas_cntx.font = font;
    let max_width = 0;
    strings.forEach((str) => {
        let width = canvas_cntx.measureText(str).width;
        if (width > max_width){
            max_width = width;
        }
    });
    return max_width;
}

Vue.component("game",{
        //putting this in a table
        template: parser.parse(game_templ),
        data: function () {
            let teams = [{
                name: "t name 1 blaaaah",
                num: 3
            },{
                name: "t name 2",
                num: 5
            },{
                name: "test",
                num: 6
            }];
            const table_header_font = "bold 12pt Montserrat";
            const points_span_font = "italic 12pt Montserrat";
            const query_text_font = "12pt Montserrat";

            let min_col_width = get_max_text_width(teams.map((t) => {return t.name}) , table_header_font) + 20;
            let fnt = table_header_font;
            //let test_elem = $(`<div style="display: inline-block"><span style="font:${fnt};width:${get_max_text_width([txt], fnt)}px;float: left;padding-top: 3px;">${txt}</span><span style="font: ${query_text_font}">query_text</span></div>`);

            let points_span_width = get_max_text_width(["100 points: "], fnt);


            return {
                active: true,
                teams: teams,
                table_header_font:table_header_font,
                points_span_font:points_span_font,
                query_text_font: query_text_font,
                points_span_width: points_span_width,
                queries: [],
                min_col_width: min_col_width,
                query_form: {},
                alert_templ: new Global_Comps()
                /* create a 2d array for the query results,
                 * which the x which matches a team array index,
                 * and the y matches a round (aka a rou)*/
            }
        },
        mounted: function(){
            this.add_query_row([ this.get_new_query_item(100, "test"), this.get_new_query_item(43, "testing"), this.get_new_query_item(43, "testing")]);
            this.add_query_row([ this.get_new_query_item(52, "boooooooh"), this.get_new_query_item(61, "bleh"), this.get_new_query_item(43, "testing")]);
            this.add_query_row([ this.get_new_query_item(52, "boooooooh"), this.get_new_query_item(61, "bleh"), this.get_new_query_item(43, "testing")]);

        },
        computed:{
            points_total: function() {
                let totals = Array(this.teams.length).fill(0);
                this.queries.forEach((query) => {
                    for (let i in _.range(query.length)){
                        totals[i] += query[i].points;
                    }
                });
                return totals;
            },
            input_field_row_class(){
                let base_str = "col-";
                return base_str + 12 / this.teams.length;
            }
        },
        methods:{
            add_query_row: function(row) {
                let w = this.min_col_width;
                row.forEach((e) => {
                    if (e.width > w){
                        w = e.width;
                        console.log("updated width");
                    }
                });
                this.min_col_width = w;
                this.queries.push(row)
            },

            get_new_query_item: function (points, _term) {
                let width = this.points_span_width + get_max_text_width([_term], this.query_text_font);
                return{
                    points_txt : points+" points:  ",
                    points: points,
                    term: _term,
                    width: width
                }
            },
            submit_query: function(){
                let terms = [];
                this.teams.forEach((e) => {
                    let str = this.query_form[e.num];
                    if (str === undefined){
                        terms.push("")
                    }else{
                        terms.push(str.replace(/,/g, "").trim());
                    }
                });
                console.log(terms);
                if (terms.indexOf("") !== -1){
                    this.show_msg(this.alert_templ.get_alert_info("All terms need to be filled in to submit."));
                    return;
                }

                function query_server() {
                    let server_url = "http://18.197.12.243:5000/";
                    server_url += "?";
                    let q_str = "q=";
                    server_url += q_str + terms[0];
                    if (terms.length > 1){
                        for(let i in _.range(1, terms.length)){
                            server_url += "&" + q_str + terms[+i+1]
                        }
                    }
                    return JSON.parse(httpGet(server_url));// see jquery cors bug in notes
                }
                let table_row = [];
                let result = query_server();
                for (let i in _.range(terms.length)){
                    table_row.push(this.get_new_query_item(result[i], terms[i]))
                }
                this.add_query_row(table_row);

            },
            get_url: function(row){
                console.log("updated url");
                let url = "https://trends.google.com/trends/explore?q=";
                let get = (obj) => {return obj.term};
                url += get(row[0]);
                if (row.length > 1){
                    for (let i = 1; i < row.length; i++) {
                        url += ",";
                        url += get(row[i]);
                    }
                }
                return url;
            },
            open_link_in_tab: function(event){
                window.open(event.target.getAttribute("href"))
            },
            show_msg: function(msg_html) {
                $("#message_div").html(msg_html)
            },
            test: function() {
                this.min_col_width += 10;
            }
        }
    }
);


let game_screen = new Vue({
    el: '#game_screen'
});




