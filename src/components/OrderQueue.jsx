import React, { useState } from 'react';
import { Clock, CheckCircle, ChefHat, ArrowRight, ArrowLeft, MessageSquare, StickyNote, X, Loader2, BarChart3, Trash2 } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

// Helper for formatting IDR
const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

// Modal Component (Kept detailed, but styled consistent)
const OrderDetailModal = ({ order, onClose, onAdvance }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                ${order.status === 'Processing' ? 'bg-orange-100 text-orange-700' :
                                    order.status === 'Ready' ? 'bg-blue-100 text-blue-700' :
                                        'bg-green-100 text-green-700'}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-lg font-medium text-amber-600">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleString('id-ID', {
                                hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
                            })}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {/* Global Note Highlight */}
                    {order.global_note && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 shadow-sm">
                            <StickyNote className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-yellow-800 text-sm uppercase mb-1">Order Note</h4>
                                <p className="text-gray-800 text-base italic leading-relaxed">"{order.global_note}"</p>
                            </div>
                        </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 border-b pb-2">Items ({order.items.length})</h3>
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 text-lg">{item.quantity}x</span>
                                        <span className="text-gray-800 font-medium text-lg">{item.name}</span>
                                    </div>
                                    {item.note && (
                                        <div className="mt-1 flex items-center gap-1.5 text-gray-500">
                                            <MessageSquare size={12} className="opacity-60" />
                                            <span className="text-sm italic">{item.note}</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-gray-500 font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-gray-500 font-medium">Total Amount</span>
                        <span className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</span>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                    {order.status !== 'Done' && (
                        <button
                            onClick={() => {
                                onAdvance(order);
                                onClose();
                            }}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            {order.status === 'Processing' ? 'Mark as Ready' :
                                'Complete Order'}
                            <ArrowRight size={20} />
                        </button>
                    )}
                    <button onClick={onClose} className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// COMPACT Kanban Column
const StatusColumn = ({ title, status, orders, onStatusChange, onDelete, icon: Icon, colorClass, onOrderClick }) => {
    const getNextStatus = (current) => {
        if (current === 'Processing') return 'Ready';
        if (current === 'Ready') return 'Done';
        return current;
    };

    const getPrevStatus = (current) => {
        if (current === 'Ready') return 'Processing';
        if (current === 'Done') return 'Ready';
        return null;
    };

    const statusLabel = (current) => {
        if (current === 'Processing') return 'Ready';
        if (current === 'Ready') return 'Done';
        return '';
    };

    // Status-specific styles for the header
    const headerStyle = status === 'Processing' ? 'bg-orange-50 text-orange-700 border-orange-200' :
        status === 'Ready' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            'bg-green-50 text-green-700 border-green-200';

    const dotStyle = status === 'Processing' ? 'bg-orange-500' :
        status === 'Ready' ? 'bg-blue-500' :
            'bg-green-500';

    return (
        <div className="flex-1 min-w-[280px] flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
            {/* Dense Header */}
            <div className={`p-2 border-b ${headerStyle} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-md bg-white/60 backdrop-blur-sm shadow-sm`}>
                        <Icon size={14} />
                    </div>
                    <h2 className="font-bold text-sm uppercase tracking-wide">{title}</h2>
                </div>
                <span className={`${dotStyle} text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold`}>
                    {orders.length}
                </span>
            </div>

            <div className="flex-grow overflow-y-auto p-2 bg-gray-50/50 custom-scrollbar scrollbar-hide">
                {orders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300">
                        <Icon size={32} strokeWidth={1} />
                        <span className="mt-2 text-xs font-medium">No orders</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-2 auto-rows-min">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => onOrderClick(order)}
                                className="bg-white p-2.5 rounded-lg border border-gray-200 hover:border-amber-300 shadow-sm hover:shadow-md transition-all cursor-pointer group relative hover:-translate-y-0.5 h-full flex flex-col"
                            >
                                {/* Tiny Status Indicator */}
                                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${dotStyle}`} />

                                <div className="flex flex-col mb-1.5">
                                    <div className="flex justify-between items-start pr-3">
                                        <span className="font-bold text-gray-900 text-sm">#{order.id}</span>
                                        <span className="text-[10px] font-bold text-amber-600">{formatCurrency(order.total)}</span>
                                    </div>
                                    <p className="font-bold text-base text-gray-800 truncate leading-tight">{order.customer_name}</p>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {/* Notes Preview (Compact) */}
                                {order.global_note && (
                                    <div className="mb-1.5 p-1 bg-yellow-50 border border-yellow-100 rounded text-[10px] text-yellow-800 italic flex gap-1">
                                        <StickyNote size={10} className="flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">{order.global_note}</span>
                                    </div>
                                )}

                                <div className="space-y-0.5 mb-2 flex-grow">
                                    {order.items.slice(0, 4).map((item, idx) => (
                                        <div key={idx} className="text-xs text-gray-600">
                                            <div className="flex justify-between">
                                                <span className="truncate">
                                                    <span className="font-bold text-gray-800">{item.quantity}x</span> {item.name}
                                                </span>
                                            </div>
                                            {item.note && (
                                                <div className="flex items-center gap-1 pl-3 text-gray-400 italic">
                                                    <MessageSquare size={8} />
                                                    <span className="text-[10px] leading-tight line-clamp-1">{item.note}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {order.items.length > 4 && (
                                        <p className="text-[10px] text-gray-400 pl-1">+ {order.items.length - 4} more...</p>
                                    )}
                                </div>

                                <div className="flex gap-1.5 mt-auto pt-2 border-t border-gray-50">
                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`Delete Order #${order.id}?`)) {
                                                onDelete(order.id);
                                            }
                                        }}
                                        className="p-1.5 rounded-md text-red-400 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                                        title="Delete Order"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    {/* Compact Revert Button */}
                                    {getPrevStatus(status) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onStatusChange(order.id, getPrevStatus(status));
                                            }}
                                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                                        >
                                            <ArrowLeft size={14} />
                                        </button>
                                    )}

                                    {status !== 'Done' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onStatusChange(order.id, getNextStatus(status));
                                            }}
                                            className={`flex-grow py-1.5 px-3 rounded-md text-xs lg:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm
                             ${status === 'Processing' ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200' :
                                                    'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}
                                        >
                                            {statusLabel(status)}
                                            <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Aggregated Stats Component
const AggregatedStats = ({ orders, status, title, icon: Icon, colorClass, bgClass }) => {
    // 1. Filter orders by Status
    const statusOrders = orders.filter(o => o.status === status);

    // 2. Aggregate Items
    const itemMap = {};
    statusOrders.forEach(order => {
        order.items.forEach(item => {
            if (itemMap[item.name]) {
                itemMap[item.name] += item.quantity;
            } else {
                itemMap[item.name] = item.quantity;
            }
        });
    });

    const hasItems = Object.keys(itemMap).length > 0;

    return (
        <div className={`p-2 rounded-lg border flex flex-col shadow-sm h-28 ${bgClass} overflow-hidden relative min-w-[140px] md:min-w-0 flex-shrink-0 snap-start`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-white/60 ${colorClass}`}>
                        <Icon size={16} />
                    </div>
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${colorClass}`}>{title}</h3>
                </div>
            </div>

            {/* Aggregated List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-1">
                {hasItems ? (
                    <ul className="space-y-1">
                        {Object.entries(itemMap).map(([name, count]) => (
                            <li key={name} className="text-xs font-medium text-gray-700 flex justify-between border-b border-black/5 pb-0.5 last:border-0">
                                <span>{name}</span>
                                <span className="font-bold">{count}x</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-[10px] italic">
                        No active items
                    </div>
                )}
            </div>
        </div>
    );
};


const OrderQueue = () => {
    // Get deleteOrder from context
    const { activeOrders, updateOrderStatus, deleteOrder, resetSystem } = useOrder();
    const [selectedOrder, setSelectedOrder] = useState(null);

    const ADMIN_PIN = import.meta.env.VITE_KDS_PIN || "0000";

    const checkPin = () => {
        const pin = window.prompt("🔐 Enter Admin PIN to confirm:");
        return pin === ADMIN_PIN;
    };

    const getOrders = (status) => activeOrders
        .filter(o => o.status === status)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const doneOrders = activeOrders
        .filter(o => o.status === 'Done')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const handleAdvance = (order) => {
        let nextStatus = 'Processing';
        if (order.status === 'Processing') nextStatus = 'Ready';
        if (order.status === 'Ready') nextStatus = 'Done';
        updateOrderStatus(order.id, nextStatus);
    };

    return (
        <div className="h-full p-4 flex flex-col bg-gray-50/50 font-sans">
            <header className="mb-4 flex justify-between items-center px-1">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="text-amber-600" size={24} />
                        Kitchen Display
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (checkPin()) {
                                if (window.confirm('WARNING: This will delete ALL orders and reset the system. Are you sure?')) {
                                    resetSystem();
                                }
                            } else {
                                alert("❌ Incorrect PIN");
                            }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition-colors"
                    >
                        <Trash2 size={14} />
                        Reset Data
                    </button>
                    <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Online
                    </div>
                </div>
            </header>

            {/* Aggregated Dashboard */}
            <div className="flex overflow-x-auto gap-3 mb-4 pb-2 md:pb-0 md:grid md:grid-cols-3 scrollbar-hide">
                <AggregatedStats
                    title="Processing"
                    status="Processing"
                    orders={activeOrders}
                    icon={Loader2}
                    colorClass="text-orange-700"
                    bgClass="bg-orange-50 border-orange-100"
                />
                <AggregatedStats
                    title="Ready to Serve"
                    status="Ready"
                    orders={activeOrders}
                    icon={ChefHat}
                    colorClass="text-blue-700"
                    bgClass="bg-blue-50 border-blue-100"
                />
                <AggregatedStats
                    title="Completed"
                    status="Done"
                    orders={activeOrders}
                    icon={CheckCircle}
                    colorClass="text-green-700"
                    bgClass="bg-green-50 border-green-100"
                />
            </div>

            {/* 3-Column Layout */}
            <div className="flex-grow flex gap-3 overflow-x-auto pb-2">
                <StatusColumn
                    title="Processing"
                    status="Processing"
                    orders={getOrders('Processing')}
                    onStatusChange={updateOrderStatus}
                    onDelete={(id) => {
                        if (checkPin()) {
                            deleteOrder(id);
                        } else {
                            alert("❌ Incorrect PIN");
                        }
                    }}
                    onOrderClick={setSelectedOrder}
                    icon={Loader2}
                    colorClass=""
                />
                <StatusColumn
                    title="Ready"
                    status="Ready"
                    orders={getOrders('Ready')}
                    onStatusChange={updateOrderStatus}
                    onDelete={(id) => {
                        if (checkPin()) {
                            deleteOrder(id);
                        } else {
                            alert("❌ Incorrect PIN");
                        }
                    }}
                    onOrderClick={setSelectedOrder}
                    icon={ChefHat}
                    colorClass=""
                />
                <StatusColumn
                    title="Completed"
                    status="Done"
                    orders={doneOrders}
                    onStatusChange={updateOrderStatus}
                    onDelete={(id) => {
                        if (checkPin()) {
                            deleteOrder(id);
                        } else {
                            alert("❌ Incorrect PIN");
                        }
                    }}
                    onOrderClick={setSelectedOrder}
                    icon={CheckCircle}
                    colorClass=""
                />
            </div>

            {/* Detail Modal */}
            <OrderDetailModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onAdvance={handleAdvance}
            />
        </div>
    );
};

export default OrderQueue;
