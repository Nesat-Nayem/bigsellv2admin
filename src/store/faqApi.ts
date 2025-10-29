import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// Define the FAQ type
export interface Ifaq {
  _id: string
  question: string
  answer: string
  status: string
  createdAt: string
  updatedAt: string
}

// Define response types
interface FaqResponse {
  success: boolean
  statusCode: number
  message: string
  data: Ifaq | Ifaq[]
}

export const faqApi = createApi({
  reducerPath: 'faqApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'http://localhost:8080/v1/api',
    prepareHeaders: (headers, { getState }) => {
      // Get token from state
      const token = (getState() as IRootState).auth.token

      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }

      return headers
    },
  }),
  tagTypes: ['Faq'],
  endpoints: (builder) => ({
    // Get all FAQs
    getFaqs: builder.query<Ifaq[], { active?: boolean }>({
      query: (params) => {
        let queryString = 'faqs'
        if (params?.active !== undefined) {
          queryString += `?active=${params.active}`
        }
        return queryString
      },
      transformResponse: (response: FaqResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['Faq'],
    }),

    // Get FAQ by ID
    getFaqById: builder.query<Ifaq, string>({
      query: (id) => `faqs/${id}`,
      transformResponse: (response: FaqResponse) => response.data as Ifaq,
      providesTags: (result, error, id) => [{ type: 'Faq', id }],
    }),

    // frontend mutation
    createFaq: builder.mutation<Ifaq, Partial<Ifaq>>({
      query: (data) => ({
        url: 'faqs',
        method: 'POST',
        body: data, //   plain object, not FormData
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: FaqResponse) => response.data as Ifaq,
      invalidatesTags: ['Faq'],
    }),

    // Update FAQ (JSON body)
    updateFaq: builder.mutation<Ifaq, { id: string; data: Partial<Ifaq> }>({
      query: ({ id, data }) => ({
        url: `faqs/${id}`,
        method: 'PUT',
        body: data, // JSON
        headers: { 'Content-Type': 'application/json' },
      }),
      transformResponse: (response: FaqResponse) => response.data as Ifaq,
      invalidatesTags: (result, error, { id }) => [{ type: 'Faq', id }, 'Faq'],
    }),

    // Delete FAQ
    deleteFaq: builder.mutation<Ifaq, string>({
      query: (id) => ({
        url: `faqs/${id}`,
        method: 'DELETE',
      }),

      transformResponse: (response: FaqResponse) => response.data as Ifaq,
      invalidatesTags: ['Faq'],
    }),
  }),
})

export const { useGetFaqsQuery, useGetFaqByIdQuery, useCreateFaqMutation, useUpdateFaqMutation, useDeleteFaqMutation } = faqApi
