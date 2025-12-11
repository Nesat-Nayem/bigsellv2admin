import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IContactEnquiry {
  _id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  createdAt: string
  updatedAt: string
}

interface ContactEnquiryResponse {
  success: boolean
  statusCode: number
  message: string
  data: IContactEnquiry | IContactEnquiry[]
}

export const contactApi = createApi({
  reducerPath: 'contactApi',
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
  tagTypes: ['ContactEnquiry'],
  endpoints: (builder) => ({
    getContactEnquiries: builder.query<IContactEnquiry[], void>({
      query: () => '/contracts',
      transformResponse: (response: ContactEnquiryResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['ContactEnquiry'],
    }),

    deleteContactEnquiry: builder.mutation<IContactEnquiry, string>({
      query: (id) => ({
        url: `/contracts/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ContactEnquiryResponse) => response.data as IContactEnquiry,
      invalidatesTags: ['ContactEnquiry'],
    }),
  }),
})

export const { useGetContactEnquiriesQuery, useDeleteContactEnquiryMutation } = contactApi
