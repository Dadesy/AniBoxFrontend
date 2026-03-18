COMPOSE := docker compose -f docker-compose.yml
LOCAL_COMPOSE := docker compose -f docker-compose.yml -f docker-compose.local.override.yml
BUILD_ENV := DOCKER_BUILDKIT=1 BUILDKIT_PROGRESS=plain

.PHONY: help
help:
	@echo ""
	@echo "  Frontend"
	@echo ""
	@echo "  make up           Собрать и запустить production-стек"
	@echo "  make down         Остановить production-стек"
	@echo "  make restart      Перезапустить production-стек"
	@echo "  make build        Пересобрать production-образ frontend"
	@echo "  make up-local     Собрать и запустить локальный dev-стек"
	@echo "  make down-local   Остановить локальный dev-стек"
	@echo "  make restart-local Перезапустить локальный dev-стек"
	@echo "  make build-local  Пересобрать dev-образ frontend"
	@echo "  make clean-local  Остановить dev-стек и удалить его volumes"
	@echo "  make logs         Логи frontend"
	@echo "  make ps           Статус контейнера"
	@echo "  make sh           Shell внутри контейнера frontend"
	@echo "  make clean        Остановить стек и удалить volumes"
	@echo "  make clean-images Удалить локально собранный образ"
	@echo ""

.PHONY: up
up:
	$(BUILD_ENV) $(COMPOSE) up -d --build

.PHONY: down
down:
	$(COMPOSE) down

.PHONY: restart
restart: down up

.PHONY: build
build:
	$(BUILD_ENV) $(COMPOSE) build --no-cache frontend

.PHONY: up-local
up-local:
	$(BUILD_ENV) $(LOCAL_COMPOSE) up -d --build

.PHONY: down-local
down-local:
	$(LOCAL_COMPOSE) down

.PHONY: restart-local
restart-local: down-local up-local

.PHONY: build-local
build-local:
	$(BUILD_ENV) $(LOCAL_COMPOSE) build --no-cache frontend

.PHONY: clean-local
clean-local:
	$(LOCAL_COMPOSE) down -v

.PHONY: logs
logs:
	$(COMPOSE) logs -f frontend

.PHONY: ps
ps:
	$(COMPOSE) ps

.PHONY: sh
sh:
	$(COMPOSE) exec frontend sh

.PHONY: clean
clean:
	$(COMPOSE) down -v

.PHONY: clean-images
clean-images:
	$(COMPOSE) down --rmi local

.PHONY: clean-images-local
clean-images-local:
	$(LOCAL_COMPOSE) down --rmi local
