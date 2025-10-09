import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react' //   use /react for hooks
import { RootState as IRootState } from '@/store'

export interface IShippingPolicy {
  _id: string
  content: string
  updatedAt: string
}

interface ShippingPolicyResponse {
  success: boolean
  statusCode: number
  message: string
  data: IShippingPolicy
}

export const shippingPolicyApi = createApi({
  reducerPath: 'shippingPolicy',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'https://api.bigsell.org/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['shippingPolicy'],
  endpoints: (builder) => ({
    // get
    getShippingPolicy: builder.query<IShippingPolicy, void>({
      query: () => '/shipping-policy',
      transformResponse: (response: ShippingPolicyResponse) => response.data,
      providesTags: ['shippingPolicy'],
    }),

    // update
    updateShippingPolicy: builder.mutation<IShippingPolicy, { content: string }>({
      query: (data) => ({
        url: '/shipping-policy',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ShippingPolicyResponse) => response.data,
      invalidatesTags: ['shippingPolicy'],
    }),
  }),
})

export const { useGetShippingPolicyQuery, useUpdateShippingPolicyMutation } = shippingPolicyApi
