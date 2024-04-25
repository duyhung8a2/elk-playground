import { Client } from "@elastic/elasticsearch";
import { readFileSync } from "fs";
import { Post } from "./types";
import { pick } from "radash";

const client = new Client({
  node: "http://localhost:9200",
});

const jsonData = readFileSync("dataset/posts.json", "utf-8");
const posts: Post[] = JSON.parse(jsonData);
let postsLength = posts.length;
async function indexPosts() {
  console.log("Ready to index");
  let bulkBody: any[] = [];

  for (const post of posts) {
    const doc = pick(post, ["id", "title", "content"]);

    bulkBody.push({ index: { _index: "posts", _id: post.id.toString() } });
    bulkBody.push(doc);

    if (bulkBody.length > 2000) {
      console.log("Records left: ", postsLength);
      await client.bulk({ operations: bulkBody });
      postsLength -= bulkBody.length / 2;
      bulkBody = [];
    }
  }
  if (bulkBody.length > 0) {
    console.log("Records left: ", postsLength);
    await client.bulk({ body: bulkBody });
  }
}

indexPosts()
  .then(() => {
    console.log("Posts indexed successfully");
  })
  .catch((error) => {
    console.error("Error indexing posts:", error);
  });
