import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { OrderProvider } from './context/OrderContext';
import { MenuProvider } from './context/MenuContext';
import App from './App.jsx';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MenuProvider>
        <OrderProvider>
          <App />
        </OrderProvider>
      </MenuProvider>
    </QueryClientProvider>
  </StrictMode>,
)
