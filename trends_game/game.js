
let startscreen_templ;
let game_templ;
let end_screen;

let use_templates_from_js = true;

if (use_templates_from_js){
    startscreen_templ = vue_templates.start_screen;
    game_templ = vue_templates.game_screen;
    end_screen = vue_templates.end_screen;
}else{
    let parser = new Vueable();
    r_async.parallel([
        () => {startscreen_templ = parser.parse(httpGet("/trends_game/components/start_screen.vueable"))},
        () => {game_templ = parser.parse(httpGet("/trends_game/components/game_screen.vueable"))},
        () => {end_screen = parser.parse(httpGet("/trends_game/components/end_screen.vueable"))}
    ]);
}

let startscreen_active = true;
let load_old_game = false;
let gamescreen_data = {};

function clean_str(str) {
    if (str === undefined){
        return ""
    }else{
        return str.trim().replace(",", "").replace("?", "")
    }
}

function contains_spaces(string) {
    return /\s/.test(string);
}

Vue.component('start_screen', {
    template:  startscreen_templ,
    data: function () {
        let possible_team_colors = [ // html color names
            "CornflowerBlue",
            "DarkGreen",
            "DarkOrange",
            "DodgerBlue",
            "ForestGreen",
            "BlueViolet",
            "Maroon",
        ];

        return {
            teams: [],
            default_teamname: "Click to edit teamname",
            t_input_id: "t_input_",
            max_teams: 4,
            max_rounds: 10,
            team_id_counter: 0,
            active: startscreen_active,
            team_color_list: possible_team_colors,
            theme: "",
            alert_templ: new Global_Comps(),
            rounds : 3
        }
    },
    mounted: function(){
        this.add_team();
    },
    computed:{
        unused_team_colors: function() {
            let in_use_colors = this.teams.map((team) => {return team.color});
            return this.team_color_list.filter((color) => {return in_use_colors.indexOf(color) === -1});
        }
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
            if (this.teams.length < 2) {
                this.show_msg(this.alert_templ.get_alert_info("You must have at least 1 team."));
                return;
            }
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
            let unused_colors = this.unused_team_colors;
            let random_color = unused_colors[Math.floor(Math.random()*unused_colors.length)];
            return {
                num: team_num,
                name: this.default_teamname,
                color: random_color
            };
        },
        start_game: function() {
            let _this = this;
            let found = [];

            let theme = clean_str(this.theme);
            if(contains_spaces(theme)){
                _this.show_msg(_this.alert_templ.get_alert_info("Theme term can't contain spaces"));
                return;
            }else if(theme === ""){
                _this.show_msg(_this.alert_templ.get_alert_info("Theme term can't be empty."));
                return;
            }

            function is_teamname_valid(str) {
                if (str === _this.default_teamname ){
                    _this.show_msg(_this.alert_templ.get_alert_info("All teams need have changed their from the default, before starting."));
                    return false;
                }else if(found.indexOf(str) !== -1) {
                    _this.show_msg(_this.alert_templ.get_alert_info("All team names need to be unique."));
                    return false;
                }else if(contains_spaces(str)){
                    _this.show_msg(_this.alert_templ.get_alert_info("Team names can't contain spaces."));
                    return false;
                }else if(str === ""){
                    _this.show_msg(_this.alert_templ.get_alert_info("Team names can't be empty."));
                    return false;
                }else{
                    return true;
                }
            }

            let team_names = this.teams.map((team) => {return clean_str(team.name)});
            for (let i in _.range(team_names.length)) {
                let name = team_names[i];
                if (is_teamname_valid(name)){
                    found.push(name);
                }else{
                    return;
                }
            }

            gamescreen_data.theme = theme;
            gamescreen_data.teams = this.teams.map((team) => {
                team.name = clean_str(team.name);
                return team;
            });
            gamescreen_data.rounds = this.rounds;
            open_gamescreen();
            this.active = false;

        },
        load_old_game: function(){
            if (document.cookie !== ""){
                load_old_game = true;
                gamescreen_data.them = "";
                gamescreen_data.rounds = 0;
                gamescreen_data.teams = [];
                open_gamescreen();
                this.active = false;
            }else{
                this.show_msg(this.alert_templ.get_alert_info("Can't load previous game, no saved game found."))
            }
        },
        set_rounds(num){
            this.rounds = num;
        },
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

let endscreen_data = {};

//todo save on check
Vue.component("game", {
        //putting this in a table
        template: game_templ,
        data: function () {
            let teams = gamescreen_data.teams;
            const table_header_font = "bold 12pt Montserrat";//todo change these fonts to lato
            const points_span_font = "italic 12pt Montserrat";
            const query_text_font = "12pt Montserrat";
            let table_cell_padding = 2*10;

            let min_col_width = get_max_text_width(teams.map((t) => {return t.name}) , table_header_font) + table_cell_padding;
            //let fnt = table_header_font;
            //let test_elem = $(`<div style="display: inline-block"><span style="font:${fnt};width:${get_max_text_width([txt], fnt)}px;float: left;padding-top: 3px;">${txt}</span><span style="font: ${query_text_font}">query_text</span></div>`);
            let points_span_width = get_max_text_width(["100 points: "], table_header_font);
            let order_btn_txt = ["Before", "After"];
            let order_btn_strings = {};
            teams.forEach((team) => {order_btn_strings[team.num] = order_btn_txt[0]});
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
                alert_templ: new Global_Comps(),
                table_cell_padding: table_cell_padding,
                autosave: false,
                rounds: gamescreen_data.rounds,
                theme: gamescreen_data.theme,
                game_ended: false,
                next_round_btn_txt:"Submit",
                order_strings: order_btn_txt,
                order_btn_strings: order_btn_strings

            }
        },
        mounted: function(){
            if (load_old_game){
                this.load_cookie();
            }
            let total_txt_width = get_max_text_width(["Total: 0"], this.table_header_font) + this.table_cell_padding;
            if (total_txt_width > this.min_col_width){
                this.min_col_width = total_txt_width;
            }

        },
        computed:{
            points_totals: function() {
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
            },
            savegame_string: function() {
                return JSON.stringify({
                    teams: this.teams,
                    queries: this.queries,
                    rounds: this.rounds,
                    theme: this.theme,
                    order_btn_strings: this.order_btn_strings,
                    game_ended: this.game_ended
                });
            },
            rounds_remaining: function () {
                return this.rounds - this.queries.length
            },
            winning_team_idx: function () {
                let totals = this.points_totals;
                let highest_found = -1;
                let highest_idx;
                for (let i in _.range(totals.length)){
                    if (totals[i] > highest_found){
                        highest_found = totals[i];
                        highest_idx = i;
                    }
                }
                return highest_idx;
            },
            game_result: function () {
                let idx = this.winning_team_idx;
                let ret = {
                    teams: this.teams,
                    winner_idx: idx,
                    winning_score: this.points_totals[idx],
                    links: this.queries.map((q) => {return this.get_url(q)})
                };
                return ret;
            },
            get_order_btn_txt: function (team_num) {
                console.log("doing");
                return this.order_btn_strings[0];
            }
        },
        methods:{
            add_query_row: function(row) {
                let w = this.min_col_width;
                row.forEach((e) => {
                    if (e.width > w){
                        w = e.width;
                    }
                });
                this.min_col_width = w;
                this.queries.push(row)
            },
            get_new_query_item: function (points, _term) {
                let width = this.points_span_width + get_max_text_width([_term], this.query_text_font) + this.table_cell_padding;
                return{
                    points_txt : points+" points:  ",
                    points: points,
                    term: _term,
                    width: width
                }
            },
            submit_query: function(){
                if(!this.game_ended){
                    let terms = [];
                    for (let i in _.range(this.teams.length)){
                        let term = clean_str(this.query_form[this.teams[i].num]);
                        if (term === undefined || term === ""){
                            this.show_msg(this.alert_templ.get_alert_info("All terms need to be filled in to submit."));
                            return;
                        }else if(contains_spaces(term)){
                            this.show_msg(this.alert_templ.get_alert_info("Terms can't contain spaces."));
                            return;
                        }else{
                            //checks order
                            switch (this.order_strings.indexOf(this.order_btn_strings[this.teams[i].num])) {
                                case 0:
                                    terms.push(this.theme + " " + term);
                                    break;
                                case 1:
                                    terms.push(term + " " + this.theme);
                                    break;
                            }
                        }
                    }

                    let table_row = [];
                    let result = (function query_server() {
                        let server_url = "http://18.197.12.243:5000/";
                        server_url += "?";
                        let q_str = "q=";
                        server_url += q_str + terms[0];
                        if (terms.length > 1){
                            for(let i in _.range(terms.length)){//lodash's range(1, n) doesn't seem to work correctly
                                server_url += "&" + q_str + terms[+i+1];
                            }
                        }
                        let json =  httpGet(server_url);// see jquery cors bug in notes
                        return JSON.parse(json);
                    })();
                    this.teams.forEach((team) => {this.query_form[team.num] = ""});
                    for (let i in _.range(terms.length)){
                        table_row.push(this.get_new_query_item(result[i], terms[i]))
                    }
                    this.add_query_row(table_row);
                    if (this.autosave){
                        this.save_cookie();
                    }
                }
                this.check_game_end();
            },
            check_game_end: function(){
                if (this.rounds_remaining === 0){
                    if (this.game_ended){
                        this.active = false;
                        endscreen_data = this.game_result;
                        if(use_templates_from_js){
                            document.cookie = "";
                        }
                        open_endscreen();
                    }else{
                        this.game_ended = true;
                        this.next_round_btn_txt = "End game"
                    }
                }
            },
            get_url: function(query){
                let url = "https://trends.google.com/trends/explore?q=";
                let get = (obj) => {return obj.term};
                url += get(query[0]);
                if (query.length > 1){
                    for (let i = 1; i < query.length; i++) {
                        url += ",";
                        url += get(query[i]);
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
            save_cookie:function () {
                document.cookie = this.savegame_string;
            },
            load_cookie:function () {
                let cookie = document.cookie;
                if(cookie === ""){
                    this.show_msg(this.alert_templ.get_alert_warning("could not load game. cookie empty"))
                }
                cookie = cookie.replace(/^.*?{/, "{");// remove google analytics string
                cookie = JSON.parse(cookie);
                this.theme = cookie.theme;
                this.teams = cookie.teams;
                cookie.queries.forEach((q) => {this.add_query_row(q)});
                this.rounds = cookie.rounds;
                this.order_btn_strings = cookie.order_btn_strings;
                this.game_ended = cookie.game_ended;
            },
            switch_order_btn_txt:function (team_num) {
                switch (this.order_strings.indexOf(this.order_btn_strings[team_num])) {
                    case 0:
                        this.order_btn_strings[team_num] = this.order_strings[1];
                        break;
                    case 1:
                        this.order_btn_strings[team_num] = this.order_strings[0];
                        break;
                }
                this.$forceUpdate();
            },
        }
    }
);
function open_gamescreen(){

    let game_screen = new Vue({
        el: '#game_screen'
    });
}

Vue.component("end_screen",{
        //putting this in a table
        template: end_screen,
        data: function () {
            return endscreen_data
        },
        mounted: function(){
            show_confetti();
        },
        methods:{
            restart_game: function () {
                location.reload();
            },
            open_link:function (link) {
                window.open(link)
            }
        }
    }
);

function open_endscreen(){
    let end_screen = new Vue({
        el: '#end_screen'
    });

}
