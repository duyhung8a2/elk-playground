import { Client } from "@elastic/elasticsearch";
import { runIndex } from "./utils";
import { indexPosts, indexUsers } from "./indexES";

export const client = new Client({
  node: "http://localhost:9200",
});

runIndex(() => indexPosts());
runIndex(() => indexUsers());
