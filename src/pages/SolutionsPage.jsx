import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

const SolutionsPage = () => {
  const [solutions, setSolutions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSolutions();
  }, [filter]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'solutions')
      .order('position', { ascending: true });
    
    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchSolutions = async () => {
    setLoading(true);
    let query = supabase
      .from('solutions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      // Support both exact match and partial match for hierarchical categories
      query = query.or(`category.eq.${filter},category.like.${filter} > %`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching solutions:', error);
    } else {
      setSolutions(data);
    }
    setLoading(false);
  };

  // Get main categories for filter buttons
  const mainCategories = categories.filter(c => !c.parent_id);

  return (
    <>
      <Helmet>
        <title>Wellness Solutions - Vellio Nation</title>
        <meta name="description" content="Discover hand-picked wellness solutions including products, apps, and educational materials recommended by the Vellio Nation community." />
      </Helmet>

      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Wellness Solutions</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hand-picked wellness solutions to support your journey.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="capitalize"
            >
              All
            </Button>
            {mainCategories.map(cat => (
              <Button
                key={cat.id}
                variant={filter === cat.name ? 'default' : 'outline'}
                onClick={() => setFilter(cat.name)}
                className="capitalize"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {loading ? (
             <div className="text-center py-12">
              <p className="text-muted-foreground">Loading solutions...</p>
            </div>
          ) : solutions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No solutions available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {solutions.map((solution, index) => (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square bg-secondary/50 flex items-center justify-center">
                    <img alt={solution.name} className="w-full h-full object-cover"  src={solution.image_url || "https://images.unsplash.com/photo-1559223669-e0065fa7f142"} />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{solution.name}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{solution.description}</p>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < (solution.rating || 5) ? 'fill-primary text-primary' : 'text-muted'}`}
                        />
                      ))}
                    </div>
                    <Button asChild className="w-full">
                      <Link to={`/solutions/${solution.id}`}>
                        View Details <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default SolutionsPage;
