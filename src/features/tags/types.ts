import type { TagDefinition, TagGroup } from "@/types/tags";

export interface ITagDraft {
  label: string;
  hint: string;
}

export interface ITagSection {
  group: TagGroup;
  tags: TagDefinition[];
}
