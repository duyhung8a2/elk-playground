import { Client } from "@elastic/elasticsearch";
import { readFileSync } from "fs";

const client = new Client({
  node: "http://localhost:9200",
});
export interface Post {
  id: number;
  title: string;
  content: string;
  file_content: null;
  post_uuid: string;
  user_id: number;
  parent_post_id: null;
  group_id: number;
  create_at: Date;
  update_at: Date;
  deleted: boolean;
}
const jsonData = readFileSync("dataset/posts.json", "utf-8");
const posts: Post[] = JSON.parse(jsonData);

async function indexPosts() {
  console.log("ready to index");
  let bulkBody: any[] = [];

  for (const post of posts) {
    const doc = {
      ...post,
    };

    bulkBody.push({ index: { _index: "posts", _id: post.id.toString() } });
    bulkBody.push(doc);

    if (bulkBody.length > 2000) {
      console.log("length", bulkBody.length);

      await client.bulk({ operations: bulkBody });
      bulkBody = [];
    }
  }
  if (bulkBody.length > 0) {
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
