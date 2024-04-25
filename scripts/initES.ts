import { Client } from "@elastic/elasticsearch";
import { readFileSync } from "fs";
import { Post, User } from "./types";
import { pick } from "radash";

const ITEM_PER_BULK = 5000;
const POSTS_INDEX_NAME = "post";
const USERS_INDEX_NAME = "user";

const client = new Client({
  node: "http://localhost:9200",
});

const postJsonData = readFileSync("dataset/posts.json", "utf-8");
const posts: Post[] = JSON.parse(postJsonData);
let postsLength = posts.length;

const userJsonData = readFileSync("dataset/users.json", "utf-8");
const users: User[] = JSON.parse(userJsonData);
let usersLength = users.length;

async function indexPosts(
  indexName = POSTS_INDEX_NAME,
  itemPerBulk = ITEM_PER_BULK,
  itemsLength = postsLength
) {
  console.log("Ready to index");
  console.time("index-post");
  let bulkBody: any[] = [];

  for (const post of posts) {
    const doc = pick(post, ["id", "title", "content"]);

    bulkBody.push({
      index: { _index: indexName, _id: post.id.toString() },
    });
    bulkBody.push(doc);

    if (bulkBody.length > itemPerBulk * 2) {
      console.log("Records left: ", itemsLength);
      await client.bulk({ operations: bulkBody, refresh: false });
      itemsLength -= bulkBody.length / 2;
      bulkBody = [];
    }
  }
  if (bulkBody.length > 0) {
    console.log("Records left: ", itemsLength);
    await client.bulk({ body: bulkBody });
  }
  console.timeEnd("index-post");

  await client.indices.refresh({ index: indexName });
}

async function indexUsers(
  indexName = USERS_INDEX_NAME,
  itemPerBulk = ITEM_PER_BULK,
  itemsLength = usersLength
) {
  console.time("index-user");
  let bulkBody: any[] = [];

  for (const user of users) {
    const doc = pick(user, ["id", "name", "phone", "email"]);
    console.log(doc);

    bulkBody.push({
      index: { _index: indexName, _id: user.id.toString() },
    });
    bulkBody.push(doc);

    if (bulkBody.length > itemPerBulk * 2) {
      console.log("Records left: ", itemsLength);
      await client.bulk({ operations: bulkBody, refresh: false });
      itemsLength -= bulkBody.length / 2;
      bulkBody = [];
    }
  }
  if (bulkBody.length > 0) {
    console.log("Records left: ", itemsLength);
    await client.bulk({ body: bulkBody });
  }
  console.timeEnd("index-user");

  await client.indices.refresh({ index: indexName });
}

indexPosts()
  .then(() => {
    console.log("Posts indexed successfully");
  })
  .catch((error) => {
    console.error("Error indexing posts:", error);
  });

indexUsers()
  .then(() => {
    console.log("Users indexed successfully");
  })
  .catch((error) => {
    console.error("Error indexing users:", error);
  });
