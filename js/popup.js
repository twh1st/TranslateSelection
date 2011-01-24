google.load("language", "1");
function start() {
	setStrings()
	if(localStorage.getItem('preferred') !== null && localStorage.getItem('version') === null){
		window.location.hash = 'updates';
		localStorage.setItem('version','1.1.4');
	}
	init();
	$('#fromto').change(function() {
		localStorage.setItem('from', $(this).val().split('|')[0])
		localStorage.setItem('to', $(this).val().split('|')[1])
		doTranslation();
	});
	
	$('#from').keyup(doTranslation).mouseup(doTranslation);
	
	
	chrome.tabs.getSelected(null, function(tab) { // get selected string in current tab
		if(/^https:\/\/chrome\.google\.com\/extensions[?/]?/.test(tab.url)) {
			$('#noAutomatic').show();
		}
		chrome.tabs.executeScript(tab.id,{file:'js/content.js',allFrames:true},injCallBack);
	});
//	chrome.tabs.getSelected(null, function(tab) { // get selected string in current tab
//		chrome.tabs.sendRequest(tab.id, getRequest, getRequestResponseCallback)
//	});
	return;
};
var injCallBack = function(){
	chrome.tabs.getSelected(null, function(tab) { // get selected string in current tab
		chrome.tabs.sendRequest(tab.id, getRequest, getRequestResponseCallback)
	});
}
var getRequest = {
	'method': 'get'
};
var getRequestResponseCallback = function getRequestResponseCallback(response) {
	$('#from').val(response.text);
	doTranslation();
};
function setStrings(){
	$('#selFrom option:first-child').html(t('detectLanguage'));
	$('#selTo option:first-child').html(t('automatic'));
	$('label[for="from"]').html(t('sourceText'));
	$('label[for="to"]').html(t('translatedText'));
	$('#extdescription').html(t('description'));
	$('#noAutomatic').html(t('noAutomatic'));
	$('.extTitle').html(t('name'));
	$('a[href="#main"],a[href="#-x"]').attr('title', t('close'));
	$('a[href="#main"].icon-check').attr('title', t('save')).html(t('save'));
	$('a[href="#options"]').attr('title', t('settings'));
//	$('#btClose').attr('title', t('close'));
}

var savePrefs = function savePrefs() {
	var preferred = [];
//	var froms = $('#options select[name=preffrom]');
//	var tos = $('#options select[name=prefto]');
	for (var i = 0, max = $('#options select[name=preffrom]').length; i < max; i++) {
		preferred.push($($('#options select[name=preffrom]').get(i)).val() + '|' + $($('#options select[name=prefto]').get(i)).val());
	}
	localStorage.setItem('preferred', JSON.stringify(preferred));
	init();
	chrome.extension.getBackgroundPage().start();
};
function init(){
	$('.preferredrow, #fromto option').remove();
	if (localStorage.getItem('from') === null) {
		localStorage.setItem('from', '');
	}
	
	if (localStorage.getItem('to') === null) {
		localStorage.setItem('to', '');
	}
	if (localStorage.getItem('preferred') === null) {
		localStorage.setItem('preferred', JSON.stringify(["|"+window.navigator.language]));
		window.location.hash = 'options';
	}
	var preferred = JSON.parse(localStorage.getItem('preferred'));
	for (var i = 0, max = preferred.length; i < max; i++) {
		var un;
		createPreferredRow(un, preferred[i]);
		var optString = '';
		var L = JSONSwitch(LANGUAGES);
		optString += preferred[i].split('|')[0] ? L[preferred[i].split('|')[0]] : t('detectLanguage');
		optString += ' &raquo; ';
		optString += preferred[i].split('|')[1] ? L[preferred[i].split('|')[1]] : t('detectLanguage');
		$('<option>').attr('value', preferred[i]).html(optString).appendTo($('#fromto'));
	}
	$('#fromto').val(localStorage.getItem('from')+'|'+localStorage.getItem('to'));
}
var createPreferredRow = function(event, pair) {
	if (typeof event === 'object') {
		event.preventDefault();
	}
	var spf = $('<select name="preffrom"/>').change(savePrefs);
	var spt = $('<select name="prefto"/>').change(savePrefs);
	$('<option>').attr('value', '').html(t('detectLanguage')).appendTo(spf);
	for (var currlang in LANGUAGES) {
		if(LANGUAGES[currlang]) {
			$('<option>').attr('value', LANGUAGES[currlang]).html(LANGUAGES[currlang] ? currlang : t('detectLanguage')).appendTo(spf);
			$('<option>').attr('value', LANGUAGES[currlang]).html(LANGUAGES[currlang] ? currlang : t('detectLanguage')).appendTo(spt);
		}
	}
	var plusButton = $('<button>').addClass('button ico notxt icon-plus').click(function(event) {
		event.preventDefault();
		createPreferredRow(event, "|");
		savePrefs()
	}).html(t('add')).attr('title',t('add'));
	var minusButton = $('<button>').addClass('button ico notxt icon-minus').click(function(event) {
		event.preventDefault();
		
		if ($('div.preferredrow', $(this).closest('div').closest('form')).length > 1) {
			$(this).closest('div').remove();
			savePrefs()
		}
	}).html(t('remove')).attr('title',t('remove'));
	$(spf).val(pair.split("|")[0]);
	$(spt).val(pair.split("|")[1]);
	$('<div>').addClass('preferredrow').append(spf).append(spt).append(plusButton).append(minusButton).appendTo($('#options form'));
}

var doTranslation = function doTranslation() {
	var F = $('#from').val(),
	    T = '';
	if(F.replace(/^\s+|\s+$/)!=='') $('#to').html(T).addClass('loading');
	$.ajax({
		type:'POST',
		url : 'https://ajax.googleapis.com/ajax/services/language/translate',
		dataType : 'json',
		data : {
			q : $('#from').val(),
			v : '1.0',
			langpair : $('#fromto').val()
		},
		success : function(data){
			if(data.responseStatus == 200) {
				T = data.responseData.translatedText;
			} else {
				T = 'ERROR: '.data.responseDetails;
			}
			$('#to').html(T).removeClass('loading');
		},
		error : function (xhr, status, error){
			T = 'Unexpeceted error occurred!';
			$('#to').html(T).removeClass('loading');
		}
	});
};
/*
 * Defaults
 */
google.setOnLoadCallback(function(){
	LANGUAGES = google.language.Languages;
	start();
});