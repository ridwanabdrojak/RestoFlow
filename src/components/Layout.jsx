import React, { useState } from 'react';
import { LayoutGrid, Coffee, UtensilsCrossed, LogOut } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import CartSidebar from './CartSidebar';
import MenuCard from './MenuCard';
import OrderQueue from './OrderQueue';
import { menuData } from '../data/menuData';

const Layout = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'kitchen'
    const { cart } = useOrder();

    const categories = ["All", ...new Set(menuData.map(item => item.category))];
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredMenu = selectedCategory === "All"
        ? menuData
        : menuData.filter(item => item.category === selectedCategory);

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
            {/* Navigation Rail */}
            <div className="w-20 bg-gray-900 text-white flex flex-col items-center py-6 gap-8 shadow-xl z-30">
                <div className="p-3 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
                    <UtensilsCrossed size={24} className="text-white" />
                </div>

                <nav className="flex flex-col gap-6 w-full px-2">
                    <button
                        onClick={() => setActiveTab('pos')}
                        className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all ${activeTab === 'pos' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <LayoutGrid size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">POS</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('kitchen')}
                        className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all relative ${activeTab === 'kitchen' ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Coffee size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Kitchen</span>
                        {/* Notification Dot could go here */}
                    </button>
                </nav>

                <div className="mt-auto pb-4">
                    <button
                        onClick={onLogout}
                        className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-red-400 transition-all"
                        title="Logout"
                    >
                        <LogOut size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Exit</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex overflow-hidden">
                {activeTab === 'pos' ? (
                    <>
                        <div className="flex-grow flex flex-col min-w-0">
                            {/* POS Header */}
                            <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
                                    <p className="text-sm text-gray-500">Select items to add to order</p>
                                </div>

                                {/* Categories Pill/Tabs */}
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedCategory === cat
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
                            <main className="flex-grow overflow-y-auto p-8 bg-gray-50/50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                    {filteredMenu.map(item => (
                                        <MenuCard key={item.id} item={item} />
                                    ))}
                                </div>
                            </main>
                        </div>

                        {/* Cart Sidebar */}
                        <CartSidebar />
                    </>
                ) : (
                    <div className="w-full">
                        <OrderQueue />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Layout;
