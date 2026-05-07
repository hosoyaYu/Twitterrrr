import type { st } from "vue-router/dist/index-BzEKChPW.js"

export interface Reply{
    id: number
    userId: string
    user: string
    content: string
}

export interface Post{
    id: number
    userId: string
    user: string
    content: string
    likes: number
    liked: boolean
    visibility: string
    replies?: Reply[]
}

export const usePosts = () => useState<Post[]>('posts', () => [{
    id: 1,
    userId: 'user-1',
    user: 'テスト',
    content: 'これもテスト',
    likes: 0,
    liked: false,
    visibility: 'public',
    replies: []
}])
export const useNotifications = () => useState('notifications', () => [])
export const useUserProfile = () => useState('userProfile', () => ({
    id: 'user-123',
    name: 'テスト',
    bio: 'これもテスト',
    avatarUrl: ''
}))
