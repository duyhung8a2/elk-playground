ES_HOST ?= localhost
ES_PORT ?= 9200
ES_RETRY_INTERVAL ?= 5

.PHONY: copyCert checkCert upEKM upE downE loadE resetE

copyCert:
	mkdir tmp 2>/dev/null && docker cp elk-playground-es01-1:/usr/share/elasticsearch/config/certs/ca/ca.crt ./tmp/.
checkCert:
	curl --cacert ./tmp/ca.crt -u elastic:password https://localhost:9200
upEKM:
	docker-compose up setup es01 kibana metricbeat01 -d
upE:
	docker-compose -f docker-compose-es.yml up -d
downE:
	docker-compose -f docker-compose-es.yml down -v
checkE:
	@echo "Checking Elasticseach health..."
	@while ! curl -s -f http://${ES_HOST}:${ES_PORT}/_cluster/health >/dev/null; do \
		echo "Elasticsearch is not healthy. Retry in ${ES_RETRY_INTERVAL} seconds..."; \
		sleep ${ES_RETRY_INTERVAL}; \
	done
	@echo "Elasticsearch is healthy."
loadE: checkE
	npm run load
resetE: downE upE loadE