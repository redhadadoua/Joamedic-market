import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPixel from 'react-facebook-pixel';

const advancedMatching = {}; // Optional: inject email or phone to improve matching
const options = {
    autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
    debug: false, // enable logs
};

export const MetaPixel = () => {
    const location = useLocation();

    useEffect(() => {
        const pixelId = import.meta.env.VITE_META_PIXEL_ID;
        
        if (pixelId) {
            ReactPixel.init(pixelId, advancedMatching, options);
            ReactPixel.pageView(); // Fire initial page view
        } else {
            console.warn('Meta Pixel ID is not defined in environment variables (VITE_META_PIXEL_ID)');
        }
    }, []);

    useEffect(() => {
        // This fires on every route change
        const pixelId = import.meta.env.VITE_META_PIXEL_ID;
        if (pixelId) {
            ReactPixel.pageView();
        }
    }, [location.pathname, location.search]);

    return null;
};
