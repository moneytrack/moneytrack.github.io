var Q = require('kew');

module.exports.get = (url) => {
    var xmlhttp;

    var promise = new Q.defer();


    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
            if(xmlhttp.status == 200){
                if(xmlhttp.responseText) {
                    try {
                        promise.resolve(JSON.parse(xmlhttp.responseText));
                    }
                    catch(e) {
                        console.error("Response text is not null, but it's not a valid JSON: " + xmlhttp.responseText)
                        promise.resolve(null);
                    }
                }
                else {
                    promise.resolve(null);
                }
            }
            else {
                promise.reject({
                    code: xmlhttp.status,
                    responseText: xmlhttp.responseText
                })
            }
        }
    }

    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    return promise;
}

module.exports.post = (url, body) => {
    var xmlhttp;

    var promise = new Q.defer();

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
            if(xmlhttp.status == 200){
                if(xmlhttp.responseText) {
                    try {
                        promise.resolve(JSON.parse(xmlhttp.responseText));
                    }
                    catch(e) {
                        console.error("Response text is not null, but it's not a valid JSON: " + xmlhttp.responseText)
                        promise.resolve(null);
                    }
                }
                else {
                    promise.resolve(null);
                }
            }
            else {
                promise.reject({
                    code: xmlhttp.status,
                    responseText: xmlhttp.responseText
                })
            }
        }
    }

    xmlhttp.open("POST", url, true);
    xmlhttp.send(JSON.stringify(body));

    return promise;
}