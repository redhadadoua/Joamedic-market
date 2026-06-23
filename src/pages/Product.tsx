import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import ReactPixel from 'react-facebook-pixel';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui/button';
import { SCRUB_COLORS, ScrubColor, ScrubSize, PRODUCT_PRICE } from '../types';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import scrubImage from '../assets/images/medical_scrubs_product_1782091647205.jpg';

const sizes: ScrubSize[] = ['S', 'M', 'L'];

// Normally we'd have real product images mapped to colors. We use tinted placeholders here.
const generateImageUrl = (hex: string) => {
  return scrubImage;
};

export default function ProductPage() {
  const [selectedColor, setSelectedColor] = useState<ScrubColor>(SCRUB_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<ScrubSize>('M');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      productId: 'joa-scrub-001',
      name: 'طقم سكراب JOAmedic الفاخر',
      color: selectedColor.name,
      size: selectedSize,
      quantity,
      price: PRODUCT_PRICE
    });
    
    // Meta Pixel Tracking
    ReactPixel.track('AddToCart', {
      content_ids: ['joa-scrub-001'],
      content_name: 'طقم سكراب JOAmedic الفاخر',
      content_type: 'product',
      value: PRODUCT_PRICE * quantity,
      currency: 'DZD'
    });

    toast.success('تم إضافة المنتج إلى السلة بنجاح!');
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="grid lg:grid-cols-2 gap-16">
        
        {/* Product Gallery */}
        <div className="relative">
          <div className="sticky top-24 w-full relative flex flex-col justify-center items-center bg-gradient-to-br from-secondary/40 to-background/80 p-8 rounded-[40px] shadow-[0_40px_100px_-15px_rgba(16,185,129,0.15)] border border-primary/20 backdrop-blur-sm">
            <div className="absolute w-[80%] h-[80%] bg-primary rounded-full opacity-[0.1] blur-3xl pointer-events-none"></div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedColor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-[32px] overflow-hidden w-full aspect-[4/5] bg-black"
              >
                <img 
                  src={generateImageUrl(selectedColor.hex)} 
                  alt={`Scrub in ${selectedColor.name}`}
                  className="w-full h-full object-cover object-top opacity-100 transition-all duration-300"
                  style={{ filter: 'grayscale(0) contrast(1.05)' }}
                />
                <div className="absolute inset-0 mix-blend-color pointer-events-none" style={{ backgroundColor: selectedColor.hex, opacity: 0.3 }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none"></div>
                
                <div className="absolute bottom-8 right-8 bg-black/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/10 z-10">
                  <div className="flex gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse mt-1 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                    <span className="text-[10px] font-bold text-gray-300">متوفر في المخزون</span>
                  </div>
                  <p className="text-xs font-semibold leading-tight text-white">نسيج تقني مبرد<br/>يمنع تراكم البكتيريا</p>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="mt-8 w-full z-10 bg-black/40 border border-white/10 p-4 rounded-3xl shadow-sm backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3 px-2">
                <span className="font-semibold text-white">اختيار اللون:</span>
                <span className="text-gray-300 text-sm font-medium">{selectedColor.name}</span>
              </div>
              <div className="flex flex-wrap gap-2 py-2">
                {SCRUB_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-transform hover:scale-110 active:scale-95"
                    aria-label={color.name}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor.id === color.id && (
                        <div className="w-full h-full rounded-full border-2 border-white mix-blend-difference" style={{ padding: '4px', backgroundClip: 'content-box' }}>
                           <div className="w-full h-full rounded-full bg-white opacity-90 shadow-sm" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">طقم سكراب JOAmedic الفاخر</h1>
            <p className="text-3xl font-bold text-primary">{PRODUCT_PRICE} د.ج</p>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            صمم هذا الطقم لتوفير أقصى درجات الراحة والمرونة للكوادر الطبية. يتميز بقماش مقاوم للتعرق، خياطة مزدوجة لمتانة تدوم طويلاً، وقصة عصرية تتناسب مع شكل الجسم بأناقة.
          </p>

          <div className="space-y-6">
            {/* Size Selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">المقاس:</span>
                <span className="text-primary text-sm font-medium cursor-pointer hover:underline">دليل المقاسات</span>
              </div>
              <div className="flex gap-3">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center border-2 rounded-xl font-bold transition-all ${selectedSize === size ? 'border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-primary/10 text-primary' : 'border-border hover:border-primary text-foreground'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <span className="font-semibold text-lg block">الكمية:</span>
              <div className="flex items-center gap-4 border-2 border-border w-max rounded-xl p-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>

          <Button className="w-full h-auto py-5 text-xl font-bold rounded-2xl shadow-lg shadow-primary/30 hover:bg-[#17A2B8] flex items-center justify-center gap-3" onClick={handleAddToCart}>
            <ShoppingBag className="w-6 h-6" />
            شراء الآن - الدفع عند الاستلام
          </Button>
          <p className="text-center text-xs text-gray-400 mt-4">توصيل سريع لجميع الولايات الجزائرية خلال 48 ساعة</p>

          {/* Details Accordion */}
          <div className="pt-8 border-t">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="features">
                <AccordionTrigger className="text-lg font-bold">المميزات الأساسية</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <ul className="list-disc list-inside space-y-2">
                    <li>قماش مقاوم للتجعد</li>
                    <li>3 جيوب واسعة في القميص</li>
                    <li>4 جيوب عملية في البنطال</li>
                    <li>حزام خصر مرن مع رباط قابل للتعديل</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="fabric">
                <AccordionTrigger className="text-lg font-bold">تفاصيل القماش</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  مزيج مبتكر من البوليستر (72%)، الرايون (21%)، والسباندكس (7%). يوفر تمدداً رباعي الاتجاهات، مسامية عالية، ونعومة فائقة تعطي إحساساً رائعاً طوال اليوم.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger className="text-lg font-bold">إرشادات الغسيل</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  يغسل في الغسالة بماء بارد مع ألوان مشابهة. لا تستخدم المبيضات. يجفف بالمجفف على درجة حرارة منخفضة. يكوى على درجة حرارة منخفضة إذا لزم الأمر.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

        </div>
      </div>
    </div>
  );
}

// Simple helper to approximate hue rotation from hex for the demo image tinting
function getHue(hex: string) {
  // Extract RGB components
  if(hex.startsWith('#')) hex = hex.slice(1);
  let r = parseInt(hex.substring(0,2), 16) / 255;
  let g = parseInt(hex.substring(2,4), 16) / 255;
  let b = parseInt(hex.substring(4,6), 16) / 255;
  
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  
  if(max === min) {
    h = 0; // achromatic
  } else {
    let d = max - min;
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return h * 360;
}
