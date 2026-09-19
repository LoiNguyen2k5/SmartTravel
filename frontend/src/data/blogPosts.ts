import { tourBlogArticles } from './tourBlogArticles';

export type Category =
  | 'all'
  | 'kinhNghiem'
  | 'diaDiem'
  | 'amThuc'
  | 'backpacker'
  | 'nuocNgoai';

export const posts = tourBlogArticles;