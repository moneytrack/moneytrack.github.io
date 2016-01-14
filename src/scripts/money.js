"use strict"

export default {
    format: settings => cents => {
        settings = settings || {}
        const groupDelim = settings.groupDelim || " "
        const decimalDelim = settings.decimalDelim || "."
        const currency = settings.currency || ""
        const currencyBefore = settings.currencyBefore || false

        let result = "";
        let dollars = parseInt(cents / 100)
        let pennies = parseInt(cents % 100)
        while(dollars >= 1000) {
            let group = dollars % 1000
            result = group + result
            if(group < 100) result = "0" + result
            if(group < 10) result = "0" + result
            result = groupDelim + result
            dollars = parseInt(dollars / 1000)
        }
        result = dollars + result
        
        result += decimalDelim
        if(pennies < 10) result += "0"
        result += pennies
        if(currencyBefore) {
            result = currency + result
        }
        else {
            result = result + currency
        }

        return result;
    },

    settings: {
        byCurrency: {
            USD: {
                currency: "$",
                currencyBefore: true
            },
            EUR: {
                currency: " " + String.fromCharCode(parseInt("8364")),
            },
            RUR: {
                currency: " " + String.fromCharCode(parseInt("8381")),
            }
        }
    }
}