import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ITermsConditions {
  _id: string
  content: string
  updatedAt: string
}

interface TermsConditionsResponse {
  success: boolean
  statusCode: number
  message: string
  data: ITermsConditions
}

export const termsApi = createApi({
  reducerPath: 'termsApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'https://api.atpuae.com/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['termsApi'],
  endpoints: (builder) => ({
    getTerms: builder.query<ITermsConditions, void>({
      query: () => ({
        url: 'terms-conditions',
      }),
      transformResponse: (response: TermsConditionsResponse) => response.data,
      providesTags: ['termsApi'],
    }),

    // update
    updateTerms: builder.mutation<ITermsConditions, { content: string }>({
      query: (data) => ({
        url: 'terms-conditions',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: TermsConditionsResponse) => response.data,
      invalidatesTags: ['termsApi'],
    }),
  }),
})

export const { useGetTermsQuery, useUpdateTermsMutation } = termsApi
