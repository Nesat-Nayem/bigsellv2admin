import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IBlogCategory {
  _id: string
  categoryName: string
  createdAt: string
  updatedAt: string
  status?: 'Active' | 'Inactive'
}

interface BlogCategoryResponse {
  success: boolean
  statusCode: number
  message: string
  data: IBlogCategory | IBlogCategory[]
}

export const blogCategoryApi = createApi({
  reducerPath: 'blogCategoryApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'https://api.bigsell.org/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),

  tagTypes: ['blogCategory'],
  endpoints: (builder) => ({
    getBlogCategories: builder.query<IBlogCategory[], void>({
      query: () => 'blog-categories',
      transformResponse: (response: BlogCategoryResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['blogCategory'],
    }),

    getBlogCategoryById: builder.query<IBlogCategory, string>({
      query: (id) => `blog-categories/${id}`,
      transformResponse: (response: BlogCategoryResponse) => response.data as IBlogCategory,
      providesTags: (result, error, id) => [{ type: 'blogCategory', id }],
    }),

    // api slice
    createBlogCategory: builder.mutation<IBlogCategory, { categoryName: string; status: string }>({
      query: (data) => ({
        url: 'blog-categories',
        method: 'POST',
        body: data, // JSON body
        headers: { 'Content-Type': 'application/json' },
      }),
      transformResponse: (response: BlogCategoryResponse) => response.data as IBlogCategory,
      invalidatesTags: ['blogCategory'],
    }),

    updateBlogCategory: builder.mutation<IBlogCategory, { id: string; data: { categoryName: string; status: 'Active' | 'Inactive' } }>({
      query: ({ id, data }) => ({
        url: `blog-categories/${id}`,
        method: 'PUT',
        body: data,
        headers: { 'Content-Type': 'application/json' }, // ensure JSON
      }),
      transformResponse: (response: BlogCategoryResponse) => response.data as IBlogCategory,
      invalidatesTags: (result, error, { id }) => [{ type: 'blogCategory', id }, 'blogCategory'],
    }),

    deleteBlogCategory: builder.mutation<IBlogCategory, string>({
      query: (id) => ({
        url: `blog-categories/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: BlogCategoryResponse) => response.data as IBlogCategory,
      invalidatesTags: ['blogCategory'],
    }),
  }),
})

export const {
  useGetBlogCategoriesQuery,
  useGetBlogCategoryByIdQuery,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
} = blogCategoryApi
