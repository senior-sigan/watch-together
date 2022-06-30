.PHONY: run
run:
	poetry run uvicorn app.web:app --host=0.0.0.0 --port=5005

.PHONY: lint
lint:
	poetry run mypy app
	poetry run flake8 .