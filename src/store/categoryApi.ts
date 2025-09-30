import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ICategory {
  _id: string
  title: string
  image: File | string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface CategoryResponse {
  success: boolean
  statusCode: number
  message: string
  data: ICategory | ICategory[]
}

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
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

  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<ICategory[], void>({
      query: () => 'categories',
      transformResponse: (response: CategoryResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['Category'],
    }),

    getCategoryById: builder.query<ICategory, string>({
      query: (id) => `categories/${id}`,
      transformResponse: (response: CategoryResponse) => response.data as ICategory,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    createCategory: builder.mutation<ICategory, FormData>({
      query: (formData) => ({
        url: 'categories',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: CategoryResponse) => response.data as ICategory,
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation<ICategory, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: CategoryResponse) => response.data as ICategory,
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Category'],
    }),

    deleteCategory: builder.mutation<ICategory, string>({
      query: (id) => ({
        url: `categories/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: CategoryResponse) => response.data as ICategory,
      invalidatesTags: ['Category'],
    }),
  }),
})

export const { useGetCategoriesQuery, useGetCategoryByIdQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } =
  categoryApi
