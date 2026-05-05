TPUT	= tput -T xterm-256color
_RESET	= $(shell $(TPUT) sgr0)
_BOLD	= $(shell $(TPUT) bold)
_ITALIC	= $(shell $(TPUT) sitm)
_UNDER	= $(shell $(TPUT) smul)
_GREEN	= $(shell $(TPUT) setaf 2)
_YELLOW	= $(shell $(TPUT) setaf 3)
_RED	= $(shell $(TPUT) setaf 1)
_GRAY	= $(shell $(TPUT) setaf 8)
_PURPLE	= $(shell $(TPUT) setaf 5)
_BLUE	= $(shell $(TPUT) setaf 26)

COMPOSE_DEV = docker compose -f docker-compose-dev.yml

all: prod

prod:
	@bash -c 'cd front && npm i'
	@bash -c './script.sh'
	@bash -c 'docker compose -f ./docker-compose-prod.yml up --build; status=$$?; if [ $$status -eq 130 ]; then exit 0; else exit $$status; fi'

dev:
	@bash -c 'docker compose -f ./docker-compose-dev.yml up --build; status=$$?; if [ $$status -eq 130 ]; then exit 0; else exit $$status; fi'

up:
	$(COMPOSE_DEV) up -d --build

down:
	$(COMPOSE_DEV) down

restart: down up

logs:
	$(COMPOSE_DEV) logs -f

ps:
	$(COMPOSE_DEV) ps

db-reset:
	$(COMPOSE_DEV) down -v

clean: down
	@rm -rf front/node_modules
	@rm -rf back/node_modules

fclean: down
	@docker system prune -af

re: fclean all

.PHONY: all prod dev up down restart logs ps db-reset clean fclean re
