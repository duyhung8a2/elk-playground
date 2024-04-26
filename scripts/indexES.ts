import { readFileSync } from "fs";
import { pick } from "radash";
import { client } from "./initES";
import { Post, User } from "./types";

const ITEM_PER_BULK = 5000;
const POSTS_INDEX_NAME = "post";
const USERS_INDEX_NAME = "user";

const postJsonData = readFileSync("dataset/posts.json", "utf-8");
const posts: Post[] = JSON.parse(postJsonData);
let postsLength = posts.length;

const userJsonData = readFileSync("dataset/users.json", "utf-8");
const users: User[] = JSON.parse(userJsonData);
let usersLength = users.length;

export const indexUsers = async (
  indexName = USERS_INDEX_NAME,
  itemPerBulk = ITEM_PER_BULK,
  itemsLength = usersLength,
  items = users
) => {
  console.log(`Ready to index ${indexName}`, {
    indexName,
    itemPerBulk,
    itemsLength,
  });
  console.time(`index-${indexName}`);

  await client.indices.create({
    index: indexName,
    mappings: {
      properties: {
        name: {
          type: "text",
          fields: {
            completion: {
              type: "completion",
            },
          },
        },
        phone: {
          type: "keyword",
        },
        email: {
          type: "keyword",
        },
        access_count: {
          type: "integer",
        },
      },
    },
  });

  let bulkBody: any[] = [];

  for (const item of items) {
    const doc = pick(item, ["id", "name", "phone", "email"]);

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
  await client.indices.refresh({ index: indexName });
  console.timeEnd(`index-${indexName}`);
};
export const indexPosts = async (
  indexName = POSTS_INDEX_NAME,
  itemPerBulk = ITEM_PER_BULK,
  itemsLength = postsLength,
  items = posts
) => {
  console.log(`Ready to index ${indexName}`, {
    indexName,
    itemPerBulk,
    itemsLength,
  });
  console.time(`index-${indexName}`);

  await client.indices.create({
    index: POSTS_INDEX_NAME,
    mappings: {
      properties: {
        title: {
          type: "text",
          fields: {
            completion: {
              type: "completion",
            },
          },
        },
        content: {
          type: "text",
        },
        access_count: {
          type: "integer",
        },
      },
    },
  });

  let bulkBody: any[] = [];

  for (const item of items) {
    const doc = pick(item, ["id", "title", "content"]);

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
  await client.indices.refresh({ index: indexName });
  console.timeEnd(`index-${indexName}`);
};
