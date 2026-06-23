import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getOrders, updateOrderStatus } from '../lib/db';
import { syncOrdersToSheetDirectly } from '../lib/sheets';
import { Order } from '../types';
import { toast } from 'sonner';
import { ShieldAlert, RefreshCw, BarChart2, Package, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { getAccessToken, googleSignIn } from '../lib/firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Admin() {
  const { role, user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || role?.role !== 'ADMIN') {
        navigate('/');
      } else {
        loadData();
      }
    }
  }, [loading, user, role]);

  const loadData = async () => {
    setLoadingData(true);
    const data = await getOrders();
    setOrders(data.sort((a, b) => b.createdAt - a.createdAt));
    setLoadingData(false);
  };

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    toast.success('تم تحديث حالة الطلب بنجاح');
    loadData();
  };

  const handleSyncToSheets = async () => {
    setSyncing(true);
    try {
      let token = getAccessToken();
      if (!token) {
        toast.info('نحتاج للحصول على صلاحيات Google Sheets مرة أخرى...');
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }

      if (!token) {
         toast.error('أخفق الحصول على الصلاحيات');
         return;
      }
      
      const unSyncedOrders = orders; // ideally you track which ones are synced, but let's sync all for context 
      await syncOrdersToSheetDirectly(unSyncedOrders, token);
      toast.success('تمت مزامنة الطلبات مع Google Sheets بنجاح!');
    } catch (err: any) {
      toast.error(err.message || 'فشلت المزامنة المباشرة');
    } finally {
      setSyncing(false);
    }
  };

  if (loading || loadingData) return <div className="p-24 text-center">جاري التحميل...</div>;
  if (!user || role?.role !== 'ADMIN') return <div className="p-24 text-center"><ShieldAlert className="mx-auto block" /> ليس لديك صلاحية مسؤول.</div>;

  const totalRevenue = orders.reduce((acc, o) => o.status !== 'Cancelled' ? acc + o.total : acc, 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  const groupedByDay = orders.reduce((acc, o) => {
    const d = new Date(o.createdAt).toLocaleDateString();
    acc[d] = (acc[d] || 0) + o.total;
    return acc;
  }, {} as Record<string, number>);
  
  const chartData = Object.keys(groupedByDay).slice(0, 7).map(k => ({ name: k, revenue: groupedByDay[k] }));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم المسؤول</h1>
          <p className="text-muted-foreground mt-1">مرحباً {user.displayName}!</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={loadData}>
             <RefreshCw className="ml-2 w-4 h-4" /> تحديث البيانات
           </Button>
           <Button onClick={handleSyncToSheets} disabled={syncing}>
             {syncing ? 'جاري المزامنة...' : 'مزامنة مع Google Sheets (مباشر)'}
           </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card p-6 rounded-2xl shadow-sm border flex items-center justify-between">
           <div>
             <p className="text-muted-foreground text-sm font-medium">إجمالي المبيعات (بدون الضرائب)</p>
             <h3 className="text-3xl font-bold mt-2">{totalRevenue} د.ج</h3>
           </div>
           <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
             <BarChart2 className="w-6 h-6" />
           </div>
        </div>
        <div className="bg-card p-6 rounded-2xl shadow-sm border flex items-center justify-between">
           <div>
             <p className="text-muted-foreground text-sm font-medium">إجمالي الطلبات</p>
             <h3 className="text-3xl font-bold mt-2">{orders.length}</h3>
           </div>
           <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
             <Package className="w-6 h-6" />
           </div>
        </div>
        <div className="bg-card p-6 rounded-2xl shadow-sm border flex items-center justify-between">
           <div>
             <p className="text-muted-foreground text-sm font-medium">الطلبات قيد الانتظار</p>
             <h3 className="text-3xl font-bold mt-2">{pendingCount}</h3>
           </div>
           <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
             <RefreshCw className="w-6 h-6" />
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-card border rounded-3xl p-6 shadow-sm overflow-hidden">
           <h3 className="text-xl font-bold mb-6">أحدث الطلبات</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-right">
               <thead>
                 <tr className="border-b text-muted-foreground font-medium">
                   <th className="pb-3 px-2">رقم الطلب</th>
                   <th className="pb-3 px-2">العميل</th>
                   <th className="pb-3 px-2">التاريخ</th>
                   <th className="pb-3 px-2">الولاية</th>
                   <th className="pb-3 px-2">المبلغ</th>
                   <th className="pb-3 px-2">الحالة</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {orders.slice(0, 15).map(order => (
                   <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                     <td className="py-3 px-2 font-mono">{order.id}</td>
                     <td className="py-3 px-2">{order.customerInfo.fullName}</td>
                     <td className="py-3 px-2" dir="ltr">{new Date(order.createdAt).toLocaleDateString('ar-DZ')}</td>
                     <td className="py-3 px-2">{order.customerInfo.city}</td>
                     <td className="py-3 px-2 font-bold">{order.total} د.ج</td>
                     <td className="py-3 px-2 max-w-[150px]">
                        <Select 
                          defaultValue={order.status} 
                          onValueChange={(val: any) => handleStatusChange(order.id, val)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">قيد الانتظار</SelectItem>
                            <SelectItem value="Confirmed">تم التأكيد</SelectItem>
                            <SelectItem value="Processing">قيد التجهيز</SelectItem>
                            <SelectItem value="Shipped">تم الشحن</SelectItem>
                            <SelectItem value="Delivered">تم التسليم</SelectItem>
                            <SelectItem value="Cancelled">ملغى</SelectItem>
                          </SelectContent>
                        </Select>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>

         <div className="bg-card border rounded-3xl p-6 shadow-sm">
           <h3 className="text-xl font-bold mb-6">المبيعات اليومية</h3>
           <div className="h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
         </div>
      </div>
    </div>
  );
}
