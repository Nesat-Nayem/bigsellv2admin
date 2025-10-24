import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

const baseUrl = 'https://api.atpuae.com/v1/api'

/**
 * Types
 */
export interface IProduct {
  _id?: string
  name: string
  slug?: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  discount?: number
  discountType?: 'percentage' | 'flat' | 'fixed' | 'other' | '' | null
  sku?: string
  category?:
    | {
        _id: string
        title: string
      }
    | string
  subcategory?: {
    _id: string
    title: string
  } | string
  subSubcategory?: {
    _id: string
    title: string
  } | string
  brand?: string
  images?: string[]
  thumbnail?: string
  stock?: number
  minStock?: number
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  colors?: string[]
  sizes?: string[]
  tags?: string[]
  features?: string[]
  specifications?: { key: string; value: string }[] | Record<string, any>
  status?: 'active' | 'inactive' | ''
  isFeatured?: boolean
  isTrending?: boolean
  isNewArrival?: boolean
  isDiscount?: boolean
  isWeeklyBestSelling?: boolean
  isWeeklyDiscount?: boolean
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  vendor?: string
  shippingInfo?: {
    weight?: number
    freeShipping?: boolean
    shippingCost?: number
    estimatedDelivery?: string
  }
  rating?: number
  reviewCount?: number
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
  __v?: number
  image?: File | string
}

// Dashboard product summary
export interface IProductSummary {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  outOfStock: number
  lowStock: number
}

interface PaginatedData {
  docs: IProduct[]
  total?: number
  page?: number
  limit?: number
  totalPages?: number
  hasPrevPage?: boolean
  hasNextPage?: boolean
}

interface ProductResponse {
  success: boolean
  statusCode: number
  message?: string
  data?: IProduct | IProduct[] | PaginatedData | null
  meta?: any
  errorSources?: Array<{ path?: string; message?: string }>
}

interface BulkDeleteResponse {
  success: boolean
  message?: string
  deletedCount?: number
}

interface FilterResponse {
  success: boolean
  statusCode: number
  message?: string
  data?: {
    brands: string[]
    colors: string[]
    sizes: string[]
    priceRange: {
      minPrice: number
      maxPrice: number
    }
  }
}

/**
 * Helper: build query string from object
 */
const buildQuery = (params?: Record<string, any>): string => {
  if (!params) return ''
  const qp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    // if array push multiple times
    if (Array.isArray(v)) {
      v.forEach((val) => qp.append(k, String(val)))
    } else {
      qp.append(k, String(v))
    }
  })
  const qs = qp.toString()
  return qs ? `?${qs}` : ''
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: `${baseUrl}`,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const state = getState() as IRootState
      const token = state?.auth?.token
      const user = state?.auth?.user

      // console.log('Products API - Token:', token ? 'Present' : 'Missing')
      // console.log('Products API - User:', user)

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      // Only set Content-Type if not already set by the specific query
      if (!headers.has('Content-Type')) {
        headers.set('Accept', 'application/json')
      }

      // Add role information for backend filtering
      if (user?.role) {
        headers.set('X-User-Role', user.role)
      }

      // console.log('Products API - Headers:', Object.fromEntries(headers))
      return headers
    },
  }),
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    /* ---------------- Uploads ---------------- */
    uploadSingleImage: builder.mutation<{ url: string }, File | FormData>({
      query: (fileOrForm) => {
        let body: FormData
        if (fileOrForm instanceof FormData) {
          body = fileOrForm
        } else {
          body = new FormData()
          body.append('image', fileOrForm)
        }
        return {
          url: 'upload/single',
          method: 'POST',
          body,
        }
      },
      transformResponse: (res: any): { url: string } => {
        const url = res?.data?.url || res?.url
        if (!url) throw new Error(res?.message || 'Upload failed')
        return { url }
      },
    }),

    // GET /products/summary (admin only)
    getProductSummary: builder.query<IProductSummary, void>({
      query: () => 'products/summary',
      transformResponse: (res: any): IProductSummary => {
        if (res && typeof res === 'object' && 'data' in res) {
          return res.data as IProductSummary
        }
        return {
          totalProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0,
          outOfStock: 0,
          lowStock: 0,
        }
      },
      providesTags: [{ type: 'Product', id: 'SUMMARY' }],
    }),

    // GET /products/summary/vendor (vendor only)
    getVendorProductSummary: builder.query<IProductSummary, void>({
      query: () => 'products/summary/vendor',
      transformResponse: (res: any): IProductSummary => {
        if (res && typeof res === 'object' && 'data' in res) {
          return res.data as IProductSummary
        }
        return {
          totalProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0,
          outOfStock: 0,
          lowStock: 0,
        }
      },
      providesTags: [{ type: 'Product', id: 'SUMMARY_VENDOR' }],
    }),

    uploadMultipleImages: builder.mutation<{ urls: string[] }, File[] | FormData>({
      query: (filesOrForm) => {
        let body: FormData
        if (filesOrForm instanceof FormData) {
          body = filesOrForm
        } else {
          body = new FormData()
          filesOrForm.forEach((file) => body.append('images', file))
        }
        return {
          url: 'upload/multiple',
          method: 'POST',
          body,
        }
      },
      transformResponse: (res: any): { urls: string[] } => {
        const arr = res?.data
        if (Array.isArray(arr)) {
          const urls = arr.map((x: any) => x?.url).filter(Boolean)
          if (urls.length === 0) throw new Error('No URLs returned')
          return { urls }
        }
        throw new Error(res?.message || 'Upload failed')
      },
    }),
    /* ---------------- Basic CRUD ---------------- */
    createProduct: builder.mutation<IProduct, Partial<IProduct> | FormData>({
      query: (data) => {
        // If it's already FormData, use it directly
        if (data instanceof FormData) {
          return {
            url: 'products',
            method: 'POST',
            body: data,
          }
        }
        
        // Otherwise, send as JSON
        return {
          url: 'products',
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      },
      transformResponse: (res: ProductResponse): IProduct => {
        if (!res.data) {
          throw new Error(res.message || 'Failed to create product')
        }
        return res.data as IProduct
      },
      invalidatesTags: ['Product'],
    }),

    // Admin/Vendor managed list (auth required)
    getManageProducts: builder.query<{
      products: IProduct[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasPrevPage: boolean
        hasNextPage: boolean
      } | null
    }, { 
      page?: number
      limit?: number
      sort?: string
      order?: 'asc' | 'desc'
      category?: string
      subcategory?: string
      brand?: string
      minPrice?: number
      maxPrice?: number
      inStock?: boolean
      status?: 'active' | 'inactive'
      isFeatured?: boolean
      isTrending?: boolean
      isNewArrival?: boolean
      isDiscount?: boolean
      isWeeklyBestSelling?: boolean
      isWeeklyDiscount?: boolean
      colors?: string
      sizes?: string
      rating?: number
      search?: string
    } | void>({
      query: (params) => {
        if (!params) return 'products/manage'
        return `products/manage${buildQuery(params)}`
      },
      transformResponse: (response: ProductResponse) => {
        const data = response?.data
        if (!data) return { products: [], pagination: null }

        // New: if meta exists with array data, map to pagination
        if (response?.meta && Array.isArray(data)) {
          const meta = response.meta as any
          return {
            products: data,
            pagination: {
              page: meta.page || 1,
              limit: meta.limit || 10,
              total: meta.total || 0,
              totalPages: meta.totalPages || 0,
              hasPrevPage: meta.hasPrevPage ?? (meta.page > 1),
              hasNextPage: meta.hasNextPage ?? (meta.page < (meta.totalPages || 0)),
            },
          }
        }

        // Handle paginated response with docs
        if (typeof data === 'object' && 'docs' in data && Array.isArray((data as PaginatedData).docs)) {
          const paginatedData = data as PaginatedData
          return {
            products: paginatedData.docs,
            pagination: {
              page: paginatedData.page || 1,
              limit: paginatedData.limit || 10,
              total: paginatedData.total || 0,
              totalPages: paginatedData.totalPages || 0,
              hasPrevPage: paginatedData.hasPrevPage || false,
              hasNextPage: paginatedData.hasNextPage || false,
            }
          }
        }

        // Handle array response
        if (Array.isArray(data)) {
          return { 
            products: data, 
            pagination: null 
          }
        }

        // Handle single object response
        if (typeof data === 'object' && '_id' in data) {
          return { 
            products: [data as IProduct], 
            pagination: null 
          }
        }

        return { products: [], pagination: null }
      },
      providesTags: (result) =>
        result?.products
          ? [...result.products.map((product) => ({ type: 'Product' as const, id: product._id })), { type: 'Product', id: 'LIST' }]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // Public list (kept for storefront or other use)
    getAllProducts: builder.query<{
      products: IProduct[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasPrevPage: boolean
        hasNextPage: boolean
      } | null
    }, { 
      page?: number
      limit?: number
      sort?: string
      order?: 'asc' | 'desc'
      category?: string
      subcategory?: string
      brand?: string
      minPrice?: number
      maxPrice?: number
      inStock?: boolean
      status?: 'active' | 'inactive'
      isFeatured?: boolean
      isTrending?: boolean
      isNewArrival?: boolean
      isDiscount?: boolean
      isWeeklyBestSelling?: boolean
      isWeeklyDiscount?: boolean
      colors?: string
      sizes?: string
      rating?: number
      search?: string
    } | void>({
      query: (params) => {
        if (!params) return 'products'
        return `products${buildQuery(params)}`
      },
      transformResponse: (response: ProductResponse) => {
        const data = response?.data
        if (!data) return { products: [], pagination: null }

        // New: if meta exists with array data, map to pagination
        if (response?.meta && Array.isArray(data)) {
          const meta = response.meta as any
          return {
            products: data,
            pagination: {
              page: meta.page || 1,
              limit: meta.limit || 10,
              total: meta.total || 0,
              totalPages: meta.totalPages || 0,
              hasPrevPage: meta.hasPrevPage ?? (meta.page > 1),
              hasNextPage: meta.hasNextPage ?? (meta.page < (meta.totalPages || 0)),
            },
          }
        }

        if (typeof data === 'object' && 'docs' in data && Array.isArray((data as PaginatedData).docs)) {
          const paginatedData = data as PaginatedData
          return {
            products: paginatedData.docs,
            pagination: {
              page: paginatedData.page || 1,
              limit: paginatedData.limit || 10,
              total: paginatedData.total || 0,
              totalPages: paginatedData.totalPages || 0,
              hasPrevPage: paginatedData.hasPrevPage || false,
              hasNextPage: paginatedData.hasNextPage || false,
            }
          }
        }

        if (Array.isArray(data)) {
          return { 
            products: data, 
            pagination: null 
          }
        }

        if (typeof data === 'object' && '_id' in data) {
          return { 
            products: [data as IProduct], 
            pagination: null 
          }
        }

        return { products: [], pagination: null }
      },
      providesTags: (result) =>
        result?.products
          ? [...result.products.map((product) => ({ type: 'Product' as const, id: product._id })), { type: 'Product', id: 'PUBLIC_LIST' }]
          : [{ type: 'Product', id: 'PUBLIC_LIST' }],
    }),

    getProductById: builder.query<IProduct, string>({
      query: (id) => `products/${id}`,
      transformResponse: (res: ProductResponse): IProduct => {
        const data = res.data
        if (!data) {
          throw new Error(res.message || 'Product not found')
        }

        // Handle array response (take first item)
        if (Array.isArray(data)) {
          if (data.length === 0) {
            throw new Error('Product not found')
          }
          return data[0]
        }

        // Handle paginated response
        if (typeof data === 'object' && 'docs' in data) {
          const docs = (data as PaginatedData).docs
          if (!Array.isArray(docs) || docs.length === 0) {
            throw new Error('Product not found')
          }
          return docs[0]
        }

        // Handle single object response
        return data as IProduct
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    getProductBySlug: builder.query<IProduct, string>({
      query: (slug) => `products/slug/${slug}`,
      transformResponse: (res: ProductResponse): IProduct => {
        const data = res.data
        if (!data) {
          throw new Error(res.message || 'Product not found')
        }

        // Handle array response (take first item)
        if (Array.isArray(data)) {
          if (data.length === 0) {
            throw new Error('Product not found')
          }
          return data[0]
        }

        // Handle paginated response
        if (typeof data === 'object' && 'docs' in data) {
          const docs = (data as PaginatedData).docs
          if (!Array.isArray(docs) || docs.length === 0) {
            throw new Error('Product not found')
          }
          return docs[0]
        }

        // Handle single object response
        return data as IProduct
      },
      providesTags: (result, error, slug) => [{ type: 'Product', id: `slug-${slug}` }],
    }),

    updateProduct: builder.mutation<IProduct, { id: string; data: Partial<IProduct> | FormData }>({
      query: ({ id, data }) => {
        // If it's already FormData, use it directly
        if (data instanceof FormData) {
          return {
            url: `products/${id}`,
            method: 'PUT',
            body: data,
          }
        }
        
        // Otherwise, send as JSON
        return {
          url: `products/${id}`,
          method: 'PUT',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      },
      transformResponse: (res: ProductResponse): IProduct => {
        if (!res.data) {
          throw new Error(res.message || 'Failed to update product')
        }
        return res.data as IProduct
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (res: ProductResponse) => ({
        success: res.success || false,
        message: res.message,
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    /* ---------------- Specialized Product Endpoints ---------------- */

    // GET /products/featured
    getFeaturedProducts: builder.query<IProduct[], { limit?: number } | void>({
      query: (params) => `products/featured${buildQuery(params ?? {})}`,
      transformResponse: (res: ProductResponse): IProduct[] => {
        const data = res.data
        if (!data) return []
        if (Array.isArray(data)) return data
        return []
      },
      providesTags: [{ type: 'Product', id: 'FEATURED' }],
    }),

    // GET /products/trending
    getTrendingProducts: builder.query<IProduct[], { limit?: number } | void>({
      query: (params) => `products/trending${buildQuery(params ?? {})}`,
      transformResponse: (res: ProductResponse): IProduct[] => {
        const data = res.data
        if (!data) return []
        if (Array.isArray(data)) return data
        return []
      },
      providesTags: [{ type: 'Product', id: 'TRENDING' }],
    }),

    // GET /products/new-arrivals
    getNewArrivalProducts: builder.query<IProduct[], { limit?: number } | void>({
      query: (params) => `products/new-arrivals${buildQuery(params ?? {})}`,
      transformResponse: (res: ProductResponse): IProduct[] => {
        const data = res.data
        if (!data) return []
        if (Array.isArray(data)) return data
        return []
      },
      providesTags: [{ type: 'Product', id: 'NEW_ARRIVALS' }],
    }),

    // GET /products/discount
    getDiscountProducts: builder.query<IProduct[], { limit?: number } | void>({
      query: (params) => `products/discount${buildQuery(params ?? {})}`,
      transformResponse: (res: ProductResponse): IProduct[] => {
        const data = res.data
        if (!data) return []
        if (Array.isArray(data)) return data
        return []
      },
      providesTags: [{ type: 'Product', id: 'DISCOUNT' }],
    }),

    // GET /products/weekly-best-selling
    getWeeklyBestSellingProducts: builder.query<IProduct[], { limit?: number } | void>({
      query: (params) => `products/weekly-best-selling${buildQuery(params ?? {})}`,
      transformResponse: (res: ProductResponse): IProduct[] => {
        const data = res.data
        if (!data) return []
        if (Array.isArray(data)) return data
        return []
      },
      providesTags: [{ type: 'Product', id: 'WEEKLY_BEST_SELLING' }],
    }),

    // GET /products/weekly-discount
    getWeeklyDiscountProducts: builder.query<IProduct[], { limit?: number } | void>({
      query: (params) => `products/weekly-discount${buildQuery(params ?? {})}`,
      transformResponse: (res: ProductResponse): IProduct[] => {
        const data = res.data
        if (!data) return []
        if (Array.isArray(data)) return data
        return []
      },
      providesTags: [{ type: 'Product', id: 'WEEKLY_DISCOUNT' }],
    }),

    // GET /products/category/:categoryId
    getProductsByCategory: builder.query<
      { items: IProduct[]; total?: number; page?: number; limit?: number },
      { categoryId: string; page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc' }
    >({
      query: ({ categoryId, ...params }) => 
        `products/category/${categoryId}${buildQuery(params)}`,
      transformResponse: (res: ProductResponse) => {
        const data = res.data
        if (!data) return { items: [], total: 0 }

        // Handle paginated response
        if (typeof data === 'object' && 'docs' in data) {
          const pag = data as PaginatedData
          return {
            items: pag.docs || [],
            total: pag.total,
            page: pag.page,
            limit: pag.limit,
          }
        }

        // Handle array response
        if (Array.isArray(data)) {
          return {
            items: data,
            total: data.length,
          }
        }

        return { items: [], total: 0 }
      },
      providesTags: (result, error, { categoryId }) => [{ type: 'Product', id: `CATEGORY_${categoryId}` }],
    }),

    // GET /products/search?q=shirt&page=1&limit=5
    searchProducts: builder.query<
      { items: IProduct[]; total?: number; page?: number; limit?: number },
      { q: string; page?: number; limit?: number }
    >({
      query: (params) => `products/search${buildQuery(params)}`,
      transformResponse: (res: ProductResponse) => {
        const data = res.data
        if (!data) return { items: [], total: 0 }

        // Handle paginated response
        if (typeof data === 'object' && 'docs' in data) {
          const pag = data as PaginatedData
          return {
            items: pag.docs || [],
            total: pag.total,
            page: pag.page,
            limit: pag.limit,
          }
        }

        // Handle array response
        if (Array.isArray(data)) {
          return {
            items: data,
            total: data.length,
          }
        }

        return { items: [], total: 0 }
      },
      providesTags: [{ type: 'Product', id: 'SEARCH' }],
    }),

    // GET /products/filters
    getProductFilters: builder.query<{
      brands: string[]
      colors: string[]
      sizes: string[]
      priceRange: {
        minPrice: number
        maxPrice: number
      }
    }, void>({
      query: () => 'products/filters',
      transformResponse: (res: FilterResponse) => {
        return res.data || {
          brands: [],
          colors: [],
          sizes: [],
          priceRange: { minPrice: 0, maxPrice: 0 }
        }
      },
      providesTags: [{ type: 'Product', id: 'FILTERS' }],
    }),

    // Additional useful endpoints
    bulkDeleteProducts: builder.mutation<BulkDeleteResponse, string[]>({
      query: (ids) => ({
        url: 'products/bulk-delete',
        method: 'DELETE',
        body: JSON.stringify({ ids }),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (res: ProductResponse): BulkDeleteResponse => {
        if (res.data && typeof res.data === 'object' && 'success' in res.data) {
          return res.data as BulkDeleteResponse
        }
        return {
          success: res.success || false,
          message: res.message,
        }
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProductStatus: builder.mutation<IProduct, { id: string; status: 'active' | 'inactive' }>({
      query: ({ id, status }) => ({
        url: `products/${id}/status`,
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (res: ProductResponse): IProduct => {
        if (!res.data) {
          throw new Error(res.message || 'Failed to update product status')
        }
        return res.data as IProduct
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    updateProductFeatureFlags: builder.mutation<IProduct, { 
      id: string
      isFeatured?: boolean
      isTrending?: boolean
      isNewArrival?: boolean
      isDiscount?: boolean
      isWeeklyBestSelling?: boolean
      isWeeklyDiscount?: boolean
    }>({
      query: ({ id, ...flags }) => ({
        url: `products/${id}/feature-flags`,
        method: 'PATCH',
        body: JSON.stringify(flags),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (res: ProductResponse): IProduct => {
        if (!res.data) {
          throw new Error(res.message || 'Failed to update product feature flags')
        }
        return res.data as IProduct
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'FEATURED' },
        { type: 'Product', id: 'TRENDING' },
        { type: 'Product', id: 'NEW_ARRIVALS' },
        { type: 'Product', id: 'DISCOUNT' },
        { type: 'Product', id: 'WEEKLY_BEST_SELLING' },
        { type: 'Product', id: 'WEEKLY_DISCOUNT' },
      ],
    }),
  }),
})

/**
 * Export hooks
 */
export const {
  // Basic CRUD
  useCreateProductMutation,
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,

  // Specialized Product Operations
  useGetFeaturedProductsQuery,
  useGetTrendingProductsQuery,
  useGetNewArrivalProductsQuery,
  useGetDiscountProductsQuery,
  useGetWeeklyBestSellingProductsQuery,
  useGetWeeklyDiscountProductsQuery,
  useGetProductsByCategoryQuery,
  useSearchProductsQuery,
  useGetProductFiltersQuery,
  useGetProductSummaryQuery,
  useGetVendorProductSummaryQuery,
  useGetManageProductsQuery,

  // Additional operations
  useBulkDeleteProductsMutation,
  useUpdateProductStatusMutation,
  useUpdateProductFeatureFlagsMutation,

  // Uploads
  useUploadSingleImageMutation,
  useUploadMultipleImagesMutation,

  // Lazy query hooks
  useLazyGetAllProductsQuery,
  useLazyGetProductByIdQuery,
  useLazyGetProductBySlugQuery,
  useLazyGetFeaturedProductsQuery,
  useLazyGetTrendingProductsQuery,
  useLazyGetNewArrivalProductsQuery,
  useLazyGetDiscountProductsQuery,
  useLazyGetWeeklyBestSellingProductsQuery,
  useLazyGetWeeklyDiscountProductsQuery,
  useLazyGetProductsByCategoryQuery,
  useLazySearchProductsQuery,
  useLazyGetProductFiltersQuery,
  useLazyGetProductSummaryQuery,
} = productsApi

export default productsApi
