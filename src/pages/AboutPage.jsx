
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

const AboutPage = () => {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState({ title: 'About Us', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'page_content_about')
        .single();
      if (data) {
        const content = data.value.content || '';
        const titleMatch = content.match(/<h1.*?>(.*?)<\/h1>/);
        setPageData({ title: titleMatch ? titleMatch[1] : 'About Us', content });
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  return (
    <>
      <Helmet>
        <title>{pageData.title} - Vellio Nation</title>
        <meta property="og:title" content={`${pageData.title} - Vellio Nation`} />
        <meta property="og:image" content="https://rtklsdtadtqpgoibulux.supabase.co/storage/v1/object/public/site_images/og-image.jpg" />
      </Helmet>
      <article className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            {loading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : (
              <div
                className="prose prose-lg dark:prose-invert max-w-none rich-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pageData.content) }}
              />
            )}
          </motion.div>
        </div>
      </article>
    </>
  );
};

export default AboutPage;
