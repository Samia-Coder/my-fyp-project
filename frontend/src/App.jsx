import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import MegaMenu from "./components/MegaMenu";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import AIChatbot from "./components/AIChatbot"; 

import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";
import CreateProductForm from "./components/CreateProductForm";

// Lazy load pages for better performance (code splitting)
const HomePage = lazy(() => import("./pages/HomePage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const PurchaseSuccessPage = lazy(() => import("./pages/PurchaseSuccessPage"));
const PurchaseCancelPage = lazy(() => import("./pages/PurchaseCancelPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

function App() {
    const { user, checkAuth, checkingAuth } = useUserStore();
    const { getCartItems } = useCartStore();

    useEffect(() => { 
        checkAuth(); 
    }, [checkAuth]);

    useEffect(() => { 
        if (!user) return; 
        getCartItems(); 
    }, [getCartItems, user]);

    if (checkingAuth) return <LoadingSpinner />;

    return (
        <div className='min-h-screen bg-brand-bg text-text-primary relative overflow-hidden'>
            {/* Background Decorations */}
            <div className='fixed inset-0 pointer-events-none'>
                <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(194,24,91,0.08)_0%,transparent_50%)]' />
                <div className='absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(233,30,99,0.06)_0%,transparent_50%)]' />
                <div className='absolute inset-0 opacity-[0.03]' style={{
                    backgroundImage: 'radial-gradient(circle, #C2185B 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }} />
            </div>
            
            <div className='relative z-50'>
                <Navbar />
                <MegaMenu />
                <main className="pt-4 min-h-[calc(100vh-300px)]">
                    <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                            <Route path='/' element={<HomePage />} />
                            <Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
                            <Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
                            <Route path='/profile' element={user ? <ProfilePage /> : <Navigate to='/login' />} />
                            <Route path='/orders' element={user ? <OrdersPage /> : <Navigate to='/login' />} />
                            <Route path='/wishlist' element={user ? <WishlistPage /> : <Navigate to='/login' />} />
                            <Route path='/secret-dashboard' element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />} />
                            
                            {/* Category Routes */}
                            <Route path='/category/:category' element={<CategoryPage />} />
                            <Route path='/category/:category/:subcategory' element={<CategoryPage />} />
                            
                            <Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
                            <Route path='/purchase-success' element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />} />
                            <Route path='/purchase-cancel' element={user ? <PurchaseCancelPage /> : <Navigate to='/login' />} />
                            <Route path='/product/:id' element={<ProductDetailPage />} />
                            <Route path='/search' element={<SearchPage />} />
                            <Route path='/createproductform' element={user?.role === "admin" ? <CreateProductForm /> : <Navigate to='/login' />} />
                        </Routes>
                    </Suspense>
                </main>
                <Footer />
            </div>
            
            <Toaster 
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#880E4F',
                        color: '#fff',
                        border: '1px solid #C2185B',
                    },
                }}
            />
            
            <AIChatbot /> 
        </div>
    );
}

export default App;