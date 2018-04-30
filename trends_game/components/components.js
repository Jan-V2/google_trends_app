
function Global_Comps() {
    this.get_alert_danger = function (msg) {
        return this.get_alert(msg, "alert-danger")
    };

    this.get_alert_warning = function (msg) {
        return this.get_alert(msg, "alert-warning")
    };

    this.get_alert_info = function (msg) {
        return this.get_alert(msg, "alert-info")
    };

    this.get_alert = function (msg, alert_class) {
        return `<div class="alert ${alert_class} alert-dismissible fade show" role="alert">${msg} 
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">    
                          <span aria-hidden="true">&times;</span>  
                        </button>
                      </div>`
    };

    this.get_clearfix = function () {
        return `<div class="clearfix"></div>`
    };
}


function Gamescreen_Components() {
    this.table_head = () => {

    };

    this.table_row = (team) => {

    };

    this.query_form = function(num_teams) {
        let colsize = 12;
        colsize = colsize / num_teams;
        let inner_html = ``;
        for (let i in _.range(num_teams)){
            inner_html += `<input type="text" class="col-${colsize}" name="term_${i}"/>`
        }
        return `
             <form id="queries_form">
             <div class="row">
               <div class="row col-10">
                 ${inner_html}
               </div> 
                <button type="submit" class="btn btn-primary col-2" id="search">Search</button>
                </div>
             </form>`
    };
}

