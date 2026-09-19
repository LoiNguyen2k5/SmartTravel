import { tourBlogArticles } from './tourBlogArticles';

export interface BlogSection {
  heading: string;
  paragraphs: string[];
}

export const blogContents: Record<number, BlogSection[]> = {};

for (const article of tourBlogArticles) {
  blogContents[article.id] = article.sections;
}