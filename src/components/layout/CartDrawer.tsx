import { useCartStore } from '../../store/cartStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCT_PRICE } from '../../types';

export function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem, getTotal } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="left" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-right font-bold text-2xl text-primary">سلة المشتريات</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <ShoppingCartIcon className="w-16 h-16 opacity-20" />
              <p>سلة المشتريات فارغة</p>
              <Button variant="outline" onClick={closeCart}>مواصلة التسوق</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-4 border-b pb-4">
                  <div className="w-20 h-20 bg-muted rounded-md flex-shrink-0">
                     {/* image placeholder or real image based on color */}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      اللون: {item.color} | المقاس: {item.size}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border rounded-md px-2 py-1">
                        <button onClick={() => updateQuantity(item.productId, item.color, item.size, Math.max(1, item.quantity - 1))}>
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}>
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold">{item.price * item.quantity} د.ج</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.productId, item.color, item.size)} className="text-destructive self-start">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-6 space-y-4 pb-8">
            <div className="flex justify-between font-bold text-lg">
              <span>المجموع (بدون ضرائب)</span>
              <span>{getTotal()} د.ج</span>
            </div>
            <p className="text-sm text-muted-foreground">التوصيل يتم حسابه في صفحة الدفع</p>
            <Button className="w-full h-12 text-lg font-bold" onClick={handleCheckout}>
              الدفع عند الاستلام
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ShoppingCartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}
