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


/* A function to create a popup - similar to the JS  built-in "alert" */
function mAlert(msg) {
    var ap = document.getElementById('alertPanel');

    ap.style.display = 'block';

    // Assume the string passed in is in the right format
    ap.innerHTML = msg.replace(/\n/g,"<br>");

    var cb = document.createElement('button');
    cb.onclick = function () {ap.style.display = 'none';};
    cb.appendChild(document.createTextNode('Close'));

    ap.appendChild(cb);    

}