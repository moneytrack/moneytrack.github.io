"use strict"

export default {
    format: settings => cents => {
        settings = settings || {}
        const groupDelim = settings.groupDelim || " "
        const decimalDelim = settings.decimalDelim || "."
        const currency = settings.currency || ""

        var result = "";
        var dollars = parseInt(cents / 100)
        var pennies = parseInt(cents % 100)
        while(dollars >= 1000) {
            var group = dollars % 1000
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
        result += currency

        console.log("format",cents,result)

        return result;
    }
}