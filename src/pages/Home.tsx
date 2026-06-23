import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Truck, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { SCRUB_COLORS } from '../types';
import scrubImage from '../assets/images/medical_scrubs_product_1782091647205.jpg';

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-background pt-16 overflow-hidden">
        <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 -left-64 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="container mx-auto px-4 lg:px-12 z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:pr-12"
          >
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full tracking-widest uppercase mb-4">مجموعة حصريّة مميزة</span>
              <h1 className="text-5xl md:text-7xl font-black text-foreground leading-tight">
                التميز والأناقة <br />
                <span className="text-primary">في الرعاية</span>
              </h1>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex text-yellow-400 text-lg">★★★★★</div>
                <span className="text-gray-400 text-xs">(480+ تقييم إيجابي)</span>
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground leading-relaxed pt-2">
              اكتشف مجموعة JOAmedic للملابس الطبية الفاخرة. تصميم عصري، قماش مسامي، وجاهزية تامة لتحديات العمل اليومي.
            </p>
            <div className="flex gap-4 pt-6">
              <Link to="/product/joamedic-scrub" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-auto py-4 px-8 text-xl font-bold rounded-2xl shadow-lg shadow-primary/30 hover:bg-[#17A2B8] flex items-center justify-center gap-3">
                  تسوق الآن
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-10 w-full max-w-lg">
              <div className="bg-card border border-border p-4 rounded-3xl text-center shadow-sm">
                <div className="text-primary font-bold text-xl mb-1">+5000</div>
                <div className="text-[11px] text-muted-foreground font-medium">زبون راضٍ</div>
              </div>
              <div className="bg-card border border-border p-4 rounded-3xl text-center shadow-sm">
                <div className="text-primary font-bold text-xl mb-1">24 شهر</div>
                <div className="text-[11px] text-muted-foreground font-medium">ضمان النسيج</div>
              </div>
              <div className="bg-card border border-border p-4 rounded-3xl text-center shadow-sm">
                <div className="text-primary font-bold text-xl mb-1">جزائري</div>
                <div className="text-[11px] text-muted-foreground font-medium">تصميم وتنفيذ</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full relative flex flex-col justify-center items-center bg-gradient-to-br from-secondary to-background p-8 rounded-[40px] shadow-[0_40px_100px_-15px_rgba(15,124,140,0.2)] border border-white"
          >
            <div className="absolute w-[80%] h-[80%] bg-primary rounded-full opacity-[0.05] blur-3xl pointer-events-none"></div>
            {/* Elegant Scrub Placeholder Image */}
            <div className="relative z-10 w-full rounded-[32px] overflow-hidden aspect-[4/5] bg-[#f8fafb]">
                <img 
                 src={scrubImage}
                 alt="Medical Scrubs" 
                 className="w-full h-full object-cover object-top opacity-100 transition-all duration-700 hover:scale-105"
                 style={{ filter: 'grayscale(0) contrast(1.05)' }}
                />
                <div className="absolute inset-0 mix-blend-color pointer-events-none" style={{ backgroundColor: '#10B981', opacity: 0.2 }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
               <div className="absolute bottom-8 right-8 text-white z-10">
                 <p className="font-bold text-3xl drop-shadow-md">اللون الزيتي</p>
                 <p className="opacity-90 mt-1 drop-shadow-md font-medium">طقم سكراب فاخر</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">لماذا JOAmedic؟</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">صممنا ملابسنا بعناية فائقة لنضمن لك الراحة والحرية في الحركة طوال فترة عملك.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="w-10 h-10 text-primary" />}
              title="جودة طبية فائقة"
              desc="أقمشة معتمدة عالمياً تتحمل ظروف العمل القاسية للكوادر الطبية."
            />
            <FeatureCard 
              icon={<Droplets className="w-10 h-10 text-accent" />}
              title="قماش مسامي ومقاوم للتعرق"
              desc="تقنية نسيج حديثة تسمح بمرور الهواء وتمنع تراكم الرطوبة."
            />
            <FeatureCard 
              icon={<Truck className="w-10 h-10 text-primary" />}
              title="توصيل سريع"
              desc="نوفر خدمة توصيل سريعة وموثوقة لجميع ولايات الوطن مع الدفع عند الاستلام."
            />
          </div>
        </div>
      </section>

      {/* Color Collection */}
      <section className="py-24 bg-muted/30">
         <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">تشكيلة الألوان الخلابة</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {SCRUB_COLORS.map((color, idx) => (
                <motion.div 
                  key={color.id}
                  whileHover={{ scale: 1.05 }}
                  className="group flex flex-col items-center gap-3 cursor-pointer"
                >
                  <div 
                    className="w-14 h-14 rounded-full border border-border shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary/40 group-hover:ring-offset-2 hover:ring-offset-background" 
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {color.name}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-20">
              <Link to="/product/joamedic-scrub">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold rounded-full">
                  استعرض التشكيلة كاملة
                </Button>
              </Link>
            </div>
         </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-card p-10 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow border flex flex-col items-center text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}
