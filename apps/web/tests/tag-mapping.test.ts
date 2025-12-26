import { describe, it, expect } from "vitest";

// Pure logic function extracted from projects page
function mapTagIdsToNames(tagIds: number[], tagsById: Map<number, string>): string[] {
  return tagIds.map((id) => tagsById.get(id)).filter(Boolean) as string[];
}

describe("tag id → name mapping", () => {
  it("converts selected tag IDs into tag names correctly", () => {
    const tagsById = new Map<number, string>([
      [1, "React"],
      [2, "TypeScript"],
      [3, "Next.js"],
    ]);

    const tagIds = [1, 3];
    const result = mapTagIdsToNames(tagIds, tagsById);

    expect(result).toEqual(["React", "Next.js"]);
  });

  it("handles empty tag IDs array", () => {
    const tagsById = new Map<number, string>([
      [1, "React"],
      [2, "TypeScript"],
    ]);

    const result = mapTagIdsToNames([], tagsById);

    expect(result).toEqual([]);
  });

  it("filters out invalid tag IDs", () => {
    const tagsById = new Map<number, string>([
      [1, "React"],
      [2, "TypeScript"],
    ]);

    const tagIds = [1, 999, 2]; // 999 doesn't exist
    const result = mapTagIdsToNames(tagIds, tagsById);

    expect(result).toEqual(["React", "TypeScript"]);
  });

  it("maintains order of tag IDs", () => {
    const tagsById = new Map<number, string>([
      [1, "A"],
      [2, "B"],
      [3, "C"],
    ]);

    const tagIds = [3, 1, 2];
    const result = mapTagIdsToNames(tagIds, tagsById);

    expect(result).toEqual(["C", "A", "B"]);
  });

  it("handles all invalid tag IDs", () => {
    const tagsById = new Map<number, string>([
      [1, "React"],
      [2, "TypeScript"],
    ]);

    const tagIds = [999, 888];
    const result = mapTagIdsToNames(tagIds, tagsById);

    expect(result).toEqual([]);
  });

  it("handles duplicate tag IDs", () => {
    const tagsById = new Map<number, string>([
      [1, "React"],
      [2, "TypeScript"],
    ]);

    const tagIds = [1, 1, 2];
    const result = mapTagIdsToNames(tagIds, tagsById);

    expect(result).toEqual(["React", "React", "TypeScript"]);
  });
});
