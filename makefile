./www/cantabile-js.js: *.js
	browserify --standalone Cantabile -o ./www/cantabile-js.js -t [ babelify ] CantabileApi.js
	uglifyjs -o ./www/cantabile-js.min.js ./www/cantabile-js.js
