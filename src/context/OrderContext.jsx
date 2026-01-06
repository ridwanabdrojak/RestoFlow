import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const OrderContext = createContext();

export const useOrder = () => {
    return useContext(OrderContext);
};

export const OrderProvider = ({ children }) => {
    // In-memory state for Cart (Local only)
    const [cart, setCart] = useState([]);

    // Synced state for Active Orders (Supabase)
    const [activeOrders, setActiveOrders] = useState([]);

    // 1. Fetch Initial Orders & Real-time Subscription
    useEffect(() => {
        fetchOrders();

        // POLL FRAMEWORK (Backup if Realtime fails)
        const interval = setInterval(() => {
            fetchOrders();
        }, 3000); // Check every 3 seconds

        // 2. Real-time Subscription
        const channel = supabase
            .channel('public:orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('🔔 Realtime Change:', payload);
                    fetchOrders();
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Connected to Realtime for orders');
                }
            });

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: true }); // Process items in order

        if (error) {
            console.error('Error fetching orders:', error);
        } else {
            setActiveOrders(data || []);
        }
    };

    // Smart Merge Logic (Cart)
    const addToCart = (item) => {
        setCart(prev => {
            const existingItem = prev.find(i => i.id === item.id && (!i.note || i.note.trim() === ''));
            if (existingItem) {
                return prev.map(i =>
                    i.cartId === existingItem.cartId
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            const cartId = Date.now() + Math.random();
            return [...prev, { ...item, cartId: cartId, quantity: 1, note: '' }];
        });
    };

    const removeFromCart = (cartId) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.cartId === cartId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const updateItemNote = (cartId, note) => {
        setCart(prev => prev.map(item =>
            item.cartId === cartId ? { ...item, note } : item
        ));
    };

    const submitOrder = async (customerName, globalNote) => {
        if (cart.length === 0) return;

        const newOrder = {
            customer_name: customerName || 'Guest',
            global_note: globalNote || '',
            items: cart, // Supabase stores JSON automatically
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'Processing'
        };

        const { error } = await supabase
            .from('orders')
            .insert([newOrder]);

        if (error) {
            console.error('Error submitting order:', error);
            alert('Failed to submit order!');
        } else {
            setCart([]); // Clear local cart on success
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        // Optimistic Update (Immediate Feedback)
        setActiveOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating status:', error);
            fetchOrders(); // Revert/Sync on error
        }
    };

    const clearCompletedOrders = async () => {
        // Optimistic
        setActiveOrders(prev => prev.filter(mode => mode.status !== 'Done'));

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('status', 'Done');

        if (error) console.error('Error clearing completed:', error);
    };

    const deleteOrder = async (orderId) => {
        // Optimistic
        setActiveOrders(prev => prev.filter(order => order.id !== orderId));

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) console.error('Error deleting order:', error);
    };

    const resetSystem = async () => {
        // Optimistic
        setActiveOrders([]);
        setCart([]);

        // Try to call RPC function for clean reset (requires SQL setup)
        const { error } = await supabase.rpc('reset_orders');

        // Fallback if generic delete is needed (but won't reset IDs)
        if (error) {
            console.log('RPC reset_orders not found, falling back to delete');
            await supabase.from('orders').delete().neq('id', 0);
        }
    };

    const value = {
        cart,
        activeOrders,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemNote,
        submitOrder,
        updateOrderStatus,
        clearCompletedOrders,
        deleteOrder,
        resetSystem
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};
