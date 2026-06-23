import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import ReactPixel from 'react-facebook-pixel';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../store/cartStore';
import { createOrder } from '../lib/db';
import { sendOrderToWebhook } from '../lib/sheets';
import { WILAYAS, COMMUNE_MAP } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const checkoutSchema = z.object({
  fullName: z.string().min(3, 'يرجى إدخال الاسم الكامل'),
  phone: z.string().min(8, 'رقم الهاتف غير صحيح'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  country: z.string().min(2, 'يرجى اختيار البلد'),
  wilaya: z.string().min(2, 'يرجى اختيار الولاية'),
  commune: z.string().min(2, 'يرجى اختيار البلدية'),
  address: z.string().min(5, 'يرجى إدخال العنوان الدقيق'),
  notes: z.string().optional()
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      ReactPixel.track('InitiateCheckout', {
        value: getTotal(),
        currency: 'DZD',
        num_items: items.length
      });
    }
  }, [items.length]);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: 'الجزائر',
      email: user?.email || '',
      fullName: user?.displayName || '',
      wilaya: '',
      commune: ''
    }
  });

  const selectedWilaya = form.watch('wilaya');
  const availableCommunes = selectedWilaya && COMMUNE_MAP[selectedWilaya] ? COMMUNE_MAP[selectedWilaya] : [];

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) {
      toast.error('سلة المشتريات فارغة!');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user?.uid || 'anonymous',
        customerInfo: {
          fullName: data.fullName,
          email: data.email || '',
          phone: data.phone,
          country: data.country,
          city: data.wilaya, // Wilaya as city
          address: `${data.commune} - ${data.address}`, // Commune + exact address
          notes: data.notes || ''
        },
        items: items,
        total: getTotal(),
        status: 'Pending' as const,
        trackingNumber: '',
        createdAt: Date.now()
      };

      const orderId = await createOrder(orderData);
      
      if (orderId) {
         setSuccessOrderId(orderId);
         
         // Meta Pixel Purchase Event
         ReactPixel.track('Purchase', {
           value: getTotal(),
           currency: 'DZD',
           content_ids: items.map(i => i.productId),
           content_type: 'product',
           num_items: items.length
         });

         clearCart();
         
         // Trigger webhook for Sheets integration (Anonymous orders sync fallback)
         // We do this non-blockingly
         sendOrderToWebhook({ ...orderData, id: orderId }).catch(e => console.error(e));
         
         toast.success('تم إنشاء طلبك بنجاح!');
      }
    } catch (err: any) {
      toast.error('حدث خطأ أثناء معالجة الطلب');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successOrderId) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center max-w-2xl">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4">شكراً لتسوقك معنا!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          تم استلام طلبك بنجاح، رقم طلبك هو: <br />
          <span className="font-mono font-bold text-primary text-2xl mt-4 block">{successOrderId}</span>
        </p>
        <p className="mb-12">فريقنا سيقوم بالتواصل معك قريباً لتأكيد الطلب وتجهيزه للشحن.</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/track-order')} variant="outline" size="lg">تتبع الطلب</Button>
          <Button onClick={() => navigate('/')} size="lg">العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center max-w-xl">
        <ShoppingBag className="w-24 h-24 text-muted-foreground opacity-20 mb-8" />
        <h1 className="text-3xl font-bold mb-4">سلة المشتريات فارغة</h1>
        <p className="text-muted-foreground mb-8">لا يوجد أي منتجات في سلتك حالياً لإتمام الطلب.</p>
        <Button onClick={() => navigate('/product/joamedic-scrub')} size="lg">تصفح المنتجات</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold mb-12">إتمام الطلب</h1>
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <div className="bg-card p-6 md:p-8 rounded-3xl shadow-sm border">
            <h2 className="text-xl font-bold mb-6">معلومات التوصيل</h2>
            <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>الاسم الكامل *</Label>
                  <Input {...form.register('fullName')} placeholder="الاسم واللقب..." />
                  {form.formState.errors.fullName && <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف *</Label>
                  <Input {...form.register('phone')} dir="ltr" className="text-right" placeholder="05..." />
                  {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>البريد الإلكتروني (اختياري)</Label>
                <Input {...form.register('email')} type="email" placeholder="example@gmail.com" />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>الولاية *</Label>
                  <Select onValueChange={(val) => { 
                    form.setValue('wilaya', val);
                    form.setValue('commune', ''); // Reset commune when wilaya changes
                  }} value={form.watch('wilaya')}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الولاية" />
                    </SelectTrigger>
                    <SelectContent>
                      {WILAYAS.map(w => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.wilaya && <p className="text-sm text-destructive">{form.formState.errors.wilaya.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>البلدية *</Label>
                  <Select 
                    disabled={!selectedWilaya} 
                    onValueChange={(val) => form.setValue('commune', val)} 
                    value={form.watch('commune')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedWilaya ? "اختر البلدية" : "اختر الولاية أولاً"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCommunes.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                      {/* Allow custom entry if not in list by providing an 'Other' option normally, 
                          but our list is assumed exhaustive for the 10 included wilayas. */}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.commune && <p className="text-sm text-destructive">{form.formState.errors.commune.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>العنوان الدقيق *</Label>
                <Input {...form.register('address')} placeholder="رقم المنزل، الشارع، أو أي علامة مميزة..." />
                {form.formState.errors.address && <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>ملاحظات إضافية (اختياري)</Label>
                <Textarea {...form.register('notes')} placeholder="أي تعليمات خاصة بالتوصيل؟" className="resize-none" rows={3} />
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-5">
           <div className="bg-muted/30 p-6 md:p-8 rounded-3xl sticky top-24">
             <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
             <div className="space-y-4 mb-6">
               {items.map((item, idx) => (
                 <div key={idx} className="flex justify-between text-sm">
                   <div>
                     <span className="font-semibold">{item.name}</span>
                     <p className="text-muted-foreground mt-1">اللون: {item.color} | المقاس: {item.size} | الكمية: {item.quantity}</p>
                   </div>
                   <span className="font-bold">{item.price * item.quantity} د.ج</span>
                 </div>
               ))}
             </div>
             
             <div className="border-t border-border pt-4 space-y-3">
               <div className="flex justify-between text-muted-foreground">
                 <span>المجموع الفرعي</span>
                 <span>{getTotal()} د.ج</span>
               </div>
               <div className="flex justify-between text-muted-foreground text-sm">
                 <span>رسوم التوصيل</span>
                 <span>سيتم إعلامك بها لاحقاً</span>
               </div>
               <div className="flex justify-between font-bold text-xl pt-4">
                 <span>المجموع الإجمالي</span>
                 <span className="text-primary">{getTotal()} د.ج</span>
               </div>
               
               <div className="bg-secondary/50 text-secondary-foreground text-sm p-4 rounded-xl mt-4 border border-secondary">
                 طريقة الدفع: <strong>الدفع عند الاستلام (Cash on Delivery)</strong>
               </div>
             </div>

             <Button 
               type="submit" 
               form="checkout-form" 
               className="w-full h-14 mt-8 text-lg font-bold rounded-xl"
               disabled={isSubmitting}
             >
               {isSubmitting ? 'جاري المعالجة...' : 'تأكيد الطلب'}
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
