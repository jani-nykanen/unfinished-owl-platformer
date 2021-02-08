
.PHONY: js
js:
	#mkdir -p output
	#mkdir -p output/src
	tsc src/*.ts --module es6 --outDir output/src

server:
	python3 -m http.server

linecount:
	(cd src; find . -name '*.ts' | xargs wc -l)
