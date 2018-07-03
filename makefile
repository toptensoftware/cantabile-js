../themes/lib.webfolder/CantabileApi.js: *.js
	browserify --standalone Cantabile -o ../themes/lib.webfolder/CantabileApi.js CantabileApi.js 

doc:
	yuidoc .
	cp logo.png ../../cantabilesoftware.com/content/jsapi

clean:
	rm -rf ../../cantabilesoftware.com/content/jsapi
	rm ../themes/lib.webfolder/CantabileApi.js

