// This function parses any URL params, if present
function getURLParams() {
    var url = window.location.href;
    var sep = '?';
    var query = url.split(sep);
    if (query.length == 1)
        return {};
    query = query[1];
    var args = query.split('&'),
	i = args.length,
	params = {};
    while (i--) {
        var keyval = args[i].split('=');
        params[ keyval[0] ] = keyval[1]; 
    }

    return params;
}
