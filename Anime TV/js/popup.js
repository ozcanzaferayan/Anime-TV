// Yeni eklenen anime nesnelerini cachelemek içindir
var allList;
// chrome.storage.local nesnesidir
var storage;

document.addEventListener('DOMContentLoaded', main);
function main() {
  addSpinner();
  getItems();
  //storage = chrome.storage.local;
  //getAllList();
}

// txtSearch'e tıklandığında dropdown menü gözükmesi için
$('#txtSearch').on('focus', function(e){
    // Alt kenarlıkların düzeltilmesi için
    $('#txtSearch').css('border-radius', '3px 3px 0px 0px');
    $('#searchList').show();
});

// txtSearch'e tıklandığında dropdown menü'nün gizlenmesi için
$('#txtSearch').on('focusout', function(e){
  if (e.relatedTarget == null){
    // Boşluğa tıklanılmışsa gizle
    hideDropdownMenu();
  }
  else if (e.relatedTarget.className != 'sA'){
    // Dropdown menu'deki eleman haricinde başka bir elemana tıklanmışsa gizle
    hideDropdownMenu();
  }
  else { 
    // Dropdown menu açık kalacak
  } 
});

// Dropdown menuyu kapat ve searchbox'ın kenarlarını yuvarlaklaştır
function hideDropdownMenu(){
  $('#txtSearch').css('border-radius', '3px');
  $('#searchList').hide();
}

// Autosearch özelliği için
$('input#txtSearch').on('keyup', function(e){
    var that = this, $allListElements = $('li.sLi');
   // Eşleşen elemanlar
    var $matchingListElements = $allListElements.filter(function(i, li){
      // İki kelimenin de case'leri eşitleniyor
      var listItemText = $(li).text().toUpperCase();
      var searchText = that.value.toUpperCase();
      // Searchtext index'i varsa true dönecek
      return ~listItemText.indexOf(searchText);
    });
    
    $allListElements.hide();
    $matchingListElements.show();
});

// **Henüz aktif değil** 
// Loading spinner eklemek için
function addSpinner(){
  $('.section').prepend(
    '<div class="mod model-9">' +
    '<div class="spinner"></div>' +
    '</div>'
  );
}

function removeSpinner(){
  $('.mod').remove();
}

function getItems(){
  $.ajax({
  url:"https://www.kimonolabs.com/api/cq7nr4ag?apikey=bq34GvSZDidJFU4L4Kp7chJoJRvT0LSR",
  crossDomain: true,
  dataType: "jsonp",
  success: function (response) {
    removeSpinner();
    response = transform(response);
    $(response.results.anime).each(function(i,v){
      console.debug();
      var animeName     = v.name.text;
      var animeEp       = v.episode;
      var animeDate     = v.date;  
      var animeHref     = v.name.href;
      var animeLikes    = v.likes.text;
      var animeDislikes = v.dislikes.text;
      var animeImage    = v.image.src;
      $('ul#newList').append(
        '<li class="newListAnim">' +
        ' <a href="' + animeHref + '" target="_blank">'+
        '   <img src="' + animeImage + '">' +
        '   <div class="details">' +
        '     <div class="title">' + animeName + '</div>' +
        '     <div class="ep">' + animeEp + '</div>' +
        '     <div class="likes">' + 
        '       &#128077;' + animeLikes + 
        '       &#128078;' + animeDislikes +  
        '     </div>' +  
        '     <div class="date">' + animeDate + '</div>' +
        '   </div>' +
        ' </a>' +
        '</li>'
        
      );
    });
  },
  error: function (xhr, status) {
    //handle errors
  }
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

  
function getAllList(){
  storage.get('listObject', function (data) {
    if($.isEmptyObject(data) || chrome.runtime.lastError) {
      console.log("allList verisi yok");
      $.ajax({
        url:"https://www.kimonolabs.com/api/8j5at8tc?apikey=bq34GvSZDidJFU4L4Kp7chJoJRvT0LSR",
        crossDomain: true,
        dataType: "jsonp",
        success: function (response) {
          allList = response.results.list;
          console.log(allList);
          storage.set({'listObject': allList});
           prepareSearchList(allList);
        },
        error: function (xhr, status) {
          
        }
      });
    }
    else {
      console.log('listObject verisi cachede');
      allList = data.listObject;
      prepareSearchList(allList);
    }
   
  });
  
  
}

function prepareSearchList(allList){  
  $(allList).each(function (i,v){
    $('#searchList').append(
      '<li class="sLi">' +
      ' <a class="sA" href="' + v.name.href + '" target="_blank">' +
        v.name.text +
      ' </a>' +
      '</li>'
    );
  });
}