PATH  := $(PATH);./node_modules/.bin

./www/cantabile-js.js: *.js
	npm install
	npm run build

docs:
	yuidoc -c yuidoc.json .
	cp logo.png ./doc/

clean:
	rm -rf www

