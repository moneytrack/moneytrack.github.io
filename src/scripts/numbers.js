export const isNumber = (value) => {
    if(/^[0-9]*([,.][0-9]*)?$/.test(value)) {
        return true
    } 
}

export const getNumber = (value) => {
    if(value === '' || value === '.' || value === ',') {
        return 0
    }
    else {
        return parseFloat(value)
    }
}