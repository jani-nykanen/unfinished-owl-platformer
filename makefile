
.PHONY: js
js:
	#mkdir -p output
	#mkdir -p output/src
	tsc src/*.ts --module es2020 --lib es2020,dom --outDir output/src

server:
	(cd output; python3 -m http.server)

linecount:
	(cd src; find . -name '*.ts' | xargs wc -l)
