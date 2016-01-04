"use strict"
import {Promise} from 'es6-promise'

module.exports.get = (url) => {
    var xmlhttp;

    return new Promise((resolve, reject) => {
        
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
                            resolve(JSON.parse(xmlhttp.responseText));
                        }
                        catch(e) {
                            console.error("Response text is not null, but it's not a valid JSON: " + xmlhttp.responseText)
                            resolve(null);
                        }
                    }
                    else {
                        resolve(null);
                    }
                }
                else {
                    reject({
                        code: xmlhttp.status,
                        responseText: xmlhttp.responseText
                    })
                }
            }
        }

        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    })


}

module.exports.post = (url, body) => {
    return new Promise((resolve, reject) => {

        var xmlhttp;

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
                            resolve(JSON.parse(xmlhttp.responseText));
                        }
                        catch(e) {
                            console.error("Response text is not null, but it's not a valid JSON: " + xmlhttp.responseText)
                            resolve(null);
                        }
                    }
                    else {
                        resolve(null);
                    }
                }
                else {
                    reject({
                        code: xmlhttp.status,
                        responseText: xmlhttp.responseText
                    })
                }
            }
        }

        xmlhttp.open("POST", url, true);
        xmlhttp.send(JSON.stringify(body));

    })
}