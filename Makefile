ES_HOST ?= localhost
ES_PORT ?= 9200
ES_RETRY_INTERVAL ?= 3
IFS=$' \t\r\n'

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

wipeE:
	@echo "Elasticsearch URL: http://${ES_HOST}:${ES_PORT}"
	@echo "Retrieving index names..."
	@indices=$$(curl -s -X GET http://${ES_HOST}:${ES_PORT}/_all | jq -r 'keys[]');\
	echo "Retrieved index names: $$indices";\
	for index in $$indices; do\
		trimmed_index=$$(echo "$$index" | tr -d '[:space:]');\
    	echo "Deleting index: $$index";\
		echo "URL: http://${ES_HOST}:${ES_PORT}/$$trimmed_index";\
    	curl -XDELETE "http://${ES_HOST}:${ES_PORT}/$$trimmed_index" >/dev/null;\
	done
loadE: checkE
	npm run load
resetE: wipeE loadE