// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var bgTimeInterval = 15000; // 5dk'da bir
var storage = chrome.storage.local;
var newAnimes;

// Başlangıçta içeriklerin getirilmesi için
$(document).ready(function(){
  storeNewAnimes();
});

setInterval(function(){
  var currentTimeText = /(..)(:..)(:..)/.exec(new Date())[0];
  console.log("Servis çalışıyor: " + currentTimeText);
  storeNewAnimes();
}, bgTimeInterval);

function storeNewAnimes(){
  // Storage'da kaydedilen önceki animeleri getir
  storage.get(newAnimes, function (data) {
    // Eğer veriler storage'da yoksa yenilerini API'den çek
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
      storage.set(newAnimes);
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

/*
  Displays a notification with the current time. Requires "notifications"
  permission in the manifest file (or calling
  "Notification.requestPermission" beforehand).
*/
// function show() {
//   var time = /(..)(:..)/.exec(new Date());     // The prettyprinted time.
//   var hour = time[1] % 12 || 12;               // The prettyprinted hour.
//   var period = time[1] < 12 ? 'a.m.' : 'p.m.'; // The period of the day.
//   var timeText = hour + time[2] + ' ' + period;
//   var notTitle = timeText;          // Notification title
//   var notIcon = '../img/icon.png';  // Notification icon
//   var notBody = 'Yeni anime geldi'  // Notification text
//   var notTimeout = 5000;            // 5sn sonra kapanacak
//   var notification = new Notification(
//     notTitle, {
//       icon: notIcon,
//       body: notBody
//     });

//   setTimeout(function(){
//     notification.close();
//   }); 
  
// }

// // Conditionally initialize the options.
// if (!localStorage.isInitialized) {
//   localStorage.isActivated = true;   // The display activation.
//   localStorage.frequency = 1;        // The display frequency, in minutes.
//   localStorage.isInitialized = true; // The option initialization.
// }

// // Test for notification support.
// if (window.Notification) {
//   // While activated, show notifications at the display frequency.
//   if (JSON.parse(localStorage.isActivated)) { show(); }

//   var interval = 0; // The display interval, in minutes.

//   setInterval(function() {
//     interval++;

//     if (JSON.parse(localStorage.isActivated) &&
//         localStorage.frequency <= interval) 
//     {
//       show();
//       interval = 0;
//     }
//   }, bgTimeInterval); // 5dk
// }
