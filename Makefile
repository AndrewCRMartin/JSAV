JSAV.min.js : JSAV.js
	uglifyjs $< --comments > $@

doc : JSAV.js
	jsdoc JSAV.js
