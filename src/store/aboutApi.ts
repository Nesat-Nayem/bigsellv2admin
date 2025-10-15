import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IAboutUs {
  image: string
  title: string
  subtitle: string
  url: string
}

export interface ICounter {
  happyCustomers: number
  electronicsProducts: number
  activeSalesman: number
  storeWorldwide: number
}

export interface IAboutInfo {
  image: string
  title: string
  description: string
}

export interface IWhyChooseUs {
  image: string
  title: string
  shortDesc: string
}

export interface IAbout {
  _id: string
  aboutUs: IAboutUs
  counter: ICounter
  aboutInfo: IAboutInfo
  whyChooseUs: IWhyChooseUs[]
  createdAt: string
  updatedAt: string
  __v: number
}

interface AboutResponse {
  success: boolean
  statusCode: number
  message: string
  data: IAbout
}

export const aboutApi = createApi({
  reducerPath: 'aboutApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'http://localhost:8080/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['about'],
  endpoints: (builder) => ({
    // GET
    getAbout: builder.query<IAbout, void>({
      query: () => '/about',
      transformResponse: (response: AboutResponse) => response.data,
      providesTags: ['about'],
    }),

    // UPDATE (accept FormData too)
    updateAbout: builder.mutation<IAbout, FormData>({
      query: (data) => ({
        url: '/about',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: AboutResponse) => response.data,
      invalidatesTags: ['about'],
    }),
  }),
})

export const { useGetAboutQuery, useUpdateAboutMutation } = aboutApi
