import { Client } from "@elastic/elasticsearch";
import { readFileSync } from "fs";
import { Post } from "./types";
import { pick } from "radash";

const ITEM_PER_BULK = 5000;
const POSTS_INDEX_NAME = "post"

const client = new Client({
  node: "http://localhost:9200",
});

const jsonData = readFileSync("dataset/posts.json", "utf-8");
const posts: Post[] = JSON.parse(jsonData);
let postsLength = posts.length;

async function indexPosts() {
  console.log("Ready to index");
  console.time("index");
  let bulkBody: any[] = [];

  for (const post of posts) {
    const doc = pick(post, ["id", "title", "content"]);

    bulkBody.push({ index: { _index: POSTS_INDEX_NAME, _id: post.id.toString() } });
    bulkBody.push(doc);

    if (bulkBody.length > ITEM_PER_BULK * 2) {
      console.log("Records left: ", postsLength);
      await client.bulk({ operations: bulkBody, refresh: false });
      postsLength -= bulkBody.length / 2;
      bulkBody = [];
    }
  }
  if (bulkBody.length > 0) {
    console.log("Records left: ", postsLength);
    await client.bulk({ body: bulkBody });
  }
  console.timeEnd("index");

  await client.indices.refresh({ index: POSTS_INDEX_NAME });
}

indexPosts()
  .then(() => {
    console.log("Posts indexed successfully");
  })
  .catch((error) => {
    console.error("Error indexing posts:", error);
  });
