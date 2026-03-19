PATH  := $(PATH);./node_modules/.bin

./www/cantabile-js.js: *.js
	npm install
	npm run build

docs:
	yuidoc -c yuidoc.json .
	cp logo.png ./doc/
	rm -rf ../cantabilesoftware.com/content/jsapi
	cp -r ./doc ../cantabilesoftware.com/content/jsapi

clean:
	rm -rf www

