import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

const OrderContext = createContext();

export const useOrder = () => {
    return useContext(OrderContext);
};

export const OrderProvider = ({ children }) => {
    const queryClient = useQueryClient();

    // In-memory state for Cart (Local only)
    const [cart, setCart] = useState([]);

    // --- READ: Fetch Orders with React Query ---
    const { data: activeOrders = [] } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data;
        },
        refetchInterval: 3000, // Fallback: Polling every 3s
    });

    // --- REALTIME: Subscription Invalidation ---
    useEffect(() => {
        console.log("🔌 Initializing Order Subscription...");
        const channel = supabase
            .channel('public:orders_v2') // Changed to v2 to force fresh channel
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('🔔 Order Realtime Change:', payload);
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                }
            )
            .subscribe((status) => {
                console.log("📡 Order Subscription Status:", status);
            });

        return () => {
            console.log("🛑 Cleaning up Order Subscription...");
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    // --- MUTATIONS: Optimistic Updates ---

    // 1. Submit Order
    const submitOrderMutation = useMutation({
        mutationFn: async (newOrder) => {
            const { error } = await supabase.from('orders').insert([newOrder]);
            if (error) throw error;
        },
        onSuccess: () => {
            setCart([]); // Clear cart only on success
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
        onError: (error) => {
            console.error("Submit Failed:", error);
            alert("Failed to submit order!");
        }
    });

    const submitOrder = (customerName, globalNote) => {
        if (cart.length === 0) return;
        const newOrder = {
            customer_name: customerName || 'Guest',
            global_note: globalNote || '',
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'Processing'
        };
        submitOrderMutation.mutate(newOrder);
    };

    // 2. Update Status (Optimistic)
    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, newStatus }) => {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);
            if (error) throw error;
        },
        onMutate: async ({ orderId, newStatus }) => {
            await queryClient.cancelQueries({ queryKey: ['orders'] });
            const previousOrders = queryClient.getQueryData(['orders']);

            // Optimistically update cache
            queryClient.setQueryData(['orders'], (old) =>
                old.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );

            return { previousOrders };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['orders'], context.previousOrders);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });

    const updateOrderStatus = (orderId, newStatus) => {
        updateStatusMutation.mutate({ orderId, newStatus });
    };

    // 3. Delete Order (Optimistic)
    const deleteOrderMutation = useMutation({
        mutationFn: async (orderId) => {
            const { error } = await supabase.from('orders').delete().eq('id', orderId);
            if (error) throw error;
        },
        onMutate: async (orderId) => {
            await queryClient.cancelQueries({ queryKey: ['orders'] });
            const previousOrders = queryClient.getQueryData(['orders']);

            // Remove from cache locally
            queryClient.setQueryData(['orders'], (old) =>
                old.filter((order) => order.id !== orderId)
            );

            return { previousOrders };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['orders'], context.previousOrders);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });

    const deleteOrder = (orderId) => {
        deleteOrderMutation.mutate(orderId);
    };

    // 4. Reset System (Optimistic)
    const resetSystemMutation = useMutation({
        mutationFn: async () => {
            // Try RPC first for clean reset, then delete fallback
            const { error } = await supabase.rpc('reset_orders');
            if (error) {
                console.log('RPC failed, falling back to delete');
                await supabase.from('orders').delete().neq('id', 0);
            }
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['orders'] });
            const previousOrders = queryClient.getQueryData(['orders']);

            // Clear cache locally
            queryClient.setQueryData(['orders'], []);
            setCart([]); // Also clear cart

            return { previousOrders };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['orders'], context.previousOrders);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });

    const resetSystem = () => {
        resetSystemMutation.mutate();
    };


    // --- UNCHANGED CART LOGIC ---
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

    const clearCompletedOrders = () => {
        // Implement later if needed via mutation
        console.log("Not implemented in refactor yet");
    };

    const value = {
        cart,
        activeOrders, // populated by useQuery
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
