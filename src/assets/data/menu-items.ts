import { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'general',
    label: 'Ecommerce',
    isTitle: true,
    allowedRoles: ['admin', 'vendor'], // Both can see this section
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'solar:widget-5-bold-duotone',
    url: '/dashboard',
    allowedRoles: ['admin', 'vendor'], // Both can see dashboard
  },
  {
    key: 'products',
    label: 'Products',
    icon: 'solar:t-shirt-bold-duotone',
    allowedRoles: ['admin', 'vendor'], // Both can see products
    children: [
      {
        key: 'product-add',
        label: 'Add Product',
        url: '/products/product-add',
        parentKey: 'products',
        allowedRoles: ['admin', 'vendor'],
      },
      {
        key: 'product-list',
        label: 'Product List',
        url: '/products/product-list',
        parentKey: 'products',
        allowedRoles: ['admin', 'vendor'],
      },
    ],
  },
  {
    key: 'home-categories',
    label: 'Home Categories',
    icon: 'solar:clipboard-list-bold-duotone',
    url: '/home-categories',
    allowedRoles: ['admin'], 
  },
  {
    key: 'category',
    icon: 'solar:clipboard-list-bold-duotone',
    label: 'Category Management',
    allowedRoles: ['admin'],
    children: [
      {
        key: 'category-list',
        label: 'All Categories',
        url: '/category/category-list',
        parentKey: 'category',
        allowedRoles: ['admin'],
      },
      {
        key: 'category-add',
        label: 'Add Category',
        url: '/category/category-add',
        parentKey: 'category',
        allowedRoles: ['admin'],
      },
      {
        key: 'category-tree',
        label: 'Category Tree View',
        url: '/category/category-tree',
        parentKey: 'category',
        allowedRoles: ['admin'],
      },
    ],
  },
  // {
  //   key: 'inventory',
  //   label: 'Inventory',
  //   icon: 'solar:box-bold-duotone',
  //   children: [
  //     {
  //       key: 'warehouse',
  //       label: 'Warehouse',
  //       url: '/inventory/warehouse',
  //       parentKey: 'inventory',
  //     },
  //     {
  //       key: 'received-orders',
  //       label: 'Received Orders',
  //       url: '/inventory/received-orders',
  //       parentKey: 'inventory',
  //     },
  //   ],
  // },
  {
    key: 'orders',
    label: 'Orders',
    icon: 'solar:bag-smile-bold-duotone',
    allowedRoles: ['admin', 'vendor'], // Only admin can see orders
    children: [
      {
        key: 'orders-list',
        label: 'orders List',
        url: '/orders/orders-list',
        parentKey: 'orders',
        allowedRoles: ['admin', 'vendor'],
      },
    ],
  },

  {
    key: 'settings',
    label: 'Settings',
    icon: 'solar:settings-bold-duotone',
    url: '/settings',
  },
  {
    key: 'vendors',
    label: 'VENDORS',
    isTitle: true,
    allowedRoles: ['admin'], // Only admin can see users section
  },
  // {
  //   key: 'profile',
  //   label: 'Profile',
  //   icon: 'solar:chat-square-like-bold-duotone',
  //   url: '/profile',
  // },

  {
    key: 'Vendors',
    label: 'Vendors',
    icon: 'solar:shop-bold-duotone',
    allowedRoles: ['admin'], // Only admin can see vendors
    children: [
      {
        key: 'seller-list',
        label: ' Vendor List',
        url: '/seller/seller-list',
        parentKey: 'Vendors',
        allowedRoles: ['admin'],
      },
    ],
  },

  // {
  //   key: 'subscription',
  //   label: 'Subscription Plan',
  //   icon: 'solar:dollar-bold-duotone',
  //   allowedRoles: ['admin'], 
  //   children: [
  //     {
  //       key: 'subscription-add',
  //       label: 'Create Plan',
  //       url: '/subscription/subscription-add',
  //       parentKey: 'subscription',
  //       allowedRoles: ['admin'],
  //     },
  //     {
  //       key: 'subscription-list',
  //       label: 'Subscription List',
  //       url: '/subscription/subscription-list',
  //       parentKey: 'subscription',
  //       allowedRoles: ['admin'],
  //     },
  //   ],
  // },
  {
    key: 'OTHER',
    label: 'OTHER',
    isTitle: true,
    allowedRoles: ['admin'], 
  },
  {
    key: 'coupons',
    label: 'Coupons',
    icon: 'solar:leaf-bold-duotone',
    allowedRoles: ['admin', 'vendor'],
    children: [
      {
        key: 'coupons-add',
        label: 'Create Coupon',
        url: '/coupons/coupons-add',
        parentKey: 'coupons',
        allowedRoles: ['admin', 'vendor'],
      },
      {
        key: 'coupons-list',
        label: 'Coupon List',
        url: '/coupons/coupons-list',
        parentKey: 'coupons',
        allowedRoles: ['admin', 'vendor'],
      },
    ],
  },

  {
    key: 'support',
    label: 'SUPPORT',
    isTitle: true,
    allowedRoles: ['admin'], // Only admin can see support section
  },
  {
    key: 'contact-us',
    label: 'Contact Us Enquiries',
    icon: 'solar:phone-bold-duotone',
    url: '/support/contact-us',
    allowedRoles: ['admin'],
  },
  {
    key: 'help-center',
    label: 'Help-Center',
    icon: 'solar:help-bold-duotone',
    url: '/support/help-center',
    allowedRoles: ['admin'],
  },
  {
    key: 'faqs',
    label: 'FAQs',
    icon: 'solar:question-circle-bold-duotone',
    url: '/support/faqs',
    allowedRoles: ['admin'],
  },
  {
    key: 'privacy-policy',
    label: 'Privacy Policy',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/privacy-policy',
    allowedRoles: ['admin'],
  },
  {
    key: 'terms-conditions',
    label: 'Terms & Conditions',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/terms-conditions',
    allowedRoles: ['admin'],
  },
  {
    key: 'payment-policy',
    label: 'Payment Policy',
    icon: 'solar:dollar-bold-duotone',
    url: '/support/payment-policy',
    allowedRoles: ['admin'],
  },
  {
    key: 'shipping-policy',
    label: 'Shipping Policy',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/shipping-policy',
    allowedRoles: ['admin'],
  },
  {
    key: 'vendor-policy',
    label: 'Vendor Policy',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/vendor-policy',
    allowedRoles: ['admin'],
  },
  {
    key: 'site-security',
    label: 'Site Security',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/site-security',
    allowedRoles: ['admin'],
  },
  {
    key: 'disclaimer',
    label: 'Disclaimer',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/disclaimer',
    allowedRoles: ['admin'],
  },
  {
    key: 'custom',
    label: 'Web Pages',
    isTitle: true,
    allowedRoles: ['admin'], // Only admin can see web pages section
  },
  {
    key: 'pages',
    label: 'Pages',
    icon: 'solar:gift-bold-duotone',
    allowedRoles: ['admin'],
    children: [
      {
        key: 'header-banner',
        label: 'Header Bannner',
        url: '/pages/header-banner',
        parentKey: 'pages',
        allowedRoles: ['admin'],
      },
      {
        key: 'main-banner',
        label: 'Main Banner',
        url: '/pages/main-banner',
        parentKey: 'pages',
        allowedRoles: ['admin'],
      },
      {
        key: 'discount-banner',
        label: 'Discount Banner',
        url: '/pages/discount-banner',
        parentKey: 'pages',
        allowedRoles: ['admin'],
      },
      {
        key: 'offer-banner',
        label: 'Offer Banner',
        url: '/pages/offer-banner',
        parentKey: 'pages',
        allowedRoles: ['admin'],
      },
      {
        key: 'about-us',
        label: 'About Us',
        url: '/pages/about-us',
        parentKey: 'pages',
        allowedRoles: ['admin'],
      },
      {
        key: 'team',
        label: 'Core Team',
        url: '/pages/team/team-list',
        parentKey: 'pages',
        allowedRoles: ['admin'],
      },
    ],
  },

  {
    key: 'blog',
    label: 'Blog',
    icon: 'solar:gift-bold-duotone',
    allowedRoles: ['admin'], // Only admin can see blog management
    children: [
      {
        key: 'blog-category',
        label: 'Blog Category',
        url: '/blog/blog-category',
        parentKey: 'blog',
        allowedRoles: ['admin'],
      },
      {
        key: 'create-blog',
        label: 'Create Blog',
        url: '/blog/create-blog',
        parentKey: 'blog',
        allowedRoles: ['admin'],
      },
      {
        key: 'blog',
        label: 'Blog List',
        url: '/blog/blog-list',
        parentKey: 'blog',
        allowedRoles: ['admin'],
      },
    ],
  },

  {
    key: 'account-settings',
    label: 'ACCOUNT SETTINGS',
    isTitle: true,
    allowedRoles: ['admin', 'vendor'], 
  },
  {
    key: 'profile',
    label: 'Profile Settings',
    icon: 'solar:user-bold-duotone',
    allowedRoles: ['admin', 'vendor'],
    children: [
      {
        key: 'profile-update',
        label: 'Update Profile',
        url: '/profile/update',
        parentKey: 'profile',
        allowedRoles: ['admin', 'vendor'],
      },
      {
        key: 'change-password',
        label: 'Change Password',
        url: '/profile/change-password',
        parentKey: 'profile',
        allowedRoles: ['admin', 'vendor'],
      },
    ],
  },
]
