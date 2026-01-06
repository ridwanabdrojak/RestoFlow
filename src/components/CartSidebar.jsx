import React from 'react';
import { Trash2, ShoppingBag, Plus, Minus, MessageSquare, StickyNote } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const CartSidebar = () => {
    const { cart, removeFromCart, updateQuantity, updateItemNote, submitOrder } = useOrder();
    const [customerName, setCustomerName] = React.useState('');
    const [globalNote, setGlobalNote] = React.useState('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Tax removed as requested
    const grandTotal = total;

    const handleSubmit = () => {
        if (!customerName.trim()) return;
        submitOrder(customerName, globalNote);
        setCustomerName(''); // Reset
        setGlobalNote('');   // Reset
    };

    return (
        <div className="bg-white border-l border-gray-200 w-96 flex flex-col h-full shadow-2xl z-20 font-sans">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3 text-gray-800">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                        <ShoppingBag size={20} />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Current Order</h2>
                </div>
                {cart.length > 0 && <p className="text-xs font-medium text-gray-400 mt-1 ml-11">{cart.length} items</p>}
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-2 space-y-2 scroller">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 opacity-80">
                        <ShoppingBag size={48} strokeWidth={1} />
                        <p className="mt-3 text-sm font-medium text-center">Cart is empty</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.cartId} className="p-3 bg-white rounded-xl border border-gray-100 hover:border-amber-200/50 hover:shadow-sm transition-all group relative">
                            {/* Top Row: Qty - Name - Price */}
                            <div className="flex items-start gap-3">
                                {/* Thumbnail */}
                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover bg-gray-100 flex-shrink-0" />

                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-gray-800 text-sm leading-tight truncate pr-2">{item.name}</h4>
                                        <span className="font-bold text-gray-900 text-sm whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>

                                    {/* Controls Row */}
                                    <div className="flex items-center justify-between mt-2">
                                        {/* Qty Control */}
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-0.5 border border-gray-200/50">
                                            <button
                                                onClick={() => updateQuantity(item.cartId, -1)}
                                                className="w-6 h-6 flex items-center justify-center hover:bg-white text-gray-500 rounded-md transition-all disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-xs font-bold w-4 text-center text-gray-700">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.cartId, 1)}
                                                className="w-6 h-6 flex items-center justify-center hover:bg-white text-gray-700 rounded-md transition-all"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeFromCart(item.cartId)}
                                            className="text-gray-300 hover:text-red-500 p-1 rounded-md transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Note Input */}
                            <div className="mt-2 relative">
                                <div className="absolute left-2 top-2.5 text-gray-400 pointer-events-none">
                                    <MessageSquare size={10} />
                                </div>
                                <input
                                    type="text"
                                    value={item.note || ''}
                                    onChange={(e) => updateItemNote(item.cartId, e.target.value)}
                                    placeholder="Add Note..."
                                    className="w-full text-[11px] pl-6 pr-2 py-1.5 bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-amber-300 rounded-md outline-none text-gray-600 placeholder-gray-400 transition-all"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer / Checkout */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm z-10">
                <div className="space-y-3 mb-4">
                    {/* Customer Name */}
                    <div className="relative group">
                        <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-amber-500 transition-colors">
                            <span className="text-xs font-bold">BY</span>
                        </div>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Customer Name..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder-gray-400"
                            required
                        />
                    </div>

                    {/* Global Note */}
                    <div className="relative group">
                        <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-amber-500 transition-colors">
                            <StickyNote size={14} />
                        </div>
                        <textarea
                            value={globalNote}
                            onChange={(e) => setGlobalNote(e.target.value)}
                            placeholder="Order Note..."
                            rows="1"
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none placeholder-gray-400 min-h-[42px]"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-end mb-4 pt-2 border-t border-dashed border-gray-200">
                    <span className="text-sm font-medium text-gray-500">Total</span>
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(grandTotal)}</span>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={cart.length === 0 || !customerName.trim()}
                    className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-md flex items-center justify-center gap-2"
                >
                    Submit Order
                </button>
            </div>
        </div>
    );
};

export default CartSidebar;
