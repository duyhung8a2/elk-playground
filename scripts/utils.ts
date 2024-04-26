export const runIndex = async (index: () => Promise<void>) => {
  try {
    await index();
    console.log("Indexed successfully");
  } catch (error) {
    console.error("Error indexing:", error);
  }
};
