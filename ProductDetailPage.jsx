
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Star, Check, Share2, Copy, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const productUrl = window.location.href;

  useEffect(() => {
    // Fetch logic remains the same
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);
  
  const handleShare = (platform) => {
    let url = '';
    const encodedUrl = encodeURIComponent(productUrl);
    const text = encodeURIComponent(product.name);

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'messenger':
        url = `fb-messenger://share?link=${encodedUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(productUrl);
        toast({ title: "Link Copied!", description: "URL copied to your clipboard." });
        return;
      default:
        toast({ title: "Sharing not available for this platform", variant: "destructive" });
        return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <div className="container mx-auto px-4 py-12 text-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!product) return <div className="container mx-auto px-4 py-12 text-center"><p className="text-muted-foreground">Product not found</p><Button onClick={() => navigate('/products')} className="mt-4">Back to Products</Button></div>;

  return (
    <>
      <Helmet>
        <title>{product.seo_title || product.name} - Vellio Nation</title>
        <meta name="description" content={product.seo_description || product.description} />
      </Helmet>

      <div className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" onClick={() => navigate('/products')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square bg-secondary/50 rounded-xl overflow-hidden">
               <img alt={product.name} class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1559223669-e0065fa7f142" />
            </div>

            <div>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (<Star key={i} className={`h-5 w-5 ${i < (product.rating || 5) ? 'fill-primary text-primary' : 'text-muted'}`} />))}
                <span className="text-muted-foreground ml-2">({product.rating || '5'}.0)</span>
              </div>
              <p className="text-lg text-muted-foreground mb-8">{product.description}</p>

              {product.features && product.features.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Key Features</h2>
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="bg-primary/10 rounded-full p-1 mt-1"><Check className="h-4 w-4 text-primary" /></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-primary/5 p-6 rounded-xl mb-8"><p className="text-sm text-muted-foreground mb-4">This is an affiliate product. When you purchase through our link, you support Vellio Nation at no extra cost to you.</p></div>
              
              <div className="flex gap-4">
                <Button size="lg" className="w-full" asChild>
                  <a href={product.affiliate_url || '#'} target="_blank" rel="noopener noreferrer">Get This Product <ExternalLink className="ml-2 h-5 w-5" /></a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="lg" variant="outline"><Share2 className="h-5 w-5" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleShare('facebook')}><Facebook className="mr-2 h-4 w-4 text-[#1877F2]" />Facebook</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('messenger')}><MessageSquare className="mr-2 h-4 w-4 text-[#00B2FF]" />Messenger</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast({title: "Instagram sharing from web is not directly supported."})}><Instagram className="mr-2 h-4 w-4 text-[#E4405F]" />Instagram</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('copy')}><Copy className="mr-2 h-4 w-4" />Copy Link</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
