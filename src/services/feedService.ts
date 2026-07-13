import api from '../lib/axios';
import type { Post } from '../types';
import { mapPost, mapPosts } from '../utils/mappers';

export async function getPosts(companyId: string): Promise<Post[]> {
  const { data } = await api.get('/posts', { params: { companyId } });
  return mapPosts(data);
}

export async function createPost(post: {
  companyId: string;
  authorId: string;
  authorName: string;
  content: string;
}): Promise<Post> {
  const { data } = await api.post('/posts', post);
  return mapPost(data);
}

export async function toggleLike(postId: string, employeeId: string): Promise<Post> {
  const { data } = await api.post(`/posts/${postId}/like`, { employeeId });
  return mapPost(data);
}

export async function addComment(
  postId: string,
  comment: {
    authorId: string;
    authorName: string;
    content: string;
  },
): Promise<Post> {
  const { data } = await api.post(`/posts/${postId}/comments`, comment);
  return mapPost(data);
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`);
}
