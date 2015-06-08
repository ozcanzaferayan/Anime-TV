// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var bgTimeInterval = 60000; // 1dk'da bir servis çalışacak
var storage = chrome.storage.local;
var newAnimes;
var allList;

// Başlangıçta içeriklerin getirilmesi için
$(document).ready(function(){
  storeNewAnimes();
  getAllList();
});

setInterval(function(){
  var currentTimeText = /(..)(:..)(:..)/.exec(new Date())[0];
  console.log("Servis çalışıyor: " + currentTimeText);
  storeNewAnimes();
}, bgTimeInterval);

function storeNewAnimes(){
  // Storage'da kaydedilen önceki animeleri getir
  storage.get('newAnimesObject', function (data) {
    // Eğer veriler storage'da yoksa yenilerini API'den çek
    data = data.newAnimesObject;
    if($.isEmptyObject(data) || chrome.runtime.lastError) {
      console.log("newAnimes verisi storage'da yok.");
      getNewAnimes(data);
     }
    // Eğer veriler storage'da varsa güncellemek için kontrol et
    else {
      console.log("newAnimes storage'da var:");
      console.log(data);
      if (data.lastrunstatus == "in progress") {
          // api şu anki yenilenme zamanı
          var thisVersionRunMilis = new Date(newAnimes.thisversionrun).getTime();
          var apiFrequencyMilis = 15 * 60 * 1000; // 15dk
          // 15 dk sonrasında api tekrar yenilenecek
          data.nextrun = new Date(thisVersionRunMilis + apiFrequencyMilis);
          // api isteği tamamlandı
          data.lastrunstatus == "success";
          newAnimes = data;
          newAnimes = transform(newAnimes);
          storage.set(newAnimes);
      }
      else { // "success"

      }
      var nextRunTime = new Date(data.nextrun).getTime();
      var currentTime = new Date().getTime();
      // Eğer API'nin sonraki çalışma zamanı gelmişse yeni animeleri getir
      if (currentTime >= nextRunTime){
        getNewAnimes(data);
      }
      else {
        var nextRunTimeText = /(..)(:..)(:..)/.exec(new Date(nextRunTime))[0];
        console.log('Henüz API güncellenmedi. nextrun: ' + nextRunTimeText);
      }
    }
  });
}



// API'den yeni animeleri çekip storage'a set etmek içindir
function getNewAnimes(oldAnimes){
  $.ajax({
    url:"https://www.kimonolabs.com/api/cq7nr4ag?apikey=bq34GvSZDidJFU4L4Kp7chJoJRvT0LSR",
    crossDomain: true,
    dataType: "jsonp",
    success: function (response) {
      newAnimes = response;
      console.log('newAnimes:');
      console.log(newAnimes);
      console.log('oldAnimes:');
      console.log(oldAnimes);
      newAnimes = transform(newAnimes);
      storage.set({'newAnimesObject' : newAnimes});
      checkForNewAnimes(oldAnimes, newAnimes);
    },
    error: function (xhr, status) {
      
    }
  });
}

// Yeni gelen anime listesinde eski listeden farklı anime var mı
function checkForNewAnimes(oldAnimes, newAnimes){
  var addedAnimes = [];
  if ($.isEmptyObject(oldAnimes)) return;
  var oldAnimeList = oldAnimes.results.anime;
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
      addedAnimes.push(v);
    }
  });
  notificateAnimes(addedAnimes);
}

// Yeni eklenen animeleri bildirim olarak göstermek için
function notificateAnimes(addedAnimes){
  $(addedAnimes).each(function(i,v){  
    var animeName = v.name.text;        // Anime adı
    var animeLink = v.text.href;        // Anime linki
    var animeIcon = v.image.src;        // Anime icon linki
    var notTitle = timeText;            // Notification adı
    var notIcon = animeIcon;            // Notification icon
    var notBody = 'Yeni anime geldi!';  // Notification text
    var notTimeout = 5000;              // 5sn sonra kapanacak
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
    setTimeout(function(){
      notification.close();
    }, notTimeout); 
  });
}

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
  storage.get('listObject', function (data) {
    if($.isEmptyObject(data) || chrome.runtime.lastError) {
      console.log("listObject verisi yok");
      $.ajax({
        url:"https://www.kimonolabs.com/api/8j5at8tc?apikey=bq34GvSZDidJFU4L4Kp7chJoJRvT0LSR",
        crossDomain: true,
        dataType: "jsonp",
        success: function (response) {
          allList = response.results.list;
          console.log(allList);
          storage.set({'listObject': allList});
        },
        error: function (xhr, status) {
          
        }
      });
    }
    else {
      console.log('listObject verisi cachede');
    }
  });
}