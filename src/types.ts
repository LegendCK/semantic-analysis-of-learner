// Type definition for microlearning resources
export type Resource = {
  id: string;
  title: string;
  url: string;
  type: "video" | "article" | "quiz";
};
