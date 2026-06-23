import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { CartDrawer } from "./components/layout/CartDrawer";
import { MetaPixel } from "./components/MetaPixel";
import Home from "./pages/Home";
import ProductPage from "./pages/Product";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import TrackOrder from "./pages/TrackOrder";

function App() {
  return (
    <BrowserRouter>
      <MetaPixel />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/track-order" element={<TrackOrder />} />
          </Routes>
        </main>
        <footer className="h-auto md:h-16 py-4 md:py-0 bg-primary text-white flex flex-col sm:flex-row items-center justify-between px-4 md:px-12 text-sm mt-20 gap-2">
          <div className="flex gap-4 md:gap-8 text-xs sm:text-sm">
            <span>شحن مجاني للطلبات فوق 15000 دج</span>
            <span>سياسة استبدال مرنة</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <span>الدفع عند الاستلام فقط</span>
            <span className="opacity-50 text-[10px]">|</span>
            <span>جميع الولايات (58)</span>
          </div>
        </footer>
      </div>
      <CartDrawer />
      <Toaster position="bottom-left" richColors />
    </BrowserRouter>
  );
}

export default App;
