import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '@/store/apiSlice'
import authSlice from '@/store/authSlice'
import { categoryApi } from '@/store/categoryApi'
import productsApi from '@/store/productsApi'
import { privacyPolicyApi } from '@/store/privacyPolicyApi'
import { orderApi } from '@/store/orderApi'
import { contactApi } from './contactEnquiryApi'
import { helpSupportApi } from './helpSupportApi'
import { termsApi } from './termsApi'
import { faqApi } from './faqApi'
import { blogCategoryApi } from './blogCategoryApi'
import { blogApi } from './blogApi'
import { headerBannerApi } from './headerBannerApi'
import { mainBannerApi } from './mainBannerApi'
import { aboutApi } from './aboutApi'
import { generalSettingsApi } from './generalSettingsApi'
import { discountBannerApi } from './discountBannerApi'
import { offerBannerApi } from './offerBannerApi'
import { paymentPolicyApi } from './paymentPolicyApi'
import { shippingPolicyApi } from './shippingPolicyApi'
import { siteSecurityApi } from './siteSecurityApi'
import { disclaimerApi } from './disclaimerApi'
import { vendorPolicyApi } from './vendorPolicyApi'
import productCategoryApi from './productCategoryApi'
import { subscriptionApi } from './subscriptionApi'
import { subscriptionIncludesApi } from './subscriptionIncludesApi'
import { sellerApi } from './sellerApi'
import { couponApi } from './couponApi'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [privacyPolicyApi.reducerPath]: privacyPolicyApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [helpSupportApi.reducerPath]: helpSupportApi.reducer,
    [termsApi.reducerPath]: termsApi.reducer,
    [faqApi.reducerPath]: faqApi.reducer,
    [blogCategoryApi.reducerPath]: blogCategoryApi.reducer,
    [blogApi.reducerPath]: blogApi.reducer,
    [headerBannerApi.reducerPath]: headerBannerApi.reducer,
    [mainBannerApi.reducerPath]: mainBannerApi.reducer,
    [aboutApi.reducerPath]: aboutApi.reducer,
    [generalSettingsApi.reducerPath]: generalSettingsApi.reducer,
    [discountBannerApi.reducerPath]: discountBannerApi.reducer,
    [offerBannerApi.reducerPath]: offerBannerApi.reducer,
    [paymentPolicyApi.reducerPath]: paymentPolicyApi.reducer,
    [shippingPolicyApi.reducerPath]: shippingPolicyApi.reducer,
    [siteSecurityApi.reducerPath]: siteSecurityApi.reducer,
    [disclaimerApi.reducerPath]: disclaimerApi.reducer,
    [vendorPolicyApi.reducerPath]: vendorPolicyApi.reducer,
    [productCategoryApi.reducerPath]: productCategoryApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [subscriptionIncludesApi.reducerPath]: subscriptionIncludesApi.reducer,
    [sellerApi.reducerPath]: sellerApi.reducer,
    [couponApi.reducerPath]: couponApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      apiSlice.middleware,
      categoryApi.middleware,
      productsApi.middleware,
      orderApi.middleware,
      privacyPolicyApi.middleware,
      contactApi.middleware,
      helpSupportApi.middleware,
      termsApi.middleware,
      faqApi.middleware,
      blogCategoryApi.middleware,
      blogApi.middleware,
      headerBannerApi.middleware,
      mainBannerApi.middleware,
      aboutApi.middleware,
      generalSettingsApi.middleware,
      discountBannerApi.middleware,
      offerBannerApi.middleware,
      paymentPolicyApi.middleware,
      shippingPolicyApi.middleware,
      siteSecurityApi.middleware,
      disclaimerApi.middleware,
      vendorPolicyApi.middleware,
      productCategoryApi.middleware,
      subscriptionApi.middleware,
      subscriptionIncludesApi.middleware,
      sellerApi.middleware,
      couponApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
