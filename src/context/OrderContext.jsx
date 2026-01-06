import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const useOrder = () => {
    return useContext(OrderContext);
};

export const OrderProvider = ({ children }) => {
    // In-memory state
    const [cart, setCart] = useState([]);

    // Persisted state
    const [activeOrders, setActiveOrders] = useState(() => {
        try {
            const saved = localStorage.getItem('activeOrders');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load orders', e);
            return [];
        }
    });

    const [orderCounter, setOrderCounter] = useState(() => {
        try {
            const saved = localStorage.getItem('orderCounter');
            return saved ? parseInt(saved, 10) : 1;
        } catch (e) {
            return 1;
        }
    });

    // Save to LocalStorage whenever Active Orders or Counter changes
    useEffect(() => {
        localStorage.setItem('activeOrders', JSON.stringify(activeOrders));
    }, [activeOrders]);

    useEffect(() => {
        localStorage.setItem('orderCounter', orderCounter.toString());
    }, [orderCounter]);


    // Smart Merge Logic
    const addToCart = (item) => {
        setCart(prev => {
            // 1. Check if same item already exists with an EMPTY note
            const existingItem = prev.find(i => i.id === item.id && (!i.note || i.note.trim() === ''));

            // 2. If found, increment quantity (Merge)
            if (existingItem) {
                return prev.map(i =>
                    i.cartId === existingItem.cartId
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }

            // 3. If not found (or existing ones have notes), add as NEW line
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

    const submitOrder = (customerName, globalNote) => {
        if (cart.length === 0) return;

        // Simple sequential ID
        const orderId = orderCounter.toString();
        setOrderCounter(prev => prev + 1);

        const newOrder = {
            id: orderId,
            customerName: customerName || 'Guest',
            globalNote: globalNote || '',
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'Processing', // Start directly at Processing
            timestamp: new Date().toISOString()
        };

        setActiveOrders(prev => [...prev, newOrder]);
        setCart([]);
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setActiveOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    const clearCompletedOrders = () => {
        setActiveOrders(prev => prev.filter(mode => mode.status !== 'Done'));
    };

    // Fixed Delete Function
    const deleteOrder = (orderId) => {
        setActiveOrders(prev => prev.filter(order => order.id !== orderId));
    };

    // Reset System (Clear All Data)
    const resetSystem = () => {
        setActiveOrders([]);
        setOrderCounter(1);
        localStorage.removeItem('activeOrders');
        localStorage.removeItem('orderCounter');
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
        deleteOrder, // Exposed correctly
        resetSystem
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};
