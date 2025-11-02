import React, { useState } from 'react';
import Card from '../components/Card';
import Footer from '../components/Footer';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useAppContext } from '../state/AppContext';
import { Post, View } from '../types';

interface BlogPageProps {
  navigateTo: (view: View, item?: Post) => void;
}

const NewsletterSubscribe: React.FC = () => {
    const { addSubscriber } = useAppContext();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            addSubscriber(email);
            setEmail('');
        }
    };

    return (
        <Card className="my-16 bg-blue-50 dark:bg-gray-800">
            <div className="p-8 md:p-12 text-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Stay in the Loop</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Subscribe to our newsletter to receive the latest news, exclusive offers, and updates directly to your inbox.</p>
                <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
                    <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="flex-grow px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        required
                    />
                    <button type="submit" className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
                        Subscribe
                    </button>
                </form>
            </div>
        </Card>
    );
}


const BlogPage: React.FC<BlogPageProps> = ({ navigateTo }) => {
  const { posts } = useAppContext();
  
  // The backend now sends the featured post (or latest) as the first item
  const featuredPost = posts.length > 0 && (posts[0].isFeatured || posts.every(p => !p.isFeatured)) ? posts[0] : null;
  const otherPosts = featuredPost ? posts.slice(1) : posts;


  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">Elysian</div>
            <nav className="hidden md:flex items-center space-x-6">
                <button onClick={() => navigateTo(View.LANDING)} className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold">Home</button>
                <button onClick={() => navigateTo(View.BLOG)} className="text-blue-600 dark:text-blue-400 font-semibold">News</button>
                <button onClick={() => navigateTo(View.PUBLIC_TESTIMONIALS)} className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-semibold">Testimonials</button>
            </nav>
            <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                <button onClick={() => navigateTo(View.DASHBOARD)} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-300">
                    Management Portal
                </button>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-6 lg:p-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">News & Events</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Stay up to date with the latest happenings, offers, and stories from The Elysian Hotel.</p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
            <Card className="grid md:grid-cols-2 overflow-hidden cursor-pointer" onClick={() => navigateTo(View.BLOG_POST, featuredPost)}>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">{featuredPost.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">By {featuredPost.author} on {new Date(featuredPost.createdAt).toLocaleDateString()}</p>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">{featuredPost.content.substring(0, 150)}...</p>
                    <div className="mt-6">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg hover:underline">Read Full Story &rarr;</span>
                    </div>
                </div>
                <div className="h-64 md:h-full">
                    <img src={featuredPost.imageUrl} alt={featuredPost.title} className="w-full h-full object-cover" />
                </div>
            </Card>
        )}
        
        <NewsletterSubscribe />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post) => (
            <Card key={post._id} className="flex flex-col cursor-pointer" onClick={() => navigateTo(View.BLOG_POST, post)}>
              <img src={post.imageUrl} alt={post.title} className="w-full h-56 object-cover" />
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{post.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  By {post.author} on {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-4 flex-grow">{post.content.substring(0, 120)}...</p>
                <div className="mt-4">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Read More &rarr;</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;