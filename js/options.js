function start() {
	setStrings()
	init();
};
function setStrings(){
	$('#selFrom option:first-child').html(t('detectLanguage'));
	$('#selTo option:first-child').html(t('automatic'));
	$('label[for="from"]').html(t('sourceText'));
	$('label[for="to"]').html(t('translatedText'));
	$('#extdescription').html(t('extDescription'));
	$('#nosave').html(t('noSaveNeeded'));
}

var savePrefs = function savePrefs() {
	var preferred = [];
	for (var i = 0, max = $('select[name=preffrom]').length; i < max; i++) {
		preferred.push($($('select[name=preffrom]').get(i)).val() + '|' + $($('select[name=prefto]').get(i)).val());
	}
	localStorage.setItem('preferred', JSON.stringify(preferred));
	localStorage.username = usernametextbox.val();
	localStorage.password = passwordtextbox.val();
	localStorage.deck = decktextbox.val();
	localStorage.addtoanki = addtoankitextbox.attr("checked");
	
	init();
	chrome.extension.getBackgroundPage().start();
};
function init(){
	createAnkiOptions();
	
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
	}
}

function createAnkiOptions() {
	
	$('.ankiprefs').remove();
	
	var ankiprefs = $('<div>').addClass('ankiprefs');
	var sput = $('<p>Enter your Anki username. </p>');
	var spuf = $('<p><input type="text" id="username" /></p>').change(savePrefs);
	ankiprefs.append(sput).append(spuf);
	
	var sppt = $('<p>Enter your Anki password. </p>');
	var sppf = $('<p><input type="password" id="password" /></p>').change(savePrefs);
	ankiprefs.append(sppt).append(sppf);
	
	var spdt = $('<p>Enter deck where new words should be added.. </p>');
	var spdf = $('<p><input type="text" id="deck" /></p>').change(savePrefs);
	ankiprefs.append(spdt).append(spdf);
	
	var spat = $('<p>Is Add to Anki feature enabled? </p>');
	var spaf = $('<p><input type="checkbox" id="addtoanki" /></p>').change(savePrefs);
	ankiprefs.append(spat).append(spaf);
	
	ankiprefs.appendTo($('.formanki'));

	usernametextbox = $("#username");
	usernametextbox.val(localStorage.username || "");
	
	passwordtextbox = $("#password");
	passwordtextbox.val(localStorage.password || "");
	
	decktextbox = $("#deck");
	decktextbox.val(localStorage.deck || "");
	
	addtoankitextbox = $("#addtoanki");	
	
	if (localStorage.addtoanki == "true") {
	   addtoankitextbox.attr("checked",true);
    }
	
};

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
	$('<div>').addClass('preferredrow').append(spf).append(spt).append(plusButton).append(minusButton).appendTo($('.formlang'));
}

$(document).ready(function(){
	LANGUAGES = {};
	LOCALE = "";
	chrome.i18n.getAcceptLanguages( function(L) {
		LOCALE = L[0];
		currentLanguages = Microsoft.Translator.GetLanguages();
		languageNames = Microsoft.Translator.getLanguageNames(LOCALE);
		for(var i = 0; i < currentLanguages.length; i++) {
			LANGUAGES[languageNames[i]] = currentLanguages[i];
		}
		start();
	} );
});
