var options;

$(document).ready(function(){
	getOptions();
	setPageContent();
});

// Gets options from localStorage
// If options isnt in localStorage, sets default values
function getOptions(){
	options = JSON.parse(localStorage.options);
}

function saveOptions(){
	localStorage.options = JSON.stringify(options);
	console.log('Ayarlar kaydedildi:');
	console.log(options);
}

// Set options
function setPageContent(){
	$('select#selectTimeForNewAnime').val(options.timeForNewAnimes);
	$('select#selectTimeForAllAnime').val(options.timeForAllAnimes);
	$('input#chckNotifications').prop('checked', options.hasNotifications);
	$('input#chckSound').prop('checked', options.hasNotificationSound);
}

$(document).on('change', 'select#selectTimeForNewAnime, select#selectTimeForAllAnime, input#chckNotifications, input#chckSound', function(e){
	var val = $(this).val();
	switch($(this).attr('id')){
		case 'selectTimeForNewAnime':
			options.timeForNewAnimes = val;
			break;
		case 'selectTimeForAllAnime':
			options.timeForAllAnimes = val;
			break;
		case 'chckNotifications':
			options.hasNotifications = ($(this).is(":checked") ? true : false);
			break;
		case 'chckSound':
			options.hasNotificationSound = ($(this).is(":checked") ? true : false);
			break;
	}
	saveOptions();
});

$(document).on('change', 'select#selectTimeForAllAnime', function(e){
	options.timeForAllAnimes = $(this).val();
	saveOptions();
});