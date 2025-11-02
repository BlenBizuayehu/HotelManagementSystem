import React, { useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAppContext } from '../state/AppContext';
import { Post } from '../types';

const NewsAdminPage: React.FC = () => {
    const { posts, addPost, updatePost, deletePost } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const openAddModal = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const openEditModal = (post: Post) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            deletePost(id);
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
    }

    const PostForm: React.FC<{post: Post | null, onSave: (postData: any) => void, onCancel: () => void}> = ({ post, onSave, onCancel }) => {
        const [title, setTitle] = useState(post?.title || '');
        const [content, setContent] = useState(post?.content || '');
        const [author, setAuthor] = useState(post?.author || 'Elysian Hotel Staff');
        const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
        const [isFeatured, setIsFeatured] = useState(post?.isFeatured || false);

        
        const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";
        const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const postData = { 
                _id: post?._id, title, content, author, imageUrl, isFeatured
            };
            onSave(postData);
        };
        
        return (
             <form onSubmit={handleSubmit}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div><label className={labelClasses}>Post Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} required/></div>
                    <div><label className={labelClasses}>Content</label><textarea value={content} onChange={e => setContent(e.target.value)} className={inputClasses} rows={6} required/></div>
                     <div><label className={labelClasses}>Author</label><input type="text" value={author} onChange={e => setAuthor(e.target.value)} className={inputClasses} required/></div>
                    <div><label className={labelClasses}>Image URL</label><input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={inputClasses} required/></div>
                    <div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                           <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                           <span className="text-gray-700 dark:text-gray-300 font-medium">Mark as Featured Post</span>
                        </label>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">Save Post</button>
                </div>
            </form>
        )
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">News & Events</h1>
                <button onClick={openAddModal} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300">
                    Create New Post
                </button>
            </div>
             <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Title</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Author</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Date Created</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length > 0 ? posts.map((post) => (
                                <tr key={post._id} className="border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{post.title}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{post.author}</td>
                                    <td className="px-6 py-4">
                                        {post.isFeatured && (
                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Featured</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 space-x-4">
                                        <button onClick={() => openEditModal(post)} className="text-blue-600 hover:underline font-semibold dark:text-blue-400">Edit</button>
                                        <button onClick={() => handleDelete(post._id)} className="text-red-600 hover:underline font-semibold dark:text-red-400">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">No posts found. Click "Create New Post" to start.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPost ? "Edit Post" : "Create New Post"}>
                <PostForm 
                    post={editingPost}
                    onCancel={closeModal}
                    onSave={(postData) => {
                        if(editingPost) {
                            updatePost(postData);
                        } else {
                            addPost(postData);
                        }
                        closeModal();
                    }}
                />
            </Modal>
        </div>
    );
};
export default NewsAdminPage;