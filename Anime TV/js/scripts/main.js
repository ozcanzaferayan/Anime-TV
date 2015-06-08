chrome.storage.sync.get(['selectedSite'], function(object){
	$('#selectedSiteName').html(object.selectedSite);

	refreshLastEpisodes();
});

$(document).on('click', '#siteSelect', function(){
	var visible = $('#siteSelectMenu').attr('data-visible');

	if(visible == 'false')
	{
		$('#siteSelectMenu').slideDown(100);
		$('#siteSelectMenu').attr('data-visible', 'true');
	}
	else if(visible == 'true')
	{
		$('#siteSelectMenu').slideUp(100);
		$('#siteSelectMenu').attr('data-visible', 'false');
	}
	
	$('body').one('click', function(e){
		if(!$(e.target).is('#siteSelect') && $(e.target).parents('#siteSelect').length == 0)
		{
			$('#siteSelectMenu').slideUp(100);
			$('#siteSelectMenu').attr('data-visible', 'false');
		}
	});
});

$(document).on('click', '#siteSelectMenu li', function(){
	var selectedSite = $(this).attr('data-value');
	
	$('#siteSelectMenu li').removeClass('selected');
	$(this).addClass('selected');
	$('#selectedSiteName').html(selectedSite);
	
	chrome.storage.sync.set({'selectedSite': selectedSite});
	
	refreshLastEpisodes();
});

$(document).on('click', '.imdbRating', function(){
	var imdbId = $(this).attr('data-imdb-id');

	window.open('http://www.imdb.com/title/' + imdbId, '_blank');
});

function refreshLastEpisodes(){
	chrome.storage.sync.get(['selectedSite'], function(object){
		var siteUrl = 'https://www.kimonolabs.com/api/ad2vqlde?apikey=BkDVi2NIoIbVhp4S8bSM8BvgLWIGdjNx';
	
		if(object.selectedSite == 'DiziBox')
			siteUrl = 'https://www.kimonolabs.com/api/ad2vqlde?apikey=BkDVi2NIoIbVhp4S8bSM8BvgLWIGdjNx';
		else if(object.selectedSite == 'DiziPub')
			siteUrl = 'https://www.kimonolabs.com/api/2gl5b3fc?apikey=BkDVi2NIoIbVhp4S8bSM8BvgLWIGdjNx';
		else if(object.selectedSite == 'DiziLab')
			siteUrl = 'https://www.kimonolabs.com/api/94f0bgau?apikey=BkDVi2NIoIbVhp4S8bSM8BvgLWIGdjNx';
		
		$('#lastEpisodesSection').html('<div id="loadingGif"></div>');
		
		$.ajax({
			url: siteUrl,
			dataType: "json",
			success: function (response) {
				if($(response.results).length == 0)
				{
					
					return;
				}
				
				$('#lastEpisodesSection').html('<ul>');
				
				$(response.results.Series).each(function(){
					$('#lastEpisodesSection ul').append('<li class="appendAnimation" data-series-name="' + this.Name.text + '">\
														<a href="' + this.Episode.href + '" target="_blank">\
															<img class="seriesImage" src="' + this.Image.src + '" width="120" height="70" />\
															<div class="seriesDetails">\
																<div class="seriesName">' + this.Name.text + '</div>\
																<div class="episodeName">' + this.Episode.text + '</div>\
																<div class="episodeDate">' + (typeof(this.Date) !== 'undefined' ? this.Date : '') + '</div>\
																<div class="imdbRating">\
																	IMDB: <span class="imdbRatingValue" style="font-weight:bolder; font-size:14px;">-</span>\
																</div>\
															</div>\
														</a>\
													</li>');
					
					updateImdbRating(this.Name.text);
				});
				
				$('#lastEpisodesSection').append('</ul>');
			},
			error: function (xhr, status, error) {
				alert(error);
			}
		});
	});
}

function updateImdbRating(seriesName){
	$.ajax({
		url: 'http://www.omdbapi.com/?t=' + seriesName + '&y=&plot=short&r=json',
		dataType: "json",
		success: function (response) {
			var rating = (response.imdbRating == 'N/A' ? '-' : response.imdbRating);
		
			$('#lastEpisodesSection li[data-series-name="' + seriesName + '"]').find('.imdbRatingValue').html(rating);
			$('#lastEpisodesSection li[data-series-name="' + seriesName + '"]').find('.imdbRating').attr('data-imdb-id', response.imdbID);
			
			if(rating != '-')
				$('#lastEpisodesSection li[data-series-name="' + seriesName + '"]').find('.imdbRating').show();
		}
	});
}