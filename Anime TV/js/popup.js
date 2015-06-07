// Yeni eklenen anime nesnelerini cachelemek içindir
var allList;
// chrome.storage.local nesnesidir
var storage;

document.addEventListener('DOMContentLoaded', main);
function main() {
  storage = chrome.storage.local;
  addSpinner();
  getItems();
  getAllList();
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
    $(response.results.anime).each(function(i,v){
      var titleText =  v.name.text;
      var parts = titleText.split(/ ([0-9]*. Bölüm \w+)/);
      if (parts.length == 1) {
        parts = titleText.split(/ ([0-9]*. Bölüm)/);
      }
      var title, episode;
      if (parts.length == 1) {
        title = titleText;
        episode = "";
      }
      else {
        title = parts[0];
        episode = parts[1];
      }
      var likes = v.likes.text;
      var dislikes = v.dislikes.text;
      var date = v.date.split("yaklaşık ")[1];
      $('ul#newList').append(
        '<li class="newListAnim">' +
        ' <a href="' + v.name.href + '" target="_blank">'+
        '   <img src="' + v.image.src + '">' +
        '   <div class="details">' +
        '     <div class="title">' + title + '</div>' +
        '     <div class="ep">' + episode + '</div>' +
        '     <div class="likes">' + 
        '       &#128077;' + likes + 
        '       &#128078;' + dislikes +  
        '     </div>' +  
        '     <div class="date">' + date + '</div>' +
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