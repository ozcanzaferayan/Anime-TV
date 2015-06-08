function transform(data) {
  // filter functions are passed the whole API response object
  // you may manipulate or add to this data as you want

  // query parameters exist in the global scope, for example:
  // http://www.kimonolabs.com/apis/<API_ID>/?apikey=<API_KEY>&myparam=test
  // query.myparam == 'test'; // true
  var animeList = data.results.anime;
  for (var i = 0; i < animeList.length; i++){
    var anime = animeList[i];
    var animeName;  // Anime adı
    var animeEp;    // Anime bölüm bilgisi
    var animeDate;  // Ne zaman eklendiği
    var animeNameEp = anime.name.text; // Bölüm bilgisi ile anime adı
    var animeHref = anime.name.href;  // Anime linki
    
    // Bölüm bilgisinin alınması
    var animeHrefParts = animeHref.split(/-([0-9]*-bolum)/);
    // Bölüm bilgisi varsa al yoksa empty string olarak ata
    if (animeHrefParts.length > 1) {
      // Bölüm numarasının alınması
      var epNumber = animeHrefParts[1].split('-')[0];
      animeEp = epNumber + ". " + "Bölüm";
    }
    else {
      animeEp = "";
    }
    // Anime adından bölüm bilgisinin çıkarılması
    animeName = animeNameEp.split(/ ([0-9]*. B*)/)[0];
    animeDate = anime.date.split("yaklaşık ")[1];
    
    // Yeni özelliklerle anime nesnesinin set edilmesi
    data.results.anime[i].name.text = animeName;
    data.results.anime[i].episode   = animeEp;
    data.results.anime[i].date      = animeDate;
    
  }
  return data;
}