// Yeni eklenen anime nesnelerini cachelemek içindir
var allList;
// chrome.storage.local nesnesidir
var storage;
// Yeni eklenen animeler
var newAnimes;

document.addEventListener('DOMContentLoaded', main);
function main() {
  //addSpinner();
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
  var newAnimes = JSON.parse(localStorage.newAnimesObject);
  $(newAnimes.results.anime).each(function(i,v){
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
}

  
function getAllList(){
  $('#searchList').append(localStorage.listObject);
}