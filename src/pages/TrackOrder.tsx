import { useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Package, CheckCircle2, Clock, Truck, CircleDot } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_ICONS: Record<string, any> = {
  'Pending': Clock,
  'Confirmed': CheckCircle2,
  'Processing': Package,
  'Shipped': Truck,
  'Delivered': CircleDot,
  'Cancelled': CircleDot
};

const STATUS_ARABIC: Record<string, string> = {
  'Pending': 'قيد الانتظار',
  'Confirmed': 'تم التأكيد',
  'Processing': 'قيد التجهيز',
  'Shipped': 'تم الشحن',
  'Delivered': 'تم التسليم',
  'Cancelled': 'ملغى'
};

const STATUS_ORDER = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(false);
    setOrder(null);
    try {
      const snap = await getDoc(doc(db, 'orders', orderId.trim()));
      if (snap.exists()) {
        setOrder(snap.data() as Order);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      toast.error('خطأ في الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh]">
      <div className="max-w-2xl mx-auto space-y-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">تتبع حالة طلبك</h1>
        <p className="text-muted-foreground text-lg">أدخل رقم الطلب الخاص بك لمعرفة حالة شحنتك الحالية.</p>
        
        <form onSubmit={handleTrack} className="flex gap-4">
          <Input 
            value={orderId} 
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="رقم الطلب (مثال: ORD-X1Y2Z)" 
            className="h-14 text-lg bg-card"
          />
          <Button type="submit" className="h-14 px-8" disabled={loading || !orderId.trim()}>
            {loading ? 'جاري البحث...' : <><Search className="ml-2 w-5 h-5" /> ابحث</>}
          </Button>
        </form>

        {error && (
          <div className="p-6 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 mt-8">
            لم نتمكن من العثور على طلب بهذا الرقم. يرجى التأكد من الرقم والمحاولة مرة أخرى.
          </div>
        )}

        {order && (
          <div className="text-right mt-16 bg-card border rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-8">تفاصيل الطلب: {order.id}</h2>
            
            <div className="flex flex-col md:flex-row justify-between mb-12 gap-8 border-b pb-8">
               <div>
                  <p className="text-muted-foreground mb-1">العميل</p>
                  <p className="font-bold">{order.customerInfo.fullName}</p>
               </div>
               <div>
                  <p className="text-muted-foreground mb-1">تاريخ الطلب</p>
                  <p className="font-bold" dir="ltr">{new Date(order.createdAt).toLocaleDateString('ar-DZ')}</p>
               </div>
               <div>
                  <p className="text-muted-foreground mb-1">المجموع</p>
                  <p className="font-bold text-primary">{order.total} د.ج</p>
               </div>
               {order.trackingNumber && (
                 <div>
                    <p className="text-muted-foreground mb-1">رقم التتبع (الشحنة)</p>
                    <p className="font-bold font-mono text-accent">{order.trackingNumber}</p>
                 </div>
               )}
            </div>

            <div className="relative">
               {/* Progress line */}
               {order.status !== 'Cancelled' && (
                 <div className="absolute top-6 right-8 bottom-6 w-1 bg-muted rounded-full z-0 h-[calc(100%-3rem)] right-[1.6rem]">
                    {/* Active part could be calculated, but simpler without */}
                 </div>
               )}

               <div className="space-y-8 relative z-10">
                 {order.status === 'Cancelled' ? (
                    <div className="flex items-center gap-6 opacity-100">
                      <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0 border-4 border-card">
                        <CircleDot className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-destructive">تم إلغاء الطلب</h4>
                        <p className="text-muted-foreground mt-1">تمت عملية إلغاء الطلب. للإستفسار أرجو الإتصال بنا.</p>
                      </div>
                    </div>
                 ) : (
                   STATUS_ORDER.map((s, idx) => {
                     const isCompleted = STATUS_ORDER.indexOf(order.status) >= idx;
                     const isCurrent = order.status === s;
                     const Icon = STATUS_ICONS[s];
                     
                     return (
                       <div key={s} className={`flex items-center gap-6 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                         <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 border-card shadow-sm ${isCurrent ? 'bg-primary text-primary-foreground scale-110' : isCompleted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                           <Icon className="w-6 h-6" />
                         </div>
                         <div>
                           <h4 className={`font-bold text-xl ${isCurrent ? 'text-primary' : 'text-foreground'}`}>{STATUS_ARABIC[s]}</h4>
                           {isCurrent && <p className="text-muted-foreground mt-1 text-sm">هذه هي الحالة الحالية لطلبك</p>}
                         </div>
                       </div>
                     )
                   })
                 )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
