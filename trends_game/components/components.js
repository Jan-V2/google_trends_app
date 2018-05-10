
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


