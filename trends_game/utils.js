function httpGet(url) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function sync_wrapper(func) {
    // makes any function non-blocking without callback
    // to pass in arguments pass in a function with the arguments defined
    let ret;
    r_async.parallel([() => {ret = func();}]);
    return ret;
}