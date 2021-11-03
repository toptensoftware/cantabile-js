PATH  := $(PATH);./node_modules/.bin

./www/cantabile-js.js: *.js
	npm install
	browserify --standalone Cantabile -o ./www/cantabile-js.js -t [ babelify ] CantabileApi.js
	uglifyjs -o ./www/cantabile-js.min.js ./www/cantabile-js.js

clean:
	rm -rf www

