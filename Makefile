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

define get_lan_ip
$(shell ip route get 1.1.1.1 2>/dev/null | awk '{for (i = 1; i <= NF; i++) if ($$i == "src") { print $$(i + 1); exit }}' || hostname -I 2>/dev/null | awk '{print $$1}')
endef

all: dev

dev:
	@bash -c 'cd front ; ./mkcert-v1.4.4-linux-amd64 ft_transcendance.com localhost 127.0.0.1 ; cd ..'
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

ip:
	@IP="$(call get_lan_ip)"; \
	if [ -z "$$IP" ]; then IP="127.0.0.1"; fi; \
	echo "Primary LAN IP: $$IP"; \
	echo "Open from another device: https://$$IP:3000"; \
	echo "Backend API: https://$$IP:8000"; \
	echo "Realtime WS: ws://$$IP:8001"; \
	echo ""; \
	echo "Other LAN URLs:"; \
	ip -br addr show up 2>/dev/null | awk '$$1 !~ /^(lo|docker|br-|veth)/ { for (i = 3; i <= NF; i++) { split($$i, addr, "/"); if (addr[1] ~ /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/) print "  http://" addr[1] ":3000" } }'

db-reset:
	$(COMPOSE_DEV) down -v

clean: down
	@rm -rf front/ft_transcendance.com+2-key.pem
	@rm -rf front/ft_transcendance.com+2.pem
	@rm -rf front/node_modules
	@rm -rf back/node_modules

fclean: down
	@docker system prune -af

re: fclean all

.PHONY: all prod dev up down restart logs ps ip db-reset clean fclean re
