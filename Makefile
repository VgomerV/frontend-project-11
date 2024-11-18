# Makefile

install:
	npm ci

publish:
	npm publish --dry-run

lint:
	npx eslint .

server:
	npm run serve
