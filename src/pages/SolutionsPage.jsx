import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

const SolutionsPage = () => {
  const [solutions, setSolutions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('type', 'solutions')
        .is('parent_id', null)
        .order('position', { ascending: true });
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSolutions = async () => {
      setLoading(true);
      let query = supabase
        .from('solutions')
        .select(`
          *,
          categories!solutions_category_id_fkey(name),
          subcategories:categories!solutions_subcategory_id_fkey(name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (selectedCategoryId !== null) {
        query = query.eq('category_id', selectedCategoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching solutions:', error);
      } else {
        setSolutions(data || []);
      }
      setLoading(false);
    };

    fetchSolutions();
  }, [selectedCategoryId]);

  const filteredSolutions = useMemo(() => {
    if (!searchQuery.trim()) return solutions;
    const query = searchQuery.toLowerCase();
    return solutions.filter(solution =>
      solution.name?.toLowerCase().includes(query) ||
      solution.description?.toLowerCase().includes(query)
    );
  }, [solutions, searchQuery]);

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
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <Button
              variant={selectedCategoryId === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategoryId(null)}
              className="capitalize"
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategoryId === cat.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategoryId(cat.id)}
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
          ) : filteredSolutions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? `No solutions found for "${searchQuery}"` : 'No solutions available yet. Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSolutions.map((solution, index) => (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square bg-secondary/50 flex items-center justify-center">
                    <img alt={solution.name} className="w-full h-full object-cover" src={solution.image_url || "https://images.unsplash.com/photo-1559223669-e0065fa7f142"} />
                  </div>
                  <div className="p-6">
                    {solution.categories?.name && (
                      <div className="mb-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {solution.categories.name}
                          {solution.subcategories?.name && ` → ${solution.subcategories.name}`}
                        </span>
                      </div>
                    )}
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
