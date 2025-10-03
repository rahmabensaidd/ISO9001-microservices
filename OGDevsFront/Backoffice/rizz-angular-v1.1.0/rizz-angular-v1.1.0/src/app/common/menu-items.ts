import { MenuItem } from '../core/models/menu.model'

export const MENU_ITEMS: MenuItem[] = [
/*{
    key: 'main',
    label: 'Main Menu',
    isTitle: true,
  },
  {
    key: 'dashboards',
    icon: 'iconoir-home-simple',
    label: 'Dashboards',
    collapsed: false,
    subMenu: [
      {
        key: 'dashboard-analytics',
        label: 'Analytics',
        url: '/dashboard/analytics',
        parentKey: 'dashboards',
      },
      {
        key: 'dashboard-ecommerce',
        label: 'Ecommerce',
        url: '/dashboard/ecommerce',
        parentKey: 'dashboards',
      },
    ],
  },
  {
    key: 'apps',
    icon: 'iconoir-view-grid',
    collapsed: true,
    label: 'Applications',
    subMenu: [
      {
        key: 'apps-analytics',
        label: 'Analytics',
        collapsed: true,
        parentKey: 'apps',
        subMenu: [
          {
            key: 'apps-analytics-customers',
            label: 'Customers',
            url: '/apps/analytics/customers',
            parentKey: 'apps-analytics',
          },
          {
            key: 'apps-analytics-reports',
            label: 'Reports',
            url: '/apps/analytics/reports',
            parentKey: 'apps-analytics',
          },
        ],
      },
      {
        key: 'apps-projects',
        label: 'Projects',
        collapsed: true,
        parentKey: 'apps',
        subMenu: [
          {
            key: 'apps-projects-clients',
            label: 'Clients',
            collapsed: true,
            url: '/apps/projects/clients',
            parentKey: 'apps-projects',
          },
          {
            key: 'apps-projects-team',
            label: 'Team',
            url: '/apps/projects/team',
            parentKey: 'apps-projects',
          },
          {
            key: 'apps-projects-project',
            label: 'Project',
            url: '/apps/projects/project',
            parentKey: 'apps-projects',
          },
          {
            key: 'apps-projects-task',
            label: 'Task',
            url: '/apps/projects/task',
            parentKey: 'apps-projects',
          },
          {
            key: 'apps-projects-kanban',
            label: 'Kanban Board',
            url: '/apps/projects/kanban',
            parentKey: 'apps-projects',
          },
          {
            key: 'apps-projects-users',
            label: 'Users',
            url: '/apps/projects/users',
            parentKey: 'apps-projects',
          },
          {
            key: 'apps-projects-create',
            label: 'Project Create',
            url: '/apps/projects/create',
            parentKey: 'apps-projects',
          },
          {
            key: 'apps-projects-mykanban',
            label: 'My Kanban Board',
            url: '/apps/projects/kanbanproject',
            parentKey: 'apps-projects',
          },
          {
            key: 'apps-projects-projectslist',
            label: 'projects list',
            url: '/apps/projects/projectslist',
            parentKey: 'apps-projects',
          },
        ],
      },
      {
        key: 'apps-ecommerce',
        label: 'Ecommerce',
        parentKey: 'apps',
        collapsed: true,
        subMenu: [
          {
            key: 'apps-ecommerce-products',
            label: 'Products',
            url: '/apps/ecommerce/products',
            parentKey: 'apps-ecommerce',
          },
          {
            key: 'apps-ecommerce-customers',
            label: 'Customers',
            url: '/apps/ecommerce/customers',
            parentKey: 'apps-ecommerce',
          },
          {
            key: 'apps-ecommerce-customers-details',
            label: 'Customer Details',
            url: '/apps/ecommerce/customers/101',
            parentKey: 'apps-ecommerce',
          },
          {
            key: 'apps-ecommerce-orders',
            label: 'Orders',
            url: '/apps/ecommerce/orders',
            parentKey: 'apps-ecommerce',
          },
          {
            key: 'apps-ecommerce-orders-details',
            label: 'Order Details',
            url: '/apps/ecommerce/orders/3001',
            parentKey: 'apps-ecommerce',
          },
          {
            key: 'apps-ecommerce-refunds',
            label: 'Refunds',
            url: '/apps/ecommerce/refunds',
            parentKey: 'apps-ecommerce',
          },
        ],
      },

      {
        key: 'apps-contact-list',
        label: 'Contact List',
        parentKey: 'apps',
        url: '/apps/contacts',
      },
      {
        key: 'apps-calendar',
        label: 'Calendar',
        parentKey: 'apps',
        url: '/apps/calendar',
      },
      {
        key: 'apps-invoice',
        label: 'Invoice',
        parentKey: 'apps',
        url: '/apps/invoice',
      },
    ],
  },
  {
    key: 'components',
    label: 'COMPONENTS',
    isTitle: true,
  },*/
  {
    key: 'Gestions',
    icon: 'iconoir-compact-disc',
    label: 'Gestions',
    collapsed: true,},
  //   subMenu: [
  //     {
  //       key: 'base-ui-alerts',
  //       label: 'Alerts',
  //       url: '/ui/alerts',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-avatars',
  //       label: 'Avatar',
  //       url: '/ui/avatars',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-buttons',
  //       label: 'Buttons',
  //       url: '/ui/buttons',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-badges',
  //       label: 'Badges',
  //       url: '/ui/badges',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-cards',
  //       label: 'Cards',
  //       url: '/ui/cards',
  //       parentKey: 'base-ui',
  //     },
  //
  //     {
  //       key: 'base-ui-carousel',
  //       label: 'Carousels',
  //       url: '/ui/carousel',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-dropdowns',
  //       label: 'Dropdowns',
  //       url: '/ui/dropdowns',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-grids',
  //       label: 'Grids',
  //       url: '/ui/grids',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-images',
  //       label: 'Images',
  //       url: '/ui/images',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-list',
  //       label: 'List',
  //       url: '/ui/list',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-modals',
  //       label: 'Modals',
  //       url: '/ui/modals',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-navs',
  //       label: 'Navs',
  //       url: '/ui/navs',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-navbar',
  //       label: 'Navbar',
  //       url: '/ui/navbar',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-pagination',
  //       label: 'Paginations',
  //       url: '/ui/paginations',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-popover-tooltip',
  //       label: 'Popover & Tooltips',
  //       url: '/ui/popovers-tooltips',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-progress',
  //       label: 'Progress',
  //       url: '/ui/progress',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-spinners',
  //       label: 'Spinners',
  //       url: '/ui/spinners',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-tabs-accordion',
  //       label: 'Tabs & Accordions',
  //       url: '/ui/tabs-accordion',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-typography',
  //       label: 'Typography',
  //       url: '/ui/typography',
  //       parentKey: 'base-ui',
  //     },
  //     {
  //       key: 'base-ui-videos',
  //       label: 'Videos',
  //       url: '/ui/videos',
  //       parentKey: 'base-ui',
  //     },
  //   ],
  // },
  // {
  //   key: 'advanced-ui',
  //   icon: 'iconoir-peace-hand',
  //   collapsed: true,
  //   badge: {
  //     text: 'new',
  //     variant: 'info',
  //   },
  //   label: 'Advanced UI',
  //   subMenu: [
  //     {
  //       key: 'advanced-ui-animation',
  //       label: 'Animation',
  //       url: '/advanced/animation',
  //       parentKey: 'advanced-ui',
  //     },
  //     {
  //       key: 'advanced-ui-clipboard',
  //       label: 'Clip Board',
  //       url: '/advanced/clipboard',
  //       parentKey: 'advanced-ui',
  //     },
  //     {
  //       key: 'advanced-ui-dragula',
  //       label: 'Dragula',
  //       url: '/advanced/dragula',
  //       parentKey: 'advanced-ui',
  //     },
  //     {
  //       key: 'advanced-ui-file-manager',
  //       label: 'File Manager',
  //       url: '/advanced/file-manager',
  //       parentKey: 'advanced-ui',
  //     },
  //     {
  //       key: 'advanced-ui-highlight',
  //       label: 'Highlight',
  //       url: '/advanced/highlight',
  //       parentKey: 'advanced-ui',
  //     },
  //     {
  //       key: 'advanced-ui-range-slider',
  //       label: 'Range Slider',
  //       url: '/advanced/range-slider',
  //       parentKey: 'advanced-ui',
  //     },
  //     {
  //       key: 'advanced-ui-ratings',
  //       label: 'Ratings',
  //       url: '/advanced/ratings',
  //       parentKey: 'advanced-ui',
  //     },
  //     {
  //       key: 'advanced-ui-ribbons',
  //       label: 'Ribbons',
  //       url: '/advanced/ribbons',
  //       parentKey: 'advanced-ui',
  //     },
  //     {
  //       key: 'advanced-ui-sweet-alert',
  //       label: 'Sweet Alerts',
  //       url: '/advanced/sweetalerts',
  //       parentKey: 'advanced-ui',
  //     },
  //     {
  //       key: 'advanced-ui-toast',
  //       label: 'Toasts',
  //       url: '/advanced/toasts',
  //       parentKey: 'advanced-ui',
  //     },
  //   ],
  // },
  // {
  //   key: 'forms',
  //   icon: 'iconoir-journal-page',
  //   label: 'Forms',
  //   collapsed: true,
  //   subMenu: [
  //     {
  //       key: 'forms-basic-elements',
  //       label: 'Basic Elements',
  //       url: '/forms/basic',
  //       parentKey: 'forms',
  //     },
  //     {
  //       key: 'forms-advance',
  //       label: 'Advance Elements',
  //       url: '/forms/advance',
  //       parentKey: 'forms',
  //     },
  //     {
  //       key: 'forms-validation',
  //       label: 'Validation',
  //       url: '/forms/validation',
  //       parentKey: 'forms',
  //     },
  //     {
  //       key: 'forms-wizard',
  //       label: 'Wizard',
  //       url: '/forms/wizard',
  //       parentKey: 'forms',
  //     },
  //     {
  //       key: 'forms-editors',
  //       label: 'Editors',
  //       url: '/forms/editors',
  //       parentKey: 'forms',
  //     },
  //     {
  //       key: 'forms-file-uploads',
  //       label: 'File Upload',
  //       url: '/forms/file-uploads',
  //       parentKey: 'forms',
  //     },
  //     {
  //       key: 'forms-image-crop',
  //       label: 'Image Crop',
  //       url: '/forms/image-crop',
  //       parentKey: 'forms',
  //     },
  //   ],
  // },
  // {
  //   key: 'charts',
  //   label: 'Charts',
  //   collapsed: true,
  //   icon: 'iconoir-candlestick-chart',
  //   subMenu: [
  //     {
  //       key: 'charts-apex',
  //       label: 'Apex',
  //       url: '/charts/apex',
  //       parentKey: 'charts',
  //     },
  //     {
  //       key: 'charts-justgage',
  //       label: 'JustGage',
  //       url: '/charts/justgage',
  //       parentKey: 'charts',
  //     },
  //     {
  //       key: 'charts-chartjs',
  //       label: 'Chartjs',
  //       url: '/charts/chartjs',
  //       parentKey: 'charts',
  //     },
  //     {
  //       key: 'charts-toast',
  //       label: 'Toast',
  //       url: '/charts/toast',
  //       parentKey: 'charts',
  //     },
  //   ],
  // },
  // {
  //   key: 'tables',
  //   icon: 'iconoir-table-rows ',
  //   label: 'Tables',
  //   collapsed: true,
  //   subMenu: [
  //     {
  //       key: 'tables-basic',
  //       label: 'Basic',
  //       url: '/tables/basic',
  //       parentKey: 'tables',
  //     },
  //     {
  //       key: 'tables-data-tables',
  //       label: 'Datatables',
  //       url: '/tables/data-tables',
  //       parentKey: 'tables',
  //     },
  //   ],
  // },
  // {
  //   key: 'icons',
  //   icon: 'iconoir-trophy',
  //   label: 'Icons',
  //   collapsed: true,
  //   subMenu: [
  //     {
  //       key: 'icons-font-awesome',
  //       label: 'Font Awesome',
  //       url: '/icons/fa',
  //       parentKey: 'icons',
  //     },
  //     {
  //       key: 'icons-line-awesome',
  //       label: 'Line Awesome',
  //       url: '/icons/la',
  //       parentKey: 'icons',
  //     },
  //     {
  //       key: 'icons-icofont',
  //       label: 'Icofont',
  //       url: '/icons/icofont',
  //       parentKey: 'icons',
  //     },
  //     {
  //       key: 'icons-iconoir',
  //       label: 'Iconoir',
  //       url: '/icons/iconoir',
  //       parentKey: 'icons',
  //     },
  //   ],
  // },
  // {
  //   key: 'maps',
  //   collapsed: true,
  //   icon: 'iconoir-navigator-alt',
  //   label: 'Maps',
  //   subMenu: [
  //     {
  //       key: 'maps-google',
  //       label: 'Google Maps',
  //       url: '/maps/google',
  //       parentKey: 'maps',
  //     },
  //     {
  //       key: 'maps-leaflet',
  //       label: 'Leaflet Maps',
  //       url: '/maps/leaflet',
  //       parentKey: 'maps',
  //     },
  //     {
  //       key: 'maps-vector',
  //       label: 'Vector Maps',
  //       url: '/maps/vector',
  //       parentKey: 'maps',
  //     },
  //   ],
  // },
  // {
  //   key: 'email-templates',
  //   collapsed: true,
  //   label: 'Email Templates',
  //   icon: 'iconoir-send-mail',
  //   subMenu: [
  //     {
  //       key: 'email-templates-basic',
  //       label: 'Basic Action Email',
  //       url: '/email-templates/basic',
  //       parentKey: 'email-templates',
  //     },
  //     {
  //       key: 'email-templates-alert',
  //       label: 'Alert Email',
  //       url: '/email-templates/alert',
  //       parentKey: 'email-templates',
  //     },
  //     {
  //       key: 'email-templates-billing',
  //       label: 'Billing Email',
  //       url: '/email-templates/billing',
  //       parentKey: 'email-templates',
  //     },
  //   ],
  // },
  // {
  //   key: 'crafted',
  //   label: 'CRAFTED',
  //   isTitle: true,
  // },
  // {
  //   key: 'pages',
  //   label: 'Pages',
  //   collapsed: true,
  //   isTitle: false,
  //   icon: 'iconoir-page-star'},
  // {
  //   key: 'page-profile',
  //   label: 'Profile',
  //   url: '/profile',
  // },
  // {
  //   key: 'page-notifications',
  //   label: 'Notifications',
  //   url: '/pages/notifications',
  //   parentKey: 'pages',
  // },
  // {
  //   key: 'page-timeline',
  //   label: 'Timeline',
  //   url: '/pages/timeline',
  //   parentKey: 'pages',
  // },
  // {
  //   key: 'page-tree-view',
  //   label: 'Treeview',
  //   url: '/pages/treeview',
  //   parentKey: 'pages',
  // },
  // {
  //   key: 'page-starter',
  //   label: 'Starter Page',
  //   url: '/pages/starter',
  //   parentKey: 'pages',
  // },
  // {
  //   key: 'page-pricing',
  //   label: 'Pricing',
  //   url: '/pages/pricing',
  //   parentKey: 'pages',
  // },
  // {
  //   key: 'page-blogs',
  //   label: 'Blogs',
  //   url: '/pages/blogs',
  //   parentKey: 'pages',
  // },
  // {
  //   key: 'page-faqs',
  //   label: 'FAQs',
  //   url: '/pages/faqs',
  //   parentKey: 'pages',
  // },
  // {
  //   key: 'page-gallery',
  //   label: 'Gallery',
  //   url: '/pages/gallery',
  //   parentKey: 'pages',
  // },
  //
  //
  // {
  //   key: 'page-authentication',
  //   label: 'Authentication',
  //   isTitle: false,
  //   collapsed: true,
  //   icon: 'iconoir-fingerprint-lock-circle',
  //   subMenu: [
  //     {
  //       key: 'log-in',
  //       label: 'Log in',
  //       url: '/auth/log-in',
  //       parentKey: 'page-authentication',
  //     },
  //     {
  //       key: 'register',
  //       label: 'Register',
  //       url: '/auth/register',
  //       parentKey: 'page-authentication',
  //     },
  //     {
  //       key: 'reset-pass',
  //       label: 'Re-Password',
  //       url: '/auth/reset-pass',
  //       parentKey: 'page-authentication',
  //     },
  //     {
  //       key: 'lock-screen',
  //       label: 'Lock Screen',
  //       url: '/auth/lock-screen',
  //       parentKey: 'page-authentication',
  //     },
  //     {
  //       key: 'maintenance',
  //       label: 'Maintenance',
  //       url: '/maintenance',
  //       target: '_blank',
  //       parentKey: 'page-authentication',
  //     },
  //     {
  //       key: 'error-404',
  //       label: 'Error 404',
  //       url: '/not-found',
  //       parentKey: 'page-authentication',
  //     },
  //     {
  //       key: 'error-500',
  //       label: 'Error 500',
  //       url: '/error-500',
  //       parentKey: 'page-authentication',
  //     },
  //   ],
  // },
  {
    key: 'forms',
    icon: 'iconoir-journal-page',
    label: 'Document Management & Reporting & Dashboard',
    collapsed: true,
    subMenu: [
      {
        key: 'forms-basic-elements',
        label: 'Generation Document',
        url: '/apps/invoice',
        parentKey: 'forms',
      },
      { key: 'forms-basic-elements',
        label: 'Summarize Document',
        url: '/apps/ResumeFile',
        parentKey: 'forms',
      },
      { key: 'forms-basic-elements',
        label: 'Document version',
        url: '/apps/VersionFile',
        parentKey: 'forms',
      },
      {
        key: 'forms-advance',
        label: 'Dashboards and \n' +
          'Reporting ',
        url: '/dashboard/dashreports',
        parentKey: 'forms',
      } ,
      { key: 'forms-basic-elements',
        label: 'KPIS Calculation and Prediction',
        url: '/dashboard/dashpredection',
        parentKey: 'forms',
      },
      {
        key: 'forms-advance',
        label: 'staistic document' ,
        url: '/dashboard/statmay',
        parentKey: 'forms',
      } ,
      ]},
  {
    key: 'advanced-ui',
    icon: 'fab fa-laravel',
    collapsed: true,
    label: 'Process Mapping Managment',
    subMenu: [
      {
        key: 'advanced-ui-animation',
        label: 'Postes',
        url: '/postes',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-clipboard',
        label: 'Data',
        url: '/data',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-clipboard',
        label: 'WorkFlow',
        url: '/dashboard/process',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-clipboard',
        label: 'Classic Workflow',
        url: '/classicWorkflow',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-clipboard', // Unique key for the new menu item
        label: 'Non-Conformity',   // Display name in the menu
        parentKey: 'apps',         // Links to the parent "Applications" menu
        url: '/dashboard/nonconformity',   // Route to your non-conformity page
      },
      {
        key: 'advanced-ui-clipboard',
        label: 'Displaying tables',
        url: '/tasks-operations-processes',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-clipboard',
        label: 'Audit s Calander',
        url: '/audits',
        parentKey: 'advanced-ui',
      },
      {
        key: 'apps-chat',
        label: 'Chat',
        parentKey: 'apps',
        url: '/apps/chat',
      },
      {
        key: 'advanced-ui-clipboard',
        label: 'statistics',
        url: '/stat',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-clipboard',
        label: 'upload audit File',
        url: '/upload',
        parentKey: 'advanced-ui',
      },
    ]
  },
  {
    key: 'advanced-ui',
    icon: 'fas fa-dollar-sign',
    collapsed: true,
    badge: {
      text: '',
      variant: 'info',
    },
    label: 'Finacial Dashboard',
    subMenu: [
      {
        key: 'advanced-ui-animation',
        label: 'Exchange Rates',
        url: '/financialdashboard',
        parentKey: 'advanced-ui',
      }
    ]

  },
  {
    key: 'advanced-ui',
    icon: 'fas fa-shopping-bag',
    collapsed: true,
    badge: {
      text: '',
      variant: 'info',
    },
    label: 'CRM Managment',
    subMenu: [
      {
        key: 'advanced-ui-animation',
        label: 'Meeting',
        url: '/meetings',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-animation',
        label: 'Project Requests',
        url: '/projectrequests',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-animation',
        label: 'Client Contracts',
        url: '/clientcontracts',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-animation',
        label: 'Client Submitted Surveys',
        url: '/adminsurveys',
        parentKey: 'advanced-ui',
      }
    ]

  },
  {
    key: 'client',
    icon: 'iconoir-journal-page',
    label: 'My space',
    collapsed: true,
    subMenu: [
      {
        key: 'forms-advance',
        label: 'Tickets',
        url: '/client',
        parentKey: 'forms',
      } ,
      {
        key: 'forms-advance',
        label: 'Request a Project',
        url: '/client/request',
        parentKey: 'forms',
      } ,
      {
        key: 'forms-advance',
        label: 'My contracts',
        url: '/client/mycontracts',
        parentKey: 'forms',
      } ,
      {
        key: 'forms-advance',
        label: 'My surveys',
        url: 'client/mysurveys',
        parentKey: 'forms',
      } ,
    ]},


  /////////
  {
    key: 'advanced-ui',
    icon: 'iconoir-peace-hand',
    collapsed: true,
    badge: {
      text: 'new',
      variant: 'info',
    },
    label: 'HR Managment',
    subMenu: [
      {
        key: 'advanced-ui-animation',
        label: 'job-Offers',
        url: '/job-offers',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-clipboard',
        label: 'Interviews',
        url: '/interviews',
        parentKey: 'advanced-ui',
      },

      {
        key: 'advanced-ui-clipboard',
        label: 'Trainings',
        url: '/trainings',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-clipboard',
        label: 'Evaluations',
        url: '/evaluations',
        parentKey: 'advanced-ui',
      },
      {
        key: 'advanced-ui-clipboard',
        label: 'trainingsEmployee',
        url: '/trainingsEmployee',
        parentKey: 'advanced-ui',
      }
    ]
  },
  {
    key: '',
    icon: 'fab fa-black-tie',
    collapsed: true,
    label: 'Project Management',
    isTitle: false,
    subMenu: [
      {
        key: '',
        label: 'Create Project',
        url: '/create-project',
        parentKey: 'advanced-ui',
      },
      {
        key: '',
        label: 'Projects List',
        url: '/projectslist',
        parentKey: 'advanced-ui',
      },
      {
        key: '',
        label: 'Projects Statistic',
        url: '/projectsstat',
        parentKey: 'advanced-ui',
      },


      {
        key: '',
        label: 'My Work',
        url: '/mywork',
        parentKey: 'advanced-ui',
      },



    ]
  },
  {
    key: '',
    icon: 'fas fa-hockey-puck',
    collapsed: true,
    label: 'Resource Management',
    isTitle: false,
    subMenu: [
      {
        key: '',
        label: 'resources',
        url: '/resources',
        parentKey: 'advanced-ui',
      },


    ]
  },
  {
    key: 'advanced-ui',
    icon: 'fas fa-user-cog',
    collapsed: true,
    badge: {
      text: '',
      variant: 'info',
    },
    label: 'User Management',
    subMenu: [
      {
        key: 'advanced-ui-animation',
        label: 'Manage users',
        url: '/user-management',
        parentKey: 'advanced-ui',
      },
    ]

  },
  {
    key: 'advanced-ui',
    icon: 'iconoir-journal-page',
    collapsed: true,
    badge: {
      text: '',
      variant: 'info',
    },
    label: 'OCR Management',
    subMenu: [
      {
        key: 'advanced-ui-animation',
        label: 'Manage OCR',
        url: '/ocr',
        parentKey: 'advanced-ui',
      },
    ]

  },
]
