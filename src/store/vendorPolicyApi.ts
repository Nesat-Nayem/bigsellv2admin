import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react' //   use /react for hooks
import { RootState as IRootState } from '@/store'

export interface IVendorPolicy {
  _id: string
  content: string
  updatedAt: string
}

interface vendorPolicyResponse {
  success: boolean
  statusCode: number
  message: string
  data: IVendorPolicy
}

export const vendorPolicyApi = createApi({
  reducerPath: 'vendorPolicy',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'http://api.atpuae.com/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['vendorPolicy'],
  endpoints: (builder) => ({
    // get
    getVendorPolicy: builder.query<IVendorPolicy, void>({
      query: () => '/vendor-policy',
      transformResponse: (response: vendorPolicyResponse) => response.data,
      providesTags: ['vendorPolicy'],
    }),

    // update
    updateVendorPolicy: builder.mutation<IVendorPolicy, { content: string }>({
      query: (data) => ({
        url: '/vendor-policy',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: vendorPolicyResponse) => response.data,
      invalidatesTags: ['vendorPolicy'],
    }),
  }),
})

export const { useGetVendorPolicyQuery, useUpdateVendorPolicyMutation } = vendorPolicyApi
