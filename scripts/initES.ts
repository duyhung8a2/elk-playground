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

const index = async (
  indexName: string,
  itemPerBulk: number,
  itemsLength: number,
  items: any[],
  take: string[]
) => {
  console.log(`Ready to index ${indexName}`, {
    indexName,
    itemPerBulk,
    itemsLength,
    take,
  });
  console.time(`index-${indexName}`);
  let bulkBody: any[] = [];

  for (const item of items) {
    const doc = pick(item, take as any[]);

    bulkBody.push({
      index: { _index: indexName, _id: item.id.toString() },
    });
    bulkBody.push(doc);

    if (bulkBody.length > itemPerBulk * 2) {
      console.log(`${indexName} records left: `, itemsLength);
      await client.bulk({ operations: bulkBody, refresh: false });
      itemsLength -= bulkBody.length / 2;
      bulkBody = [];
    }
  }
  if (bulkBody.length > 0) {
    console.log(`${indexName} records left: `, itemsLength);
    await client.bulk({ body: bulkBody });
  }
  console.timeEnd(`index-${indexName}`);
  await client.indices.refresh({ index: indexName });
};

const runIndex = async (index: () => Promise<void>) => {
  try {
    await index();
    console.log("Indexed successfully");
  } catch (error) {
    console.error("Error indexing:", error);
  }
};

runIndex(() =>
  index(POSTS_INDEX_NAME, ITEM_PER_BULK, postsLength, posts, [
    "id",
    "title",
    "content",
  ])
);

runIndex(() =>
  index(USERS_INDEX_NAME, ITEM_PER_BULK, usersLength, users, [
    "id",
    "name",
    "phone",
    "email",
  ])
);
