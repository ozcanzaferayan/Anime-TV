// Strips possible html tags from content
function stripHTML(html) {
	// Regex for html tags
	var re = /(<([^>]+)>)/ig;
	var txt = html.replace(re, "");
	return(txt);
}