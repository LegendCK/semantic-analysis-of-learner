export const mockConceptMatch = async (query: string) => {
  await new Promise((r) => setTimeout(r, 1500));
  return {
    concept: "Recursion",
    resources: [
      {
        id: "1",
        title: "Recursion Explained Simply",
        url: "https://www.example.com/video",
        type: "video",
      },
      {
        id: "2",
        title: "10 Recursion Problems Solved",
        url: "https://www.example.com/article",
        type: "article",
      },
    ] as const, // 👈 tells TypeScript these are exact literals
  };
};
