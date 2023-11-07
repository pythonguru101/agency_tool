export function random_int() {
    let min = Math.ceil(100000000);
    let max = Math.floor(900000000);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getCurrentTwitterUser() {
    let cooks = localStorage.getItem('twitter')

    if (!cooks) {
      cooks = "[]"
    }
    cooks = JSON.parse(cooks)
    
    for (let i in cooks) {
      if (cooks[i].isActive) {
        return cooks[i]
      }
    }
    
    return false
}
