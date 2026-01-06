import React, { useState } from 'react';
import { LayoutGrid, Coffee, UtensilsCrossed, LogOut } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import CartSidebar from './CartSidebar';
import MenuCard from './MenuCard';
import OrderQueue from './OrderQueue';
import { menuData } from '../data/menuData';

const Layout = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'kitchen'
    const [showMobileCart, setShowMobileCart] = useState(false);
    const { cart } = useOrder();

    const categories = ["All", ...new Set(menuData.map(item => item.category))];
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredMenu = selectedCategory === "All"
        ? menuData
        : menuData.filter(item => item.category === selectedCategory);

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
            {/* Navigation Rail (Desktop: Sidebar, Mobile: Bottom Bar) */}
            <div className="order-2 md:order-1 h-16 w-full md:w-20 md:h-screen bg-gray-900 text-white flex md:flex-col flex-row items-center justify-between md:justify-start px-6 md:px-0 py-2 md:py-6 gap-0 md:gap-8 shadow-xl z-30 shrink-0">
                <div className="hidden md:block p-3 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
                    <UtensilsCrossed size={24} className="text-white" />
                </div>

                {/* Mobile Logo Substitute */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="p-2 bg-amber-500 rounded-lg">
                        <UtensilsCrossed size={18} className="text-white" />
                    </div>
                </div>

                <nav className="flex md:flex-col flex-row gap-8 md:gap-6 w-auto md:w-full px-2">
                    <button
                        onClick={() => setActiveTab('pos')}
                        className={`flex flex-col items-center justify-center gap-1 p-2 md:p-3 rounded-xl transition-all ${activeTab === 'pos' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <LayoutGrid size={20} className="md:w-6 md:h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">POS</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('kitchen')}
                        className={`flex flex-col items-center justify-center gap-1 p-2 md:p-3 rounded-xl transition-all relative ${activeTab === 'kitchen' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Coffee size={20} className="md:w-6 md:h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">Kitchen</span>
                    </button>
                </nav>

                <div className="md:mt-auto md:pb-4 ml-auto md:ml-0">
                    <button
                        onClick={onLogout}
                        className="flex flex-col items-center justify-center gap-1 p-2 md:p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-red-400 transition-all"
                        title="Logout"
                    >
                        <LogOut size={20} className="md:w-6 md:h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">Exit</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="order-1 md:order-2 flex-grow flex overflow-hidden relative">
                {activeTab === 'pos' ? (
                    <>
                        <div className="flex-grow flex flex-col min-w-0">
                            {/* POS Header */}
                            <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">New Order</h1>
                                    <p className="text-xs md:text-sm text-gray-500">Select items to add to order</p>
                                </div>

                                {/* Categories Pill/Tabs - Scrollable on Mobile */}
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg overflow-x-auto no-scrollbar w-full md:w-auto">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </header>

                            {/* Menu Grid */}
                            <main className="flex-grow overflow-y-auto p-4 md:p-8 bg-gray-50/50 relative">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-24 md:pb-20">
                                    {filteredMenu.map(item => (
                                        <MenuCard key={item.id} item={item} />
                                    ))}
                                </div>

                                {/* Mobile Cart FAB */}
                                {cart.length > 0 && (
                                    <button
                                        onClick={() => setShowMobileCart(true)}
                                        className="md:hidden fixed bottom-20 right-4 bg-gray-900 text-white p-4 rounded-full shadow-xl flex items-center gap-2 z-20 active:scale-95 transition-transform"
                                    >
                                        <div className="relative">
                                            <UtensilsCrossed size={24} />
                                            <span className="absolute -top-2 -right-2 bg-amber-500 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                                                {cart.length}
                                            </span>
                                        </div>
                                        <span className="font-bold pr-1">View Order</span>
                                    </button>
                                )}
                            </main>
                        </div>

                        {/* Desktop Cart Sidebar (Always Visible on Desktop) */}
                        <div className="hidden md:block w-96 h-full border-l border-gray-200 shrink-0 bg-white z-20">
                            <CartSidebar />
                        </div>

                        {/* Mobile Cart Sidebar (Overlay/Drawer) */}
                        <div className={`
                            fixed inset-0 z-50 md:hidden transition-all duration-300
                            ${showMobileCart ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}
                        `}>
                            {/* Backdrop */}
                            <div
                                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${showMobileCart ? 'opacity-100' : 'opacity-0'}`}
                                onClick={() => setShowMobileCart(false)}
                            />

                            {/* Drawer */}
                            <div className={`
                                absolute right-0 top-0 bottom-0 w-full h-full transition-transform duration-300 bg-white
                                ${showMobileCart ? 'translate-x-0' : 'translate-x-full'}
                            `}>
                                <CartSidebar onClose={() => setShowMobileCart(false)} />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full overflow-hidden">
                        <OrderQueue />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Layout;
