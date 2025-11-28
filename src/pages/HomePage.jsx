import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  const features = [
    {
      icon: Heart,
      title: 'Wellness First',
      description: 'Prioritize your health with expert guidance and community support'
    },
    {
      icon: Users,
      title: 'Active Community',
      description: 'Connect with like-minded individuals on the same journey'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your transformation with our gamified ranking system'
    },
    {
      icon: Award,
      title: 'Earn Badges',
      description: 'Unlock achievements as you reach your wellness milestones'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Vellio Nation - Transform Your Life Through Wellness</title>
        <meta name="description" content="Join Vellio Nation and embark on your wellness journey. Get inspired, connect with our community, and achieve your health goals." />
        <link rel="canonical" href="https://www.vellionation.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vellionation.com/" />
        <meta property="og:title" content="Vellio Nation - Transform Your Life Through Wellness" />
        <meta property="og:description" content="Join Vellio Nation and embark on your wellness journey. Get inspired, connect with our community, and achieve your health goals." />
        <meta property="og:image" content="https://www.vellionation.com/images/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vellio Nation - Transform Your Life Through Wellness" />
        <meta name="twitter:description" content="Join Vellio Nation and embark on your wellness journey. Get inspired, connect with our community, and achieve your health goals." />
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
                Transform Your Life Through <span className="text-primary">Wellness</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Join a community dedicated to healthy living, mindful choices, and sustainable transformation. Your journey to a better you starts here.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
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
              <img alt="Wellness fitness group exercising together in nature" className="rounded-2xl shadow-2xl w-full" src="/images/hero-outdoor-fitness.jpg?v=8" />
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
              We're more than just a platform - we're a movement towards healthier, happier living.
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
              <img alt="Community members sharing healthy recipes" className="rounded-2xl shadow-xl w-full" src="https://images.unsplash.com/photo-1683624328172-88fb24625ec1" loading="lazy" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Thriving Community</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Connect with thousands of members who share your passion for wellness. Share experiences, get motivated, and celebrate victories together.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-1 mr-3 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span>Share your journey and inspire others</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-1 mr-3 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span>Get expert advice from our bloggers</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-1 mr-3 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span>Earn badges and climb the ranks</span>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Join Vellio Nation today and take the first step towards a healthier, happier you.
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