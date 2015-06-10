var followList;
$(document).ready(function(){
	prepareFollowList();
	fillTable();
});

function prepareFollowList(){
	if(localStorage.followList === undefined){
		var emptyObject = {};         
		emptyObject['animes'] = [];          
		localStorage.followList = JSON.stringify(emptyObject);
		followList = emptyObject;
	}
	else {
		followList = JSON.parse(localStorage.followList);
	}
}

function fillTable(){
	var listItems = $(localStorage.listObject);
	var $table = $('table#tblAllList>tbody');
	$(listItems).each(function(i,v){
		var animeHref = $(v).html();
		var isFollowing = checkIfFollowing($(animeHref).html());
		$table.append(
			'<tr class="' + + '">' +
		    '  	<td class="index">' + (i+1) + '</td>' +
		    '  	<td class="name">' + animeHref + '</td>' +
		    '  	<td class="status">' +
            '   	<input class="chckFollow" type="checkbox">' + 
		    '	</td>' +
		    '</tr>'
		);
	});
}

function checkIfFollowing(animeName){
	if($.inArray(animeName, followList.animes) >= 0){
		return true;
	}
}

// Autosearch özelliği için
$('input#txtSearch').on('keyup', function(e){
    var that = this, $allListElements = $('td.name');
   // Eşleşen elemanlar
    var $matchingListElements = $allListElements.filter(function(i, li){
      // İki kelimenin de case'leri eşitleniyor
      var listItemText = $(li).text().toUpperCase();
      var searchText = that.value.toUpperCase();
      // Searchtext index'i varsa true dönecek
      return ~listItemText.indexOf(searchText);
    });
    
    $allListElements.parents('tr').hide();
    $matchingListElements.parents('tr').show();
});

$(document).on('change', '.chckFollow', function(e){
	var clickedRow =  $(this).parents('tr');
	var followedAnime = $(clickedRow).find('a').html();
	var clickValue = $(this).val();
	if(clickValue == 'on'){
		$(clickedRow).addClass('success');
		if($.inArray(followedAnime, followList.animes) < 0){
			followList.animes.push(followedAnime);
		}
	}
	else{
		$(clickedRow).removeClass('success');
		followList.animes.pop(followedAnime);
	}
	localStorage.followList = JSON.stringify(followList);
});