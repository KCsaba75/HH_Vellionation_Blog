import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

const HomePage = () => {
  const [homeImages, setHomeImages] = useState({
    hero: '',
    community: ''
  });

  useEffect(() => {
    const fetchHomeImages = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'home_images')
          .maybeSingle();
        
        if (error) {
          console.warn('Failed to fetch home images:', error.message);
          return;
        }
        
        if (data?.value) {
          setHomeImages({
            hero: data.value.hero || '',
            community: data.value.community || ''
          });
        }
      } catch (err) {
        console.warn('Error fetching home images:', err);
      }
    };
    fetchHomeImages();
  }, []);
  const features = [
    {
      icon: Heart,
      title: 'Longevity Lifestyle',
      description: 'Embrace sustainable wellness with functional medicine insights and expert guidance'
    },
    {
      icon: Users,
      title: 'Ageless Vitality Circle',
      description: 'Connect with driven individuals committed to mastering their second half'
    },
    {
      icon: TrendingUp,
      title: 'Metabolism Reset Tracker',
      description: 'Monitor your biohacking journey with our gamified transformation system'
    },
    {
      icon: Award,
      title: 'Functional Wellness Rewards',
      description: 'Unlock achievements as you reach your vitality milestones'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Weight Loss After 40 | Vellio Nation - Healthy Living for Men & Women</title>
        <meta name="description" content="Discover proven weight loss strategies for men and women over 40. Join Vellio Nation for expert tips on losing weight after 40, healthy eating, metabolism boosting, and sustainable lifestyle changes." />
        <meta name="keywords" content="weight loss, weight loss over 40, metabolism reset, longevity lifestyle, ageless vitality, biohacking, functional medicine, healthy weight loss, sustainable transformation, midlife wellness" />
        <link rel="canonical" href="https://www.vellionation.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vellionation.com/" />
        <meta property="og:title" content="Weight Loss After 40 | Vellio Nation - Healthy Living for Men & Women" />
        <meta property="og:description" content="Discover proven weight loss strategies for men and women over 40. Expert tips on losing weight, healthy eating, and sustainable lifestyle changes for the 40+ community." />
        <meta property="og:image" content="https://rtklsdtadtqpgoibulux.supabase.co/storage/v1/object/public/site_images/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Weight Loss After 40 | Vellio Nation - Healthy Living for Men & Women" />
        <meta name="twitter:description" content="Discover proven weight loss strategies for men and women over 40. Expert tips on losing weight, healthy eating, and sustainable lifestyle changes for the 40+ community." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Vellio Nation",
            "url": "https://www.vellionation.com",
            "logo": "https://rtklsdtadtqpgoibulux.supabase.co/storage/v1/object/public/site_images/logo.png",
            "description": "A wellness community helping men and women over 40 achieve sustainable weight loss through healthy eating, fitness guidance, and lifestyle transformation.",
            "sameAs": [
              "https://www.facebook.com/vellionation",
              "https://www.instagram.com/vellionation"
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Vellio Nation",
            "url": "https://www.vellionation.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.vellionation.com/blog?search={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Master Your Second Half Through  a <span className="text-primary">Longevity Lifestyle</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Biohacking meets functional medicine. Reclaim your energy, reset your metabolism, and embrace ageless vitality. Your transformation to unstoppable wellness starts here.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Join the Nation <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/blog">Explore Blog</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {homeImages.hero ? (
                <img 
                  alt="Wellness fitness group exercising together in nature" 
                  className="rounded-2xl shadow-2xl w-full" 
                  src={homeImages.hero}
                  width="800"
                  height="533"
                  fetchpriority="high"
                />
              ) : (
                <div className="rounded-2xl shadow-2xl w-full h-64 sm:h-80 md:h-96 bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-muted-foreground text-lg">Hero image placeholder</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Vellio Nation?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're more than just a platform - we're a movement dedicated to ageless vitality and sustainable transformation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {homeImages.community ? (
                <img alt="Community members sharing healthy recipes" className="rounded-2xl shadow-xl w-full" src={homeImages.community} loading="lazy" width="800" height="533" />
              ) : (
                <div className="rounded-2xl shadow-xl w-full h-64 sm:h-80 bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-muted-foreground text-lg">Community image placeholder</span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Ageless Vitality Community</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Connect with driven individuals committed to mastering their second half. Share biohacking insights, get accountability, and celebrate transformation wins together.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-1 mr-3 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span>Share your journey and spark change in others.</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-1 mr-3 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span>Get exclusive functional medicine insights from our experts.</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-1 mr-3 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span>Track your metabolism reset and climb the vitality ranks.</span>
                </li>
              </ul>
              <Button size="lg" asChild>
                <Link to="/community">Explore Community</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Master Your Second Half?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Join Vellio Nation today and unlock your ageless vitality. Your longevity transformation starts now.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">
                Join Now - It's Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomePage;