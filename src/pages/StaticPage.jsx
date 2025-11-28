
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';

const StaticPage = ({ pageKey }) => {
  const [pageData, setPageData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageContent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', pageKey)
        .single();
      
      if (error) {
        console.error('Error fetching page content:', error);
      } else if (data) {
        const content = data.value.content || '';
        // Extract title from the first h1 tag
        const titleMatch = content.match(/<h1.*?>(.*?)<\/h1>/);
        const title = titleMatch ? titleMatch[1] : 'Vellio Nation';
        setPageData({ title, content });
      }
      setLoading(false);
    };

    fetchPageContent();
  }, [pageKey]);

  return (
    <>
      <Helmet>
        <title>{pageData.title}</title>
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
             <div className="prose prose-lg dark:prose-invert max-w-none rich-content" dangerouslySetInnerHTML={{ __html: pageData.content }} />
          )}
        </motion.div>
      </div>
    </>
  );
};

export default StaticPage;
