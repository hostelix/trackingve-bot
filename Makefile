build-image:
	@echo "Building image..."
	@docker build -t trackingve-bot:latest -t trackingve-bot:$(shell cat package.json | jq -r .version) -f dockerfiles/Dockerfile .
