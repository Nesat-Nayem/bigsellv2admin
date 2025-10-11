import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

const baseUrl = 'http://localhost:8080/v1/api'

/**
 * Types
 */
export interface IAttribute {
  name: string
  type: 'text' | 'select' | string
  required?: boolean
  options?: string[]
}

export interface ICategory {
  _id: string
  title: string
  slug?: string
  description?: string
  icon?: string
  parentId?: string | null
  level?: number
  path?: string
  fullPath?: string
  isActive?: boolean
  displayOrder?: number
  attributes?: IAttribute[]
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  image?: File | string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
  // for tree responses:
  children?: ICategory[]
}

interface PaginatedData {
  docs: ICategory[]
  total?: number
  page?: number
  limit?: number
  totalPages?: number
  hasPrevPage?: boolean
  hasNextPage?: boolean
}

interface CategoryResponse {
  success: boolean
  statusCode: number
  message?: string
  data?: ICategory | ICategory[] | PaginatedData | null
  meta?: any
  errorSources?: Array<{ path?: string; message?: string }>
}

interface BulkDeleteResponse {
  success: boolean
  message?: string
  deletedCount?: number
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

export const productCategoryApi = createApi({
  reducerPath: 'productCategoryApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: `${baseUrl}`,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const state = getState() as IRootState
      const token = state?.auth?.token
      const user = state?.auth?.user

      // console.log('ProductCategory API - Token:', token ? 'Present' : 'Missing')
      // console.log('ProductCategory API - User:', user)

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

      // console.log('ProductCategory API - Headers:', Object.fromEntries(headers))
      return headers
    },
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    /* ---------------- Basic CRUD ---------------- */
    createCategory: builder.mutation<ICategory, Partial<ICategory> | FormData>({
      query: (data) => {
        // If it's already FormData, use it directly
        if (data instanceof FormData) {
          return {
            url: 'productsCategory',
            method: 'POST',
            body: data,
          }
        }
        
        // Otherwise, send as JSON
        return {
          url: 'productsCategory',
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      },
      transformResponse: (res: CategoryResponse): ICategory => {
        if (!res.data) {
          throw new Error(res.message || 'Failed to create category')
        }
        return res.data as ICategory
      },
      invalidatesTags: ['Category'],
    }),

    getCategories: builder.query<ICategory[], { page?: number; limit?: number; search?: string } | void>({
      query: (params) => {
        if (!params) return 'productsCategory'
        const { page, limit, search } = params
        return `productsCategory${buildQuery({ page, limit, search })}`
      },
      transformResponse: (response: CategoryResponse): ICategory[] => {
        const data = response?.data
        if (!data) return []

        // Handle paginated response
        if (typeof data === 'object' && 'docs' in data && Array.isArray((data as PaginatedData).docs)) {
          return (data as PaginatedData).docs
        }

        // Handle array response
        if (Array.isArray(data)) {
          return data
        }

        // Handle single object response
        if (typeof data === 'object' && '_id' in data) {
          return [data as ICategory]
        }

        return []
      },
      providesTags: (result) =>
        result
          ? [...result.map((category) => ({ type: 'Category' as const, id: category._id })), { type: 'Category', id: 'LIST' }]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    getCategoryById: builder.query<ICategory, string>({
      query: (id) => `productsCategory/${id}`,
      transformResponse: (res: CategoryResponse): ICategory => {
        const data = res.data
        if (!data) {
          throw new Error(res.message || 'Category not found')
        }

        // Handle array response (take first item)
        if (Array.isArray(data)) {
          if (data.length === 0) {
            throw new Error('Category not found')
          }
          return data[0]
        }

        // Handle paginated response
        if (typeof data === 'object' && 'docs' in data) {
          const docs = (data as PaginatedData).docs
          if (!Array.isArray(docs) || docs.length === 0) {
            throw new Error('Category not found')
          }
          return docs[0]
        }

        // Handle single object response
        return data as ICategory
      },
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    updateCategory: builder.mutation<ICategory, { id: string; data: Partial<ICategory> | FormData }>({
      query: ({ id, data }) => {
        // If it's already FormData, use it directly
        if (data instanceof FormData) {
          return {
            url: `productsCategory/${id}`,
            method: 'PUT',
            body: data,
          }
        }
        
        // Otherwise, send as JSON
        return {
          url: `productsCategory/${id}`,
          method: 'PUT',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      },
      transformResponse: (res: CategoryResponse): ICategory => {
        if (!res.data) {
          throw new Error(res.message || 'Failed to update category')
        }
        return res.data as ICategory
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    deleteCategory: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `productsCategory/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (res: CategoryResponse) => ({
        success: res.success || false,
        message: res.message,
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    /* ---------------- Hierarchical Operations ---------------- */

    // GET /productsCategory/tree?maxDepth=3
    getCategoryTree: builder.query<ICategory[], { maxDepth?: number } | void>({
      query: (params) => `productsCategory/tree${buildQuery(params ?? {})}`,
      transformResponse: (res: CategoryResponse): ICategory[] => {
        const data = res.data
        if (!data) return []
        if (Array.isArray(data)) return data
        return []
      },
      providesTags: [{ type: 'Category', id: 'TREE' }],
    }),

    // GET /productsCategory/root
    getRootCategories: builder.query<ICategory[], void>({
      query: () => 'productsCategory/root',
      transformResponse: (res: CategoryResponse): ICategory[] => {
        const data = res.data
        if (!data) return []
        if (Array.isArray(data)) return data
        return []
      },
      providesTags: [{ type: 'Category', id: 'ROOTS' }],
    }),

    // GET /productsCategory/parent/:parentId
    getChildrenByParent: builder.query<ICategory[], string>({
      query: (parentId) => `productsCategory/parent/${parentId}`,
      transformResponse: (res: CategoryResponse): ICategory[] => {
        const data = res.data
        if (!data) return []
        if (Array.isArray(data)) return data
        return []
      },
      providesTags: (result, error, parentId) => [{ type: 'Category', id: `children-${parentId}` }],
    }),

    // GET /productsCategory/:id/breadcrumbs
    getCategoryBreadcrumbs: builder.query<ICategory[], string>({
      query: (id) => `productsCategory/${id}/breadcrumbs`,
      transformResponse: (res: CategoryResponse): ICategory[] => {
        const data = res.data
        if (!data) return []
        if (Array.isArray(data)) return data
        return []
      },
      providesTags: (result, error, id) => [{ type: 'Category', id: `breadcrumbs-${id}` }],
    }),

    // GET /productsCategory/search?query=shirt&level=2&page=1&limit=5
    searchCategories: builder.query<
      { items: ICategory[]; total?: number; page?: number; limit?: number; totalPages?: number },
      { query?: string; level?: number; page?: number; limit?: number; status?: 'all' | 'active' | 'inactive' }
    >({
      query: (params) => `productsCategory/search${buildQuery(params)}`,
      transformResponse: (res: CategoryResponse) => {
        const data = res.data
        const meta = (res as any).meta || {}
        if (!data) return { items: [], total: 0 }

        // Handle paginated response
        if (typeof data === 'object' && 'docs' in data) {
          const pag = data as PaginatedData
          return {
            items: pag.docs || [],
            total: pag.total,
            page: pag.page,
            limit: pag.limit,
            totalPages: pag.totalPages,
          }
        }

        // Handle array response
        if (Array.isArray(data)) {
          return {
            items: data,
            total: meta?.total ?? data.length,
            page: meta?.page,
            limit: meta?.limit,
            totalPages: meta?.totalPages,
          }
        }

        return { items: [], total: 0 }
      },
      providesTags: [{ type: 'Category', id: 'SEARCH' }],
    }),

    // Additional useful endpoints
    bulkDeleteCategories: builder.mutation<BulkDeleteResponse, string[]>({
      query: (ids) => ({
        url: 'productsCategory/bulk-delete',
        method: 'DELETE',
        body: JSON.stringify({ ids }),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (res: CategoryResponse): BulkDeleteResponse => {
        if (res.data && typeof res.data === 'object' && 'success' in res.data) {
          return res.data as BulkDeleteResponse
        }
        return {
          success: res.success || false,
          message: res.message,
        }
      },
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    reorderCategories: builder.mutation<ICategory[], Array<{ id: string; displayOrder: number }>>({
      query: (reorderData) => ({
        url: 'productsCategory/reorder',
        method: 'PUT',
        body: JSON.stringify({ categories: reorderData }),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (res: CategoryResponse): ICategory[] => {
        const data = res.data
        if (!data) return []
        if (Array.isArray(data)) return data
        return []
      },
      invalidatesTags: [
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'TREE' },
      ],
    }),

    toggleCategoryStatus: builder.mutation<ICategory, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `productsCategory/${id}`,
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (res: CategoryResponse): ICategory => {
        if (!res.data) {
          throw new Error(res.message || 'Failed to toggle category status')
        }
        return res.data as ICategory
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    /* ---------------- Uploads ---------------- */
    uploadImage: builder.mutation<{ url: string }, File | FormData>({
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
  }),
})

/**
 * Export hooks
 */
export const {
  // Basic CRUD
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  // Hierarchical Operations
  useGetCategoryTreeQuery,
  useGetRootCategoriesQuery,
  useGetChildrenByParentQuery,
  useGetCategoryBreadcrumbsQuery,
  useSearchCategoriesQuery,

  // Additional operations
  useBulkDeleteCategoriesMutation,
  useReorderCategoriesMutation,
  useToggleCategoryStatusMutation,

  // Uploads
  useUploadImageMutation,

  // Lazy query hooks
  useLazyGetCategoryTreeQuery,
  useLazyGetCategoriesQuery,
  useLazyGetChildrenByParentQuery,
  useLazySearchCategoriesQuery,
  useLazyGetCategoryByIdQuery,
} = productCategoryApi

export default productCategoryApi
