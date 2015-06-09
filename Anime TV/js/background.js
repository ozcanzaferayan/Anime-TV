var intervalNewAnimeList =    60000; // 1dk'da bir servis çalışacak
var intervalAllAnimeList =  3600000; // 1saatte bir servis çalışacak
var notTimeout = 10000; // 10sn boyunca notification açık kalacak 
var apiFrequencyMilis = 15 * 60 * 1000; // 15dk API crawl aralığı



//Başlangıçta içeriklerin getirilmesi için
$(document).ready(function(){
  if(localStorage.unreadCount  === undefined){
    localStorage.unreadCount = 0;
  }
  storeNewAnimes();
  getAllList();
});

setInterval(function(){
  storeNewAnimes();
}, intervalNewAnimeList);

setInterval(function(){
  getAllList();
}, intervalAllAnimeList);

function storeNewAnimes(){
  var currentTimeText = /(..)(:..)(:..)/.exec(new Date())[0];
  console.info("Yeni anime liste servisi çalışıyor: " + currentTimeText);
  // Storage'da kaydedilen önceki animeleri getir
  // Eğer veriler storage'da yoksa yenilerini API'den çek
  var data = localStorage.newAnimesObject;
  if (data === undefined) {
    console.log("newAnimesObject verisi storage'da yok.");
    getNewAnimes(data);
  }
  else {
    data = JSON.parse(data);
    // Eğer veriler storage'da varsa güncellemek için kontrol et
    console.log("newAnimesObject storage'da var");
    if (data.lastrunstatus == "in progress") {
        // api şu anki yenilenme zamanı
        var thisVersionRunMilis = new Date(data.thisversionrun).getTime();
        // 15 dk sonrasında api tekrar yenilenecek
        data.nextrun = new Date(thisVersionRunMilis + apiFrequencyMilis);
        // api isteği tamamlandı
        data.lastrunstatus = "success";
        data = transform(data);
        // Değiştirilmiş verileri eskisinin üzerine yaz
        localStorage.newAnimesObject = JSON.stringify(data);
    }
    else { // "success"
    }
    // Eğer API'nin sonraki çalışma zamanı gelmişse yeni animeleri getir
    if (checkIfApiTimeCame(data.nextrun)){
      getNewAnimes(data);
    }
    else {
      var nextRunTimeText = /(..)(:..)(:..)/.exec(new Date(data.nextrun))[0];
      console.log('Henüz API güncellenmedi. nextrun: ' + nextRunTimeText);
    }
  }
}

// API'nin güncellenme zamanı geldi mi
function checkIfApiTimeCame(nextrunDate){
  // iki tarihi de milisaniye cinsinden kıyaslar
  var nextRunTime = new Date(nextrunDate).getTime();
  var currentTime = new Date().getTime();
  return currentTime >= nextRunTime ? true: false;
}


// API'den yeni animeleri çekip storage'a set etmek içindir
function getNewAnimes(localAnimes){
  console.log("newAnimesObject Ajax ile çekiliyor...");
  $.ajax({
    url:"https://www.kimonolabs.com/api/cq7nr4ag?apikey=bq34GvSZDidJFU4L4Kp7chJoJRvT0LSR",
    crossDomain: true,
    dataType: "jsonp",
    success: function (response) {
      response = transform(response);
      localStorage.newAnimesObject = JSON.stringify(response);
      console.log("newAnimesObject verisi storage'a yazıldı");
      // local'de anime listesi var mı
      if (localAnimes !== undefined){
        // localdeki animelerle yeni gelenleri kıyasla
        checkForNewAnimes(localAnimes, response);
      }
    },
    error: function (xhr, status) {
      
    }
  });
}

// Yeni gelen anime listesinde eski listeden farklı anime var mı
function checkForNewAnimes(localAnimes, newAnimes){
  console.info("Farklı anime gelmiş mi kontrol ediliyor...");
  var addedAnimes = [];
  if ($.isEmptyObject(localAnimes)) return;
  var oldAnimeList = localAnimes.results.anime;
  var newAnimeList = newAnimes.results.anime;
  $(newAnimeList).each(function(i,v){
    var isFind = false;
    $(oldAnimeList).each(function(j,y){
      var newAnimeName = v.name.text;
      var oldAnimeName = y.name.text;
      if(oldAnimeName == newAnimeName){
        isFind = true;
        return false;
      }
    });
    // Yeni anime eski anime listesinde yoksa 
    if(!isFind){
      localStorage.unreadCount = parseInt(localStorage.unreadCount) + 1;
      console.info("Yeni anime var:");
      console.log(v);
      addedAnimes.push(v);
    }
  });
  if (a.length != 0) {
    chrome.browserAction.setBadgeBackgroundColor({color:[0, 0, 0, 255]});
    chrome.browserAction.setBadgeText({text: localStorage.unreadCount});
    notificateAnimes(addedAnimes);
  }
  else{
    console.log("Yeni bir anime yok.");
  }
}

// Yeni eklenen animeleri bildirim olarak göstermek için
function notificateAnimes(addedAnimes){
  $(addedAnimes).each(function(i,v){  
    var animeName = v.name.text;        // Anime adı
    var animeLink = v.name.href;        // Anime linki
    var animeIcon = v.image.src;        // Anime icon linki
    var notTitle = animeName;            // Notification adı
    var notIcon = animeIcon;            // Notification icon
    var notBody = 'İzlemek için tıklayınız.';  // Notification text
    console.info('Bildirim atılıyor...')
    var notification = new Notification(
      notTitle, {
        icon: notIcon,
        body: notBody
      });
    // Notification'a tıklanınca anime'nin linkine gidilmesi için
    notification.addEventListener('click', function() {
      notification.close();
      window.open(animeLink);
    });
    // Bir süre sonra notification'ı kapat
    setTimeout(function(){
      notification.close();
    }, notTimeout); 
  });
}

// Gelen API yeni anime listesindeki uygun hale dönüştürmek için
function transform(data) {
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
    // Anime adı büyükse kısalt
    if(animeName.length > 34){
      animeName = animeName.substring(0,31) + "...";
    }
    animeDate = anime.date.split("yaklaşık ")[1];
    
    // Yeni özelliklerle anime nesnesinin set edilmesi
    data.results.anime[i].name.text = animeName;
    data.results.anime[i].episode   = animeEp;
    data.results.anime[i].date      = animeDate;
  }
  return data;
}

// Tüm anime listesinin getirilmesi için
function getAllList(){
  console.info("Tüm liste ajax ile çekiliyor");
  $.ajax({
    url:"https://www.kimonolabs.com/api/8j5at8tc?apikey=bq34GvSZDidJFU4L4Kp7chJoJRvT0LSR",
    crossDomain: true,
    dataType: "jsonp",
    success: function (response) {
      // ul içerisine direkt olarak eklenecek list item'lar
      var animeULDom = "";
      $(response.results.list).each(function (i,v){
        animeULDom += 
          '<li class="sLi">' +
          ' <a class="sA" href="' + v.name.href + '" target="_blank">' +
            v.name.text +
          ' </a>' +
          '</li>'
      });
      localStorage.listObject = animeULDom;
      console.info("Tüm liste storage'a yazıldı");
    },
    error: function (xhr, status) {
      
    }
  });
}

// Searchlist DOM'unun oluşturulması
function prepareSearchList(listObject){  
  $(listObject).each(function (i,v){
    $('#searchList').append(
      '<li class="sLi">' +
      ' <a class="sA" href="' + v.name.href + '" target="_blank">' +
        v.name.text +
      ' </a>' +
      '</li>'
    );
  });
  return prepareSearchList;
}