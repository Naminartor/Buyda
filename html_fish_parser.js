function nextN(e, n){
    for(i=0; i<n; i++){
      e = e.nextElementSibling
      if(e == null){
        return false
      }
    }
    return e
  }

function fixItem(item){
  if (!item.act){
    return item
  }
  item.act = item.act.split(":")[1].trim().replace("&nbsp;", "")
  item.aquaSize = item.aquaSize.match(/\d+/)[0]
  item.feed = item.feed.split(":")[1].trim().replace("&nbsp;", "")
  item.breeding = item.breeding.split(":")[1].trim().replace("&nbsp;", "")
  item.count = item.count.split(":")[1].trim().replace("&nbsp;", "")
  item.size = item.size.split(":")[1].trim().replace("&nbsp;", "")
  item.origin = item.origin.split(":")[1].trim().replace("&nbsp;", "")
 // console.log(item.ph)
  ph = [...item.ph.matchAll(/\d+(,\d+)*/g)]
  item.phMin = ph[0][0].replace(",",".")
  item.phMax = ph[1][0].replace(",",".")
  delete item.ph
  temp = [...item.temp.matchAll(/\d+(,\d+)*/g)]
  item.tempMin = temp[0][0].replace(",",".")
  if (temp.length == 1){
    item.tempMax = temp[0][0].replace(",",".")
  }else{
  item.tempMax = temp[1][0].replace(",",".")
  }
  delete item.temp
  item.h2OHardness = item.h2OHardness.split(":")[1].trim().replace("&nbsp;", "")
  return item
}

[...document.querySelectorAll("h2")].map(e=>

    { 
      try {
      aquaInfo = 0
      try{
      while (nextN(e, aquaInfo).innerHTML!= "<u>Aquaristik Info</u>"){
      if (aquaInfo > 5){
          aquaInfo = false
          break;
      }
      aquaInfo++
      }}
    catch{
      aquaInfo = false
    }
    item = {
        name:e.innerHTML, 	
        description:nextN(e,1).innerHTML,
        }
    if(aquaInfo > 1){
      for(i=1; i<aquaInfo; i++){
          item.description += nextN(e,i).innerHTML
      }
    }
      if(aquaInfo == false){
      i = 1
      try{
      while(nextN(e,i).localName == "p"){
              item.description += nextN(e,i).innerHTML
              i++
      }
      }catch{
          }
      }
    tmp = item.name.split('(')
      item.name = tmp[0].trim()
    item.specialName = tmp[1]?.trim().slice(0,-1)
    if(aquaInfo){
      fish = {act:nextN(e,aquaInfo + 1).innerHTML, 
          aquaSize:nextN(e,aquaInfo + 2).innerHTML,
          feed:nextN(e,aquaInfo + 3).innerHTML,
          breeding:nextN(e,aquaInfo + 4).innerHTML,
          count:nextN(e,aquaInfo + 5).innerHTML,
          size:nextN(e,aquaInfo + 6).innerHTML,
          origin:nextN(e,aquaInfo + 7).innerHTML,
          ph:nextN(e,aquaInfo + 9).innerHTML,
          temp:nextN(e,aquaInfo + 10).innerHTML,
          h2OHardness:nextN(e,aquaInfo+ 11).innerHTML  }
      item = {...item, ...fish}
      
    }
  
    return fixItem(item)
  }catch (err) {
    console.log(e, err)
  }})