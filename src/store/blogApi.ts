import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IBlog {
  _id: string
  title: string
  shortDesc: string
  longDesc: string
  category: string
  image: File | string
  createdAt: string
  updatedAt: string
  status?: 'Active' | 'InActive'
}

interface BlogResponse {
  success: boolean
  statusCode: number
  message: string
  data: IBlog | IBlog[]
}

export const blogApi = createApi({
  reducerPath: 'blogApi',
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

  tagTypes: ['blog'],
  endpoints: (builder) => ({
    getBlogs: builder.query<IBlog[], void>({
      query: () => 'blogs',
      transformResponse: (response: BlogResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['blog'],
    }),

    getBlogById: builder.query<IBlog, string>({
      query: (id) => `blogs/${id}`,
      transformResponse: (response: BlogResponse) => response.data as IBlog,
      providesTags: (result, error, id) => [{ type: 'blog', id }],
    }),

    createBlog: builder.mutation<IBlog, FormData>({
      query: (formData) => ({
        url: 'blogs',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: BlogResponse) => response.data as IBlog,
      invalidatesTags: ['blog'],
    }),

    updateBlog: builder.mutation<IBlog, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `blogs/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: BlogResponse) => response.data as IBlog,
      invalidatesTags: (result, error, { id }) => [{ type: 'blog', id }, 'blog'],
    }),

    deleteBlog: builder.mutation<IBlog, string>({
      query: (id) => ({
        url: `blogs/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: BlogResponse) => response.data as IBlog,
      invalidatesTags: ['blog'],
    }),
  }),
})

export const { useGetBlogsQuery, useGetBlogByIdQuery, useCreateBlogMutation, useUpdateBlogMutation, useDeleteBlogMutation } = blogApi
