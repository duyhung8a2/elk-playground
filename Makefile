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