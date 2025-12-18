import { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const TrackingScripts = () => {
  const [trackingCodes, setTrackingCodes] = useState({ google_analytics_id: '', facebook_pixel_id: '' });
  const [scriptsLoaded, setScriptsLoaded] = useState({ ga: false, fb: false });

  useEffect(() => {
    const fetchTrackingCodes = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'tracking_codes')
        .single();
      
      if (data?.value) {
        setTrackingCodes(data.value);
      }
    };

    fetchTrackingCodes();
  }, []);

  useEffect(() => {
    if (trackingCodes.google_analytics_id && !scriptsLoaded.ga) {
      const gaId = trackingCodes.google_analytics_id.trim();
      if (gaId && /^G-[A-Z0-9]+$/i.test(gaId)) {
        const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`);
        if (!existingScript) {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
          document.head.appendChild(script);

          const inlineScript = document.createElement('script');
          inlineScript.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `;
          document.head.appendChild(inlineScript);
          setScriptsLoaded(prev => ({ ...prev, ga: true }));
        }
      }
    }
  }, [trackingCodes.google_analytics_id, scriptsLoaded.ga]);

  useEffect(() => {
    if (trackingCodes.facebook_pixel_id && !scriptsLoaded.fb) {
      const pixelId = trackingCodes.facebook_pixel_id.trim();
      if (pixelId && /^\d{15,16}$/.test(pixelId)) {
        const existingScript = document.querySelector('script[data-fb-pixel]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.setAttribute('data-fb-pixel', 'true');
          script.textContent = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `;
          document.head.appendChild(script);

          const noscript = document.createElement('noscript');
          const img = document.createElement('img');
          img.height = 1;
          img.width = 1;
          img.style.display = 'none';
          img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
          noscript.appendChild(img);
          document.body.appendChild(noscript);
          
          setScriptsLoaded(prev => ({ ...prev, fb: true }));
        }
      }
    }
  }, [trackingCodes.facebook_pixel_id, scriptsLoaded.fb]);

  return null;
};

export default TrackingScripts;
