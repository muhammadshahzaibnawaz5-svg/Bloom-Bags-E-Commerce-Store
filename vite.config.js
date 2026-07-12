import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        listing: resolve(__dirname, 'product-listing.html'),
        detail: resolve(__dirname, 'product-detail.html'),
        
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        contact: resolve(__dirname, 'contact.html'),
        about: resolve(__dirname, 'about.html'),
        admin: resolve(__dirname, 'admin.html'),
        account: resolve(__dirname, 'account.html'),
        'order-confirmation': resolve(__dirname, 'order-confirmation.html'),
        'shipping-returns': resolve(__dirname, 'shipping-returns.html'),
        loyalty: resolve(__dirname, 'loyalty.html'),
        'gift-cards': resolve(__dirname, 'gift-cards.html'),
      },
    },
  },
})
