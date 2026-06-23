import { Link } from 'react-router-dom';
import { ShoppingCart, User as UserIcon } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';

export function Navbar() {
  const { items, openCart } = useCartStore();
  const { role, user, login, logout } = useAuth();
  
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-12 py-3 md:py-6 h-auto flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            <span className="font-bold text-2xl text-primary tracking-tight">JOAmedic</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-gray-300 relative z-10">
            <Link to="/" className="hover:text-foreground">الرئيسية</Link>
            <Link to="/product/joamedic-scrub" className="hover:text-foreground">التشكيلة</Link>
            <Link to="/track-order" className="hover:text-foreground">تتبع طلبك</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {role?.role === 'ADMIN' && (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                لوحة التحكم
              </Button>
            </Link>
          )}

          {user ? (
             <Button variant="ghost" size="icon" onClick={() => logout()} title="تسجيل الخروج">
               <UserIcon className="h-5 w-5 text-primary" />
             </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => login()} title="تسجيل الدخول">
               <UserIcon className="h-5 w-5" />
             </Button>
          )}

          <Button variant="outline" size="icon" className="relative" onClick={openCart}>
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
