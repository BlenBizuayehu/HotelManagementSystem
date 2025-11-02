import React from 'react';
import Footer from '../components/Footer';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { FacebookIcon, LinkedInIcon, TwitterIcon } from '../constants';
import { Post, View } from '../types';

interface BlogPostPageProps {
  post: Post;
  navigateTo: (view: View) => void;
}


const SocialShare: React.FC<{ post: Post }> = ({ post }) => {
    const url = window.location.href;
    const encodedUrl = encodeURIComponent(url);
    const title = encodeURIComponent(post.title);

    const shareLinks = [
        { name: 'Twitter', Icon: TwitterIcon, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}` },
        { name: 'Facebook', Icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
        { name: 'LinkedIn', Icon: LinkedInIcon, href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${title}` },
    ];

    return (
        <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Share:</span>
            {shareLinks.map(({ name, Icon, href }) => (
                <a 
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label={`Share on ${name}`}
                >
                    <Icon className="h-6 w-6" />
                </a>
            ))}
        </div>
    )
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post, navigateTo }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <button onClick={() => navigateTo(View.BLOG)} className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold">
                &larr; Back to News
            </button>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 hidden md:block">Elysian</div>
            <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                <button onClick={() => navigateTo(View.DASHBOARD)} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300">
                    Management Portal
                </button>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-6 lg:p-12">
        <article className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight mb-4">{post.title}</h1>
            <div className="text-gray-500 dark:text-gray-400 mb-6">
                <span>By {post.author}</span>
                <span className="mx-2">&bull;</span>
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <img src={post.imageUrl} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg mb-8"/>
            <div 
                className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                style={{ whiteSpace: 'pre-wrap' }}
            >
                {post.content}
            </div>
            <div className="mt-12 border-t dark:border-gray-700 pt-6">
                <SocialShare post={post} />
            </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;