'use client'

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/store'

//   Response wrapper
export interface OrdersResponse {
  success: boolean
  statusCode: number
  message: string
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPrevPage: boolean
    hasNextPage: boolean
  }
  data: IOrder[]
}

// Paginated response structure (alternative format)
export interface PaginatedOrdersResponse {
  orders: IOrder[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPrevPage: boolean
    hasNextPage: boolean
  } | null
}

//  Single Order
export interface IOrder {
  _id: string
  orderNumber: string
  user: IUser
  items: IOrderItem[]
  subtotal: number
  shippingCost: number
  tax: number
  discount: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | string
  paymentStatus: 'pending' | 'paid' | 'failed' | string
  shippingAddress: IAddress
  billingAddress: IAddress
  paymentInfo: IPaymentInfo
  shippingMethod: string
  trackingNumber: string
  estimatedDelivery: string
  actualDelivery?: string
  statusHistory: IStatusHistory[]
  notes?: string
  cancelReason?: string
  returnReason?: string
  orderDate: string
  confirmedAt?: string
  shippedAt?: string
  deliveredAt?: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
}

export interface IUser {
  _id: string
  name: string
  email: string
  phone: string
}

export interface IOrderItem {
  product: string
  name: string
  price: number
  quantity: number
  selectedColor?: string
  selectedSize?: string
  thumbnail: string
  subtotal: number
}

export interface IAddress {
  fullName: string
  phone: string
  email: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface IPaymentInfo {
  method: 'cash_on_delivery' | 'card' | 'paypal' | string
  status: 'pending' | 'paid' | 'failed' | string
  transactionId?: string
  paymentDate?: string
  amount: number
}

export interface IStatusHistory {
  status: string
  timestamp: string
  note?: string
  updatedBy: string
}

// Dashboard order summary (admin)
export interface IOrderSummary {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  monthlyRevenue?: number[]
  monthlyOrders?: number[]
}

// Helper function to build query string
const buildQuery = (params: Record<string, any>) => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/v1/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState
      const token = state?.auth?.token
      const role = (state as any)?.auth?.user?.role
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      if (role) {
        headers.set('X-User-Role', String(role))
      }
      return headers
    },
  }),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    // 🔹 Get Order Summary (admin only)
    getOrderSummary: builder.query<IOrderSummary, void>({
      query: () => `/orders/summary`,
      transformResponse: (response: any): IOrderSummary => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data as IOrderSummary
        }
        // Fallback empty summary
        return {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          monthlyRevenue: Array(12).fill(0),
          monthlyOrders: Array(12).fill(0),
        }
      },
      providesTags: ['Order'],
    }),

    // 🔹 Get Vendor Order Summary (vendor only)
    getVendorOrderSummary: builder.query<IOrderSummary, void>({
      query: () => `/orders/summary/vendor`,
      transformResponse: (response: any): IOrderSummary => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data as IOrderSummary
        }
        return {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          monthlyRevenue: Array(12).fill(0),
          monthlyOrders: Array(12).fill(0),
        }
      },
      providesTags: ['Order'],
    }),
    // 🔹 Get All Orders with dynamic parameters
    getOrders: builder.query<PaginatedOrdersResponse, { 
      page?: number
      limit?: number
      search?: string
      status?: string
      paymentStatus?: string
      dateFrom?: string
      dateTo?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } | void>({
      query: (params) => {
        if (!params) return '/orders'
        return `/orders${buildQuery(params)}`
      },
      transformResponse: (response: OrdersResponse | any) => {
        // Handle different response formats
        if (response?.data) {
          // Handle paginated API response format
          if (response.meta) {
            return {
              orders: response.data,
              pagination: {
                page: response.meta.page || 1,
                limit: response.meta.limit || 10,
                total: response.meta.total || 0,
                totalPages: response.meta.totalPages || 0,
                hasPrevPage: response.meta.hasPrevPage || false,
                hasNextPage: response.meta.hasNextPage || false,
              }
            }
          }
          // Handle array response
          if (Array.isArray(response.data)) {
            return { 
              orders: response.data, 
              pagination: null 
            }
          }
        }
        
        // Handle direct array response
        if (Array.isArray(response)) {
          return { 
            orders: response, 
            pagination: null 
          }
        }
        
        // Fallback
        return { 
          orders: [], 
          pagination: null 
        }
      },
      providesTags: ['Order'],
    }),

    // 🔹 Get Order by ID
    getOrderById: builder.query<IOrder, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: any) => {
        // Backend returns { success, statusCode, message, data }
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data as IOrder
        }
        return response as IOrder
      },
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),

    // 🔹 Update Order Status
    updateOrderStatus: builder.mutation<IOrder, { id: string; status: string; note?: string }>({
      query: ({ id, ...patch }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // 🔹 Update Payment Status
    updatePaymentStatus: builder.mutation<IOrder, { id: string; paymentStatus: string }>({
      query: ({ id, ...patch }) => ({
        url: `/orders/${id}/payment`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // 🔹 Cancel Order
    cancelOrder: builder.mutation<IOrder, { id: string; reason: string }>({
      query: ({ id, ...patch }) => ({
        url: `/orders/${id}/cancel`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // 🔹 Get Vendor Orders (orders that include vendor's products)
    getVendorOrders: builder.query<PaginatedOrdersResponse, { 
      page?: number
      limit?: number
      search?: string
      status?: string
      paymentStatus?: string
      dateFrom?: string
      dateTo?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } | void>({
      query: (params) => {
        if (!params) return '/orders/vendor'
        return `/orders/vendor${buildQuery(params as any)}`
      },
      transformResponse: (response: OrdersResponse | any) => {
        if (response?.data) {
          if (response.meta) {
            return {
              orders: response.data,
              pagination: {
                page: response.meta.page || 1,
                limit: response.meta.limit || 10,
                total: response.meta.total || 0,
                totalPages: response.meta.totalPages || 0,
                hasPrevPage: response.meta.hasPrevPage || false,
                hasNextPage: response.meta.hasNextPage || false,
              }
            }
          }
          if (Array.isArray(response.data)) {
            return { orders: response.data, pagination: null }
          }
        }
        if (Array.isArray(response)) {
          return { orders: response, pagination: null }
        }
        return { orders: [], pagination: null }
      },
      providesTags: ['Order'],
    }),

    // Delhivery: Create Shipment (admin/vendor)
    createDelhiveryShipment: builder.mutation<IOrder, { id: string; payload?: any }>({
      query: ({ id, payload }) => ({
        url: `/orders/${id}/delhivery/shipment`,
        method: 'POST',
        body: payload || {},
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // Delhivery: Schedule Pickup (admin/vendor)
    scheduleDelhiveryPickup: builder.mutation<{ dlvRes: any }, { id: string; expectedPackageCount?: number; pickup?: { date?: string; time?: string; location?: string } }>({
      query: ({ id, ...body }) => ({
        url: `/orders/${id}/delhivery/pickup`,
        method: 'POST',
        body,
      }),
    }),

    // Delhivery: Get Label (admin/vendor)
    getDelhiveryLabel: builder.query<{ pdfBase64: string }, { id: string }>({
      query: ({ id }) => `/orders/${id}/delhivery/label`,
      transformResponse: (res: any) => (res?.data || res),
    }),

    // Delhivery: Track (admin/vendor/user)
    trackDelhivery: builder.query<any, { id: string }>({
      query: ({ id }) => `/orders/${id}/delhivery/track`,
      transformResponse: (res: any) => (res?.data || res),
      providesTags: (_r, _e, { id }) => [{ type: 'Order', id }],
    }),
  }),
})

//   Export hooks
export const { 
  useGetOrdersQuery, 
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useCancelOrderMutation,
  useGetOrderSummaryQuery,
  useGetVendorOrdersQuery,
  useGetVendorOrderSummaryQuery,
  useCreateDelhiveryShipmentMutation,
  useScheduleDelhiveryPickupMutation,
  useGetDelhiveryLabelQuery,
  useTrackDelhiveryQuery,
  useLazyGetDelhiveryLabelQuery,
  useLazyTrackDelhiveryQuery,
} = orderApi
