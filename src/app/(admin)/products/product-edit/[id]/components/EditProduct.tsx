'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetCategoryTreeQuery, useGetChildrenByParentQuery, useGetCategoryByIdQuery } from '@/store/productCategoryApi'
import { useGetProductByIdQuery, useUpdateProductMutation, IProduct } from '@/store/productsApi'
import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import type { RootState as IRootState } from '@/store'
import { useDropzone } from 'react-dropzone'

interface FormValues {
  name: string
  description: string
  shortDescription: string
  price: number
  originalPrice: number
  discount: number
  discountType: 'percentage' | 'flat' | 'other' | 'fixed' | ''
  sku: string
  category: string
  subcategory: string
  subSubcategory: string
  brand: string
  images: string[]
  thumbnail: string
  stock: number
  minStock: number
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  colors: string[]
  sizes: string[]
  tags: string[]
  features: string[]
  specifications: { key: string; value: string }[]
  status: 'active' | 'inactive' | ''
  isFeatured: boolean
  isTrending: boolean
  isNewArrival: boolean
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  categoryAttributes?: Record<string, any>
  shippingInfo: {
    weight: number
    freeShipping: boolean
    shippingCost: number
    estimatedDelivery: string
  }
}

interface EditProductProps {
  productId: string
}

const EditProduct: React.FC<EditProductProps> = ({ productId }) => {
  const router = useRouter()
  const API_BASE = 'http://localhost:8080/v1/api'
  const token = useSelector((s: IRootState) => (s as any)?.auth?.token)
  const role = useSelector((s: IRootState) => (s as any)?.auth?.user?.role)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([])
  const [subcategoryAttributes, setSubcategoryAttributes] = useState<any[]>([])
  const [subSubcategoryAttributes, setSubSubcategoryAttributes] = useState<any[]>([])
  const didInitFromTree = useRef(false)
  // Image management: combined list of existing and new items
  type ImageItem = {
    type: 'existing' | 'new'
    url?: string
    file?: File
    preview: string
    progress?: number
    status?: 'idle' | 'uploading' | 'success' | 'error' | 'canceled' | 'existing'
    error?: string | null
    xhr?: XMLHttpRequest | null
    uploadedUrl?: string | null
  }
  const [imageItems, setImageItems] = useState<ImageItem[]>([])
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [thumbProgress, setThumbProgress] = useState(0)
  const [thumbStatus, setThumbStatus] = useState<'idle' | 'uploading' | 'success' | 'error' | 'canceled' | 'existing'>('idle')
  const [thumbError, setThumbError] = useState<string | null>(null)
  const [thumbXhr, setThumbXhr] = useState<XMLHttpRequest | null>(null)

  // Get product data
  const { data: product, isLoading: productLoading, error: productError } = useGetProductByIdQuery(productId)
  
  // Get category tree and derive root categories (limit depth 2)
  const { data: categoryTree = [], isLoading: categoriesLoading } = useGetCategoryTreeQuery({ maxDepth: 2 })
  const categories = (categoryTree || []).filter((cat: any) => !cat.parentId)
  
  // Get subcategories based on selected category
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useGetChildrenByParentQuery(selectedCategoryId, { skip: !selectedCategoryId })
  // (moved) Get sub-subcategories when subcategory is selected — placed after useForm/watch

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
      price: 0,
      originalPrice: 0,
      discount: 0,
      discountType: '',
      sku: '',
      category: '',
      subcategory: '',
      subSubcategory: '',
      brand: '',
      images: [],
      thumbnail: '',
      stock: 0,
      minStock: 0,
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      colors: [],
      sizes: [],
      tags: [],
      features: [],
      specifications: [],
      status: 'active',
      isFeatured: false,
      isTrending: false,
      isNewArrival: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
      shippingInfo: {
        weight: 0,
        freeShipping: false,
        shippingCost: 0,
        estimatedDelivery: '',
      },
    },
  })

  const watchedCategory = watch('category')
  const watchedSubcategory = watch('subcategory')
  const watchedSubSubcategory = watch('subSubcategory')
  const prevSubcategoryRef = useRef<string | null>(null)
  const initialCategoryIdRef = useRef<string | null>(null)
  const initialSubIdRef = useRef<string | null>(null)
  const initialSubSubIdRef = useRef<string | null>(null)
  const appliedInitialSubRef = useRef<boolean>(false)
  const appliedInitialSubSubRef = useRef<boolean>(false)

  // Get sub-subcategories when subcategory is selected
  const { data: subSubcategories = [], isLoading: subSubcategoriesLoading } = useGetChildrenByParentQuery(
    watchedSubcategory || '',
    { skip: !watchedSubcategory }
  )

  // Fetch full category details (with attributes) for root category
  const { data: selectedCategoryDetails } = useGetCategoryByIdQuery(watchedCategory || '', { skip: !watchedCategory })

  // After subcategories load, re-apply initial subcategory once
  useEffect(() => {
    if (didInitFromTree.current && !appliedInitialSubRef.current && !subcategoriesLoading && Array.isArray(subcategories)) {
      const targetSub = initialSubIdRef.current
      if (targetSub && subcategories.some((s: any) => String(s._id) === String(targetSub))) {
        setValue('subcategory', String(targetSub))
      }
      appliedInitialSubRef.current = true
    }
  }, [subcategoriesLoading, subcategories, setValue])

  // After sub-subcategories load, re-apply initial sub-subcategory once
  useEffect(() => {
    if (didInitFromTree.current && !appliedInitialSubSubRef.current && !subSubcategoriesLoading && Array.isArray(subSubcategories)) {
      const target = initialSubSubIdRef.current
      if (target && subSubcategories.some((s: any) => String(s._id) === String(target))) {
        setValue('subSubcategory', String(target))
      }
      appliedInitialSubSubRef.current = true
    }
  }, [subSubcategoriesLoading, subSubcategories, setValue])

  // Populate form when product data is loaded
  useEffect(() => {
    if (product) {
      console.log('Product data:', product)
      
      // Set form values
      reset({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        discount: product.discount || 0,
        discountType: product.discountType || '',
        sku: product.sku || '',
        category: (product.category as any)?._id || product.category || '',
        subcategory: (product.subcategory as any)?._id || (typeof product.subcategory === 'string' ? product.subcategory : ''),
        subSubcategory: (product as any).subSubcategory ? ((product as any).subSubcategory as any)._id || (typeof (product as any).subSubcategory === 'string' ? (product as any).subSubcategory : '') : '',
        brand: product.brand || '',
        images: product.images || [],
        thumbnail: product.thumbnail || '',
        stock: product.stock || 0,
        minStock: product.minStock || 0,
        weight: product.weight || 0,
        dimensions: {
          length: product.dimensions?.length || 0,
          width: product.dimensions?.width || 0,
          height: product.dimensions?.height || 0,
        },
        colors: product.colors || [],
        sizes: product.sizes || [],
        tags: product.tags || [],
        features: product.features || [],
        specifications: Array.isArray(product.specifications) ? product.specifications : [],
        status: product.status || 'active',
        isFeatured: product.isFeatured || false,
        isTrending: product.isTrending || false,
        isNewArrival: product.isNewArrival || false,
        seoTitle: product.seoTitle || '',
        seoDescription: product.seoDescription || '',
        seoKeywords: product.seoKeywords || [],
        shippingInfo: {
          weight: product.shippingInfo?.weight || 0,
          freeShipping: product.shippingInfo?.freeShipping || false,
          shippingCost: product.shippingInfo?.shippingCost || 0,
          estimatedDelivery: product.shippingInfo?.estimatedDelivery || '',
        },
      })

      // Prefill dynamic attributes from specifications (record map)
      const specRec: Record<string, any> = Array.isArray(product.specifications)
        ? (product.specifications as any[]).reduce((acc: Record<string, any>, it: any) => {
            if (it && it.key) acc[it.key] = it.value
            return acc
          }, {})
        : (product.specifications as any) || {}
      if (specRec && Object.keys(specRec).length > 0) {
        setValue('categoryAttributes', specRec)
      }

      // Set selected arrays
      setSelectedSizes(product.sizes || [])
      setSelectedColors(product.colors || [])
      
      // Set category for subcategories
      const categoryId = (product.category as any)?._id || product.category || ''
      setSelectedCategoryId(categoryId)
      initialCategoryIdRef.current = categoryId || null

      // Prime previous subcategory ref to avoid clearing subSubcategory on first initialization
      const initialSubId = (product.subcategory as any)?._id || (typeof product.subcategory === 'string' ? product.subcategory : '')
      ;(prevSubcategoryRef as any).current = initialSubId || null
      initialSubIdRef.current = initialSubId || null

      const initialSubSubId = (product as any).subSubcategory
        ? ((product as any).subSubcategory as any)._id || (typeof (product as any).subSubcategory === 'string' ? (product as any).subSubcategory : '')
        : ''
      initialSubSubIdRef.current = initialSubSubId || null

      // Initialize images list (existing)
      const initialImages: ImageItem[] = (product.images || []).map((u) => ({
        type: 'existing',
        url: u,
        preview: u,
        status: 'existing',
      }))
      setImageItems(initialImages)

      // Initialize thumbnail preview
      setThumbPreview(product.thumbnail || null)
      setThumbStatus('existing')
    }
  }, [product, reset])

  // When category tree is ready, normalize category/subcategory/subSubcategory so UI can auto-select reliably
  const findPathToId = (nodes: any[], targetId: string, path: any[] = []): any[] | null => {
    for (const node of nodes || []) {
      const nextPath = [...path, node]
      if (String(node._id) === String(targetId)) return nextPath
      if (node.children && node.children.length) {
        const found = findPathToId(node.children, targetId, nextPath)
        if (found) return found
      }
    }
    return null
  }

  useEffect(() => {
    if (!product || didInitFromTree.current) return
    const tree: any[] = Array.isArray(categoryTree) ? (categoryTree as any[]) : []
    if (!tree.length) return

    const prodCatId = (product.category as any)?._id || (typeof product.category === 'string' ? product.category : '')
    const prodSubId = (product.subcategory as any)?._id || (typeof product.subcategory === 'string' ? product.subcategory : '')
    const prodSubSubId = ((product as any).subSubcategory as any)?._id || (typeof (product as any).subSubcategory === 'string' ? (product as any).subSubcategory : '')

    let finalCategoryId = ''
    let finalSubId = ''
    let finalSubSubId = ''

    const targetId = prodSubSubId || prodSubId || prodCatId
    if (targetId) {
      const path = findPathToId(tree, String(targetId))
      if (path && path.length >= 1) {
        finalCategoryId = String(path[0]?._id || '')
        finalSubId = path[1] ? String(path[1]._id) : ''
        finalSubSubId = path[2] ? String(path[2]._id) : ''
      }
    }

    if (finalCategoryId) {
      setValue('category', finalCategoryId)
      setSelectedCategoryId(finalCategoryId)
    }
    if (finalSubId) setValue('subcategory', finalSubId)
    if (finalSubSubId) setValue('subSubcategory', finalSubSubId)

    didInitFromTree.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryTree, product])

  // Update selected category and reset dependent selections (skip during initial normalization)
  useEffect(() => {
    if (!watchedCategory) return
    // During initial programmatic setup, avoid clearing children
    if (!didInitFromTree.current && !selectedCategoryId) {
      setSelectedCategoryId(watchedCategory)
      return
    }
    if (watchedCategory !== selectedCategoryId) {
      setSelectedCategoryId(watchedCategory)
      setValue('subcategory', '')
      setValue('subSubcategory', '')
    }
  }, [watchedCategory, selectedCategoryId, setValue])

  // Set category attributes from detailed category fetch
  useEffect(() => {
    const nextAttrs: any[] = selectedCategoryDetails && Array.isArray((selectedCategoryDetails as any).attributes)
      ? ((selectedCategoryDetails as any).attributes as any[])
      : []
    setCategoryAttributes(nextAttrs)
  }, [selectedCategoryDetails])

  // Update subcategory attributes when subcategory changes; clear subSubcategory only after initial load
  useEffect(() => {
    const current = watchedSubcategory || null
    if (prevSubcategoryRef.current !== null && prevSubcategoryRef.current !== current) {
      setValue('subSubcategory', '')
    }
    prevSubcategoryRef.current = current
    if (watchedSubcategory) {
      const selectedSubcat = subcategories.find((cat) => cat._id === watchedSubcategory)
      const attrs: any[] = selectedSubcat && Array.isArray((selectedSubcat as any).attributes)
        ? ((selectedSubcat as any).attributes as any[])
        : []
      setSubcategoryAttributes(attrs)
    } else {
      setSubcategoryAttributes([])
    }
  }, [watchedSubcategory, subcategories, setValue])

  // Update sub-subcategory attributes when sub-subcategory changes
  useEffect(() => {
    if (watchedSubSubcategory) {
      const selectedSubSubcat = subSubcategories.find((cat: any) => cat._id === watchedSubSubcategory)
      const attrs: any[] = selectedSubSubcat && Array.isArray((selectedSubSubcat as any).attributes)
        ? ((selectedSubSubcat as any).attributes as any[])
        : []
      setSubSubcategoryAttributes(attrs)
    } else {
      setSubSubcategoryAttributes([])
    }
  }, [watchedSubSubcategory, subSubcategories])

  // Handle size selection
  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setSelectedSizes((prev) => [...prev, size])
    } else {
      setSelectedSizes((prev) => prev.filter((s) => s !== size))
    }
  }

  // Handle color selection
  const handleColorChange = (color: string, checked: boolean) => {
    if (checked) {
      setSelectedColors((prev) => [...prev, color])
    } else {
      setSelectedColors((prev) => prev.filter((c) => c !== color))
    }
  }

  // Dropzone for adding new images
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    onDrop: (acceptedFiles) => {
      if (!acceptedFiles?.length) return
      const newItems: ImageItem[] = acceptedFiles.map((f) => ({
        type: 'new',
        file: f,
        preview: URL.createObjectURL(f),
        progress: 0,
        status: 'idle',
        error: null,
        xhr: null,
        uploadedUrl: null,
      }))
      setImageItems((prev) => [...prev, ...newItems])
    },
  })

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      imageItems.forEach((it) => {
        if (it.type === 'new' && it.preview) URL.revokeObjectURL(it.preview)
      })
    }
  }, [imageItems])

  // Helpers
  const setImageItemAt = (idx: number, patch: Partial<ImageItem>) => {
    setImageItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], ...patch }
      return next
    })
  }

  const swapAt = <T,>(arr: T[], i: number, j: number): T[] => {
    const next = [...arr]
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  }

  const moveLeft = (idx: number) => {
    if (idx <= 0) return
    setImageItems((prev) => swapAt(prev, idx, idx - 1))
  }
  const moveRight = (idx: number) => {
    if (idx >= imageItems.length - 1) return
    setImageItems((prev) => swapAt(prev, idx, idx + 1))
  }
  const removeImageAt = (idx: number) => {
    const it = imageItems[idx]
    if (it?.xhr) it.xhr.abort()
    if (it?.type === 'new' && it.preview) URL.revokeObjectURL(it.preview)
    setImageItems((prev) => prev.filter((_, i) => i !== idx))
  }

  // Upload helpers
  const uploadImageItemAt = (idx: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const it = imageItems[idx]
      if (!it || it.type !== 'new' || !it.file) return resolve(it?.url || '')
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE}/upload/single`)
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      if (role) xhr.setRequestHeader('X-User-Role', String(role))
      setImageItemAt(idx, { status: 'uploading', error: null, xhr })
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const p = Math.round((e.loaded / e.total) * 100)
          setImageItemAt(idx, { progress: p })
        }
      }
      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText)
            const url = res?.data?.url || res?.url
            if (url) {
              setImageItemAt(idx, { status: 'success', uploadedUrl: url, xhr: null })
              return resolve(url)
            }
            const err = new Error(res?.message || 'Upload failed')
            setImageItemAt(idx, { status: 'error', error: err.message })
            return reject(err)
          }
          const err = new Error(`Upload failed (${xhr.status})`)
          setImageItemAt(idx, { status: 'error', error: err.message })
          reject(err)
        } catch (e: any) {
          setImageItemAt(idx, { status: 'error', error: e?.message || 'Upload failed' })
          reject(e)
        }
      }
      xhr.onerror = () => {
        const err = new Error('Network error during upload')
        setImageItemAt(idx, { status: 'error', error: err.message })
        reject(err)
      }
      const fd = new FormData()
      fd.append('image', it.file)
      xhr.send(fd)
    })
  }
  const cancelImageUpload = (idx: number) => {
    const it = imageItems[idx]
    if (it?.xhr) {
      it.xhr.abort()
      setImageItemAt(idx, { status: 'canceled', error: 'Upload canceled', xhr: null })
    }
  }
  const retryImageUpload = (idx: number) => uploadImageItemAt(idx)

  const uploadThumbnail = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!thumbFile) return resolve(product?.thumbnail || '')
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE}/upload/single`)
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      if (role) xhr.setRequestHeader('X-User-Role', String(role))
      setThumbStatus('uploading')
      setThumbError(null)
      setThumbXhr(xhr)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setThumbProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText)
            const url = res?.data?.url || res?.url
            if (url) {
              setThumbStatus('success')
              setThumbXhr(null)
              setThumbPreview(url)
              return resolve(url)
            }
            const err = new Error(res?.message || 'Upload failed')
            setThumbStatus('error')
            setThumbError(err.message)
            return reject(err)
          }
          const err = new Error(`Upload failed (${xhr.status})`)
          setThumbStatus('error')
          setThumbError(err.message)
          reject(err)
        } catch (e: any) {
          setThumbStatus('error')
          setThumbError(e?.message || 'Upload failed')
          reject(e)
        }
      }
      xhr.onerror = () => {
        const err = new Error('Network error during upload')
        setThumbStatus('error')
        setThumbError(err.message)
        reject(err)
      }
      const fd = new FormData()
      fd.append('image', thumbFile)
      xhr.send(fd)
    })
  }
  const cancelThumbUpload = () => {
    if (thumbXhr) {
      thumbXhr.abort()
      setThumbStatus('canceled')
      setThumbError('Upload canceled')
      setThumbXhr(null)
    }
  }
  const retryThumbUpload = () => uploadThumbnail()

  // Update form values when selections change
  useEffect(() => {
    setValue('sizes', selectedSizes)
  }, [selectedSizes, setValue])

  useEffect(() => {
    setValue('colors', selectedColors)
  }, [selectedColors, setValue])

  const onSubmit = async (values: FormValues) => {
    try {
      // 1) Upload new images
      const uploadPromises = imageItems.map((_, idx) => uploadImageItemAt(idx))
      const uploaded = await Promise.all(uploadPromises)

      // Build final images array in order
      const finalImages: string[] = imageItems.map((it, idx) => (it.type === 'existing' ? it.url! : uploaded[idx]))

      // 2) Upload/reuse thumbnail
      const finalThumb = await uploadThumbnail()

      // 3) Normalize discount type
      const normalizedDiscountType = values.discountType === 'flat' ? 'fixed' : values.discountType || undefined

      // 4) Build specifications record (merge manual specs + dynamic attributes)
      const manualSpecs = Array.isArray(values.specifications)
        ? values.specifications.reduce((acc: Record<string, string>, item) => {
            if (item && item.key) acc[item.key] = String(item.value ?? '')
            return acc
          }, {})
        : {}
      const dynamicSpecs = values.categoryAttributes
        ? Object.entries(values.categoryAttributes).reduce((acc: Record<string, string>, [k, v]) => {
            if (v !== undefined && v !== null && String(v).trim() !== '') acc[k] = String(v)
            return acc
          }, {})
        : {}
      const mergedSpecs = { ...manualSpecs, ...dynamicSpecs }
      const specsRecord = Object.keys(mergedSpecs).length > 0 ? mergedSpecs : undefined

      // 5) Clean data
      const productData: any = {
        name: values.name,
        description: values.description,
        shortDescription: values.shortDescription || undefined,
        price: Number(values.price) || 0,
        originalPrice: values.originalPrice ? Number(values.originalPrice) : undefined,
        discount: values.discount ? Number(values.discount) : undefined,
        ...(normalizedDiscountType ? { discountType: normalizedDiscountType } : {}),
        sku: values.sku,
        ...(values.category ? { category: values.category } : {}),
        ...(values.subcategory ? { subcategory: values.subcategory } : {}),
        ...(values.subSubcategory ? { subSubcategory: values.subSubcategory } : {}),
        ...(values.brand ? { brand: values.brand } : {}),
        images: finalImages,
        thumbnail: finalThumb || product?.thumbnail,
        stock: Number(values.stock) || 0,
        minStock: Number(values.minStock) || 0,
        weight: Number(values.weight) || 0,
        dimensions: {
          length: Number(values.dimensions?.length) || 0,
          width: Number(values.dimensions?.width) || 0,
          height: Number(values.dimensions?.height) || 0,
        },
        colors: selectedColors,
        sizes: selectedSizes,
        tags: values.tags || [],
        features: values.features || [],
        specifications: specsRecord && Object.keys(specsRecord).length > 0 ? specsRecord : undefined,
        status: values.status || undefined,
        isFeatured: Boolean(values.isFeatured),
        isTrending: Boolean(values.isTrending),
        isNewArrival: Boolean(values.isNewArrival),
        seoTitle: values.seoTitle || undefined,
        seoDescription: values.seoDescription || undefined,
        seoKeywords: values.seoKeywords || [],
        shippingInfo: {
          weight: Number(values.shippingInfo?.weight) || 0,
          freeShipping: Boolean(values.shippingInfo?.freeShipping),
          shippingCost: Number(values.shippingInfo?.shippingCost) || 0,
          estimatedDelivery: values.shippingInfo?.estimatedDelivery || '',
        },
      }

      Object.keys(productData).forEach((key) => {
        if ((productData as any)[key] === '' || (productData as any)[key] === null) {
          delete (productData as any)[key]
        }
      })

      await updateProduct({ id: productId, data: productData }).unwrap()
      
      // Success notification
      if (typeof toast !== 'undefined') {
        toast.success('Product updated successfully!')
      } else {
        alert('Product updated successfully!')
      }

      // Redirect back to product list
      router.push('/products/product-list?updated=1')
    } catch (err: any) {
      console.error('Error updating product:', err)

      // Error notification
      const errorMessage = err?.data?.message || err?.message || 'Failed to update product'

      if (typeof toast !== 'undefined') {
        toast.error(errorMessage)
      } else {
        alert(errorMessage)
      }
    }
  }

  if (productLoading) return <div>Loading product...</div>
  if (productError) return <div>Error loading product</div>
  if (!product) return <div>Product not found</div>

  // Size options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

  // Color options with their corresponding CSS classes
  const colorOptions = [
    { name: 'Black', value: 'black', className: 'text-dark' },
    { name: 'Yellow', value: 'yellow', className: 'text-warning' },
    { name: 'White', value: 'white', className: 'text-white border' },
    { name: 'Blue', value: 'blue', className: 'text-primary' },
    { name: 'Green', value: 'green', className: 'text-success' },
    { name: 'Red', value: 'red', className: 'text-danger' },
    { name: 'Sky', value: 'sky', className: 'text-info' },
    { name: 'Gray', value: 'gray', className: 'text-secondary' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Col xl={12}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Edit Product</h4>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => router.push('/products/product-list')}
          >
            ← Back to Product List
          </button>
        </div>

        {/* Images Drag & Drop */}
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as="h4">Product Images</CardTitle>
          </CardHeader>
          <CardBody>
            <div
              {...getRootProps({
                className: `border border-2 border-dashed rounded p-4 text-center ${isDragActive ? 'bg-light' : ''}`,
              })}
            >
              <input {...getInputProps()} />
              <div className="py-2">
                <IconifyIcon icon="bx:cloud-upload" className="fs-1 text-primary" />
                <div className="mt-2">Drag & drop images here, or click to browse</div>
                <small className="text-muted">PNG, JPG, GIF allowed</small>
              </div>
            </div>
            {imageItems.length > 0 && (
              <div className="mt-3 d-flex flex-wrap gap-3">
                {imageItems.map((it, idx) => (
                  <div key={idx} className="position-relative border rounded p-2 bg-light" style={{ width: 140 }}>
                    {/* Image Preview */}
                    <div className="d-flex justify-content-center mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.preview} alt={`img-${idx}`} className="img-thumbnail" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                    </div>
                    
                    {/* Progress Bar */}
                    {it.type === 'new' && it.status === 'uploading' && (
                      <div className="progress mb-2" style={{ height: 4 }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${it.progress || 0}%` }} aria-valuenow={it.progress || 0} aria-valuemin={0} aria-valuemax={100}></div>
                      </div>
                    )}
                    
                    {/* Status Text */}
                    <div className="text-center mb-2">
                      <small className={`${it.status === 'error' ? 'text-danger' : it.status === 'success' || it.status === 'existing' ? 'text-success' : 'text-muted'}`}>
                        {it.status || 'idle'}
                      </small>
                      {it.error && (
                        <div className="text-danger" style={{ fontSize: '10px' }} title={it.error}>
                          Error occurred
                        </div>
                      )}
                    </div>
                    
                    {/* Control Buttons - Two rows for better spacing */}
                    <div className="d-flex flex-column gap-1">
                      {/* Row 1: Move and Delete buttons */}
                      <div className="d-flex justify-content-center gap-1">
                        <button 
                          type="button" 
                          className="btn btn-sm btn-light px-2" 
                          onClick={() => moveLeft(idx)} 
                          disabled={idx === 0} 
                          title="Move Left"
                          style={{ width: '32px', height: '28px' }}
                        >
                          <IconifyIcon icon="solar:alt-arrow-left-linear" className="fs-14" />
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-light px-2" 
                          onClick={() => moveRight(idx)} 
                          disabled={idx === imageItems.length - 1} 
                          title="Move Right"
                          style={{ width: '32px', height: '28px' }}
                        >
                          <IconifyIcon icon="solar:alt-arrow-right-linear" className="fs-14" />
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-sm px-2" 
                          onClick={() => removeImageAt(idx)} 
                          title="Remove Image"
                          style={{ width: '32px', height: '28px', border: 'none', background: 'transparent' }}
                        >
                          <IconifyIcon icon="solar:trash-bin-minimalistic-broken" className="fs-14 text-danger" />
                        </button>
                      </div>
                      
                      {/* Row 2: Action buttons (Cancel/Retry) */}
                      {it.type === 'new' && (it.status === 'uploading' || it.status === 'error' || it.status === 'canceled') && (
                        <div className="d-flex justify-content-center">
                          {it.status === 'uploading' ? (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-warning px-3" 
                              onClick={() => cancelImageUpload(idx)} 
                              title="Cancel Upload"
                              style={{ fontSize: '11px', height: '26px' }}
                            >
                              <IconifyIcon icon="solar:close-circle-broken" className="me-1" />
                              Cancel
                            </button>
                          ) : (it.status === 'error' || it.status === 'canceled') ? (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-secondary px-3" 
                              onClick={() => retryImageUpload(idx)} 
                              title="Retry Upload"
                              style={{ fontSize: '11px', height: '26px' }}
                            >
                              <IconifyIcon icon="solar:restart-broken" className="me-1" />
                              Retry
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Thumbnail */}
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as="h4">Thumbnail</CardTitle>
          </CardHeader>
          <CardBody>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => {
                const f = e.target.files?.[0] || null
                setThumbFile(f)
                if (thumbPreview) URL.revokeObjectURL(thumbPreview)
                setThumbPreview(f ? URL.createObjectURL(f) : product.thumbnail || null)
                setThumbStatus(f ? 'idle' : 'existing')
                setThumbError(null)
                setThumbProgress(0)
                setThumbXhr(null)
              }}
            />
            {thumbPreview && (
              <div className="mt-2" style={{ width: 120 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbPreview} alt="thumb" className="img-thumbnail" style={{ width: 120, height: 120, objectFit: 'cover' }} />
                {thumbStatus === 'uploading' && (
                  <div className="progress mt-1" style={{ height: 6 }}>
                    <div className="progress-bar" role="progressbar" style={{ width: `${thumbProgress}%` }} aria-valuenow={thumbProgress} aria-valuemin={0} aria-valuemax={100}></div>
                  </div>
                )}
                <small className={`mt-1 d-block ${thumbStatus === 'error' ? 'text-danger' : 'text-muted'}`}>
                  {thumbStatus} {thumbError ? `- ${thumbError}` : ''}
                </small>
                <div className="d-flex gap-1 mt-1">
                  {thumbStatus === 'uploading' ? (
                    <button type="button" className="btn btn-sm btn-warning" onClick={cancelThumbUpload} title="Cancel">
                      Cancel
                    </button>
                  ) : (thumbStatus === 'error' || thumbStatus === 'canceled') ? (
                    <button type="button" className="btn btn-sm btn-secondary" onClick={retryThumbUpload} title="Retry">
                      Retry
                    </button>
                  ) : null}
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => { setThumbFile(null); setThumbPreview(product.thumbnail || null); setThumbStatus('existing'); }} title="Remove">
                    Remove
                  </button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Basic Information</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6} className="mb-3">
                <label>
                  Product Name <span className="text-danger">*</span>
                </label>
                <input
                  {...register('name', { required: 'Product name is required' })}
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Enter product name"
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </Col>
              <Col lg={6} className="mb-3">
                <label>SKU</label>
                <input {...register('sku')} className="form-control" placeholder="Enter SKU" />
              </Col>
            </Row>
            <Row>
              <Col lg={6} className="mb-3">
                <label>
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                  disabled={categoriesLoading}>
                  {categoriesLoading ? (
                    <option value="" disabled>Loading categories...</option>
                  ) : (
                    <>
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.title}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
              </Col>
              <Col lg={6} className="mb-3">
                <label>SubCategory</label>
                <select {...register('subcategory')} className="form-control" disabled={!selectedCategoryId || subcategoriesLoading}>
                  {subcategoriesLoading ? (
                    <option value="" disabled>Loading subcategories...</option>
                  ) : (
                    <>
                      <option value="">Select SubCategory</option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory._id} value={subcategory._id}>
                          {subcategory.title}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </Col>
            </Row>
            <Row>
              <Col lg={6} className="mb-3">
                <label>Sub-SubCategory</label>
                <select {...register('subSubcategory')} className="form-control" disabled={!watchedSubcategory || subSubcategoriesLoading}>
                  {subSubcategoriesLoading ? (
                    <option value="" disabled>Loading sub-subcategories...</option>
                  ) : (
                    <>
                      <option value="">Select Sub-SubCategory</option>
                      {subSubcategories.map((subsub: any) => (
                        <option key={subsub._id} value={subsub._id}>
                          {subsub.title}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </Col>
            </Row>

            <Row>
              <Col lg={6} className="mb-3">
                <label>Brand</label>
                <input {...register('brand')} className="form-control" placeholder="Enter brand" />
              </Col>
            </Row>

            {/* Dynamic Category Attributes */}
            {categoryAttributes && categoryAttributes.length > 0 && (
              <Row>
                <Col lg={12}>
                  <h5 className="mt-3 mb-3">Category Specific Attributes</h5>
                </Col>
                {categoryAttributes.map((attribute, index) => {
                  if (
                    attribute.name?.toLowerCase() === 'size' ||
                    attribute.name?.toLowerCase() === 'sizes' ||
                    attribute.name?.toLowerCase() === 'color' ||
                    attribute.name?.toLowerCase() === 'colors'
                  ) {
                    return null
                  }
                  return (
                    <Col lg={6} key={`cat-attr-${index}`} className="mb-3">
                      <label>
                        {attribute.name}
                        {attribute.required && <span className="text-danger">*</span>}
                      </label>
                      {attribute.type === 'select' && attribute.options ? (
                        <select
                          {...register(`categoryAttributes.${attribute.name}`, {
                            required: attribute.required ? `${attribute.name} is required` : false,
                          })}
                          className="form-control">
                          <option value="">Select {attribute.name}</option>
                          {attribute.options.map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : attribute.type === 'text' ? (
                        <input
                          {...register(`categoryAttributes.${attribute.name}`, {
                            required: attribute.required ? `${attribute.name} is required` : false,
                          })}
                          type="text"
                          className="form-control"
                          placeholder={`Enter ${attribute.name}`}
                        />
                      ) : attribute.type === 'number' ? (
                        <input
                          {...register(`categoryAttributes.${attribute.name}`, {
                            required: attribute.required ? `${attribute.name} is required` : false,
                          })}
                          type="number"
                          className="form-control"
                          placeholder={`Enter ${attribute.name}`}
                        />
                      ) : attribute.type === 'textarea' ? (
                        <textarea
                          {...register(`categoryAttributes.${attribute.name}`, {
                            required: attribute.required ? `${attribute.name} is required` : false,
                          })}
                          className="form-control"
                          rows={3}
                          placeholder={`Enter ${attribute.name}`}
                        />
                      ) : null}
                    </Col>
                  )
                })}
              </Row>
            )}

            {/* Dynamic Subcategory Attributes */}
            {subcategoryAttributes && subcategoryAttributes.length > 0 && (
              <Row>
                <Col lg={12}>
                  <h5 className="mt-3 mb-3">Subcategory Specific Attributes</h5>
                </Col>
                {subcategoryAttributes.map((attribute, index) => {
                  if (
                    attribute.name?.toLowerCase() === 'size' ||
                    attribute.name?.toLowerCase() === 'sizes' ||
                    attribute.name?.toLowerCase() === 'color' ||
                    attribute.name?.toLowerCase() === 'colors'
                  ) {
                    return null
                  }
                  return (
                    <Col lg={6} key={`subcat-attr-${index}`} className="mb-3">
                      <label>
                        {attribute.name}
                        {attribute.required && <span className="text-danger">*</span>}
                      </label>
                      {attribute.type === 'select' && attribute.options ? (
                        <select
                          {...register(`categoryAttributes.${attribute.name}`, {
                            required: attribute.required ? `${attribute.name} is required` : false,
                          })}
                          className="form-control">
                          <option value="">Select {attribute.name}</option>
                          {attribute.options.map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : attribute.type === 'text' ? (
                        <input
                          {...register(`categoryAttributes.${attribute.name}`, {
                            required: attribute.required ? `${attribute.name} is required` : false,
                          })}
                          type="text"
                          className="form-control"
                          placeholder={`Enter ${attribute.name}`}
                        />
                      ) : attribute.type === 'number' ? (
                        <input
                          {...register(`categoryAttributes.${attribute.name}`, {
                            required: attribute.required ? `${attribute.name} is required` : false,
                          })}
                          type="number"
                          className="form-control"
                          placeholder={`Enter ${attribute.name}`}
                        />
                      ) : attribute.type === 'textarea' ? (
                        <textarea
                          {...register(`categoryAttributes.${attribute.name}`, {
                            required: attribute.required ? `${attribute.name} is required` : false,
                          })}
                          className="form-control"
                          rows={3}
                          placeholder={`Enter ${attribute.name}`}
                        />
                      ) : null}
                    </Col>
                  )
                })}
              </Row>
            )}

            {/* Sizes and Colors Section - Only show if attributes exist */}
            {(() => {
              // Check if any level has size/color attributes
              const sizeAttribute = [...categoryAttributes, ...subcategoryAttributes, ...subSubcategoryAttributes].find(
                (attr) => attr.name && (attr.name.toLowerCase() === 'size' || attr.name.toLowerCase() === 'sizes'),
              )
              const colorAttribute = [...categoryAttributes, ...subcategoryAttributes, ...subSubcategoryAttributes].find(
                (attr) => attr.name && (attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'colors'),
              )

              // Show section only if at least one attribute exists
              const showSection = sizeAttribute || colorAttribute

              if (!showSection) {
                return null // Don't render anything if no size/color attributes
              }

              return (
                <Row className="mb-4">
                  {/* Size Section - Only show if size attribute exists */}
                  {sizeAttribute && (
                    <Col lg={colorAttribute ? 4 : 12}>
                      <div className="mt-3">
                        <h5 className="text-dark fw-medium">Size:</h5>
                        <div className="d-flex flex-wrap gap-2" role="group" aria-label="Size selection">
                          {(sizeAttribute.options || sizeOptions).map((size: string) => (
                            <div key={size}>
                              <input
                                type="checkbox"
                                className="btn-check"
                                id={`size-${size.toLowerCase().replace(/\s+/g, '-')}`}
                                checked={selectedSizes.includes(size)}
                                onChange={(e) => handleSizeChange(size, e.target.checked)}
                              />
                              <label
                                className="btn btn-light avatar-sm rounded d-flex justify-content-center align-items-center"
                                htmlFor={`size-${size.toLowerCase().replace(/\s+/g, '-')}`}>
                                {size}
                              </label>
                            </div>
                          ))}
                        </div>
                        {selectedSizes.length > 0 && <small className="text-muted mt-1 d-block">Selected: {selectedSizes.join(', ')}</small>}
                      </div>
                    </Col>
                  )}

                  {/* Color Section - Only show if color attribute exists */}
                  {colorAttribute && (
                    <Col lg={sizeAttribute ? 8 : 12}>
                      <div className="mt-3">
                        <h5 className="text-dark fw-medium">Colors:</h5>
                        <div className="d-flex flex-wrap gap-2" role="group" aria-label="Color selection">
                          {colorAttribute.options
                            ? // Use category-specific colors
                              colorAttribute.options.map((color: string) => (
                                <div key={color}>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id={`color-${color.toLowerCase().replace(/\s+/g, '-')}`}
                                    checked={selectedColors.includes(color)}
                                    onChange={(e) => handleColorChange(color, e.target.checked)}
                                  />
                                  <label
                                    className="btn btn-light avatar-sm rounded d-flex justify-content-center align-items-center"
                                    htmlFor={`color-${color.toLowerCase().replace(/\s+/g, '-')}`}
                                    title={color}>
                                    <span className="text-capitalize">{color}</span>
                                  </label>
                                </div>
                              ))
                            : // Use default color options with icons
                              colorOptions.map((color) => (
                                <div key={color.value}>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id={`color-${color.value}`}
                                    checked={selectedColors.includes(color.value)}
                                    onChange={(e) => handleColorChange(color.value, e.target.checked)}
                                  />
                                  <label
                                    className="btn btn-light avatar-sm rounded d-flex justify-content-center align-items-center"
                                    htmlFor={`color-${color.value}`}
                                    title={color.name}>
                                    <span>
                                      <IconifyIcon icon="bxs:circle" className={`fs-18 ${color.className}`} />
                                    </span>
                                  </label>
                                </div>
                              ))}
                        </div>
                        {selectedColors.length > 0 && (
                          <small className="text-muted mt-1 d-block">
                            Selected:{' '}
                            {selectedColors
                              .map((color) => {
                                const defaultColor = colorOptions.find((c) => c.value === color)
                                return defaultColor?.name || color
                              })
                              .join(', ')}
                          </small>
                        )}
                      </div>
                    </Col>
                  )}
                </Row>
              )
            })()}

            {/* Description Fields */}
            <Row>
              <Col lg={6} className="mb-3">
                <label>Short Description</label>
                <textarea {...register('shortDescription')} className="form-control" rows={3} placeholder="Enter short description" />
              </Col>
              <Col lg={6} className="mb-3">
                <label>
                  Full Description <span className="text-danger">*</span>
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  rows={3}
                  placeholder="Enter full description"
                />
                {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Pricing</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col>
                <label>
                  Price <span className="text-danger">*</span>
                </label>
                <input
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' },
                  })}
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                />
                {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
              </Col>
              <Col>
                <label>Original Price</label>
                <input {...register('originalPrice')} type="number" step="0.01" placeholder="Original Price" className="form-control" />
              </Col>
              <Col>
                <label>Discount</label>
                <input {...register('discount')} type="number" step="0.01" placeholder="Discount" className="form-control" />
              </Col>
              <Col>
                <label>Discount Type</label>
                <select {...register('discountType')} className="form-control">
                  <option value="">Select Type</option>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                  <option value="other">Other</option>
                </select>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Stock & Dimensions */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Stock & Dimensions</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col className="mb-3">
                <label>Stock Quantity</label>
                <input {...register('stock')} type="number" placeholder="Stock" className="form-control" />
              </Col>
              <Col className="mb-3">
                <label>Minimum Stock</label>
                <input {...register('minStock')} type="number" placeholder="Min Stock" className="form-control" />
              </Col>
              <Col className="mb-3">
                <label>Weight </label>
                <input {...register('weight')} type="number" placeholder="Weight" className="form-control" />
              </Col>
            </Row>
            <Row>
              <Col className="mb-3">
                <label>Length (cm)</label>
                <input {...register('dimensions.length')} type="number" step="0.01" placeholder="Length" className="form-control" />
              </Col>
              <Col className="mb-3">
                <label>Width (cm)</label>
                <input {...register('dimensions.width')} type="number" step="0.01" placeholder="Width" className="form-control" />
              </Col>
              <Col className="mb-3">
                <label>Height (cm)</label>
                <input {...register('dimensions.height')} type="number" step="0.01" placeholder="Height" className="form-control" />
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Shipping Info */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Shipping Information</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={3} className="mb-3">
                <label>Shipping Weight (kg)</label>
                <input {...register('shippingInfo.weight')} type="number" step="0.01" placeholder="Weight" className="form-control" />
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Product Flags */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Product Flags</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={4}>
                <div className="form-check">
                  <input type="checkbox" {...register('isFeatured')} className="form-check-input" id="isFeatured" />
                  <label className="form-check-label" htmlFor="isFeatured">
                    Featured Product
                  </label>
                </div>
              </Col>
              <Col lg={4}>
                <div className="form-check">
                  <input type="checkbox" {...register('isTrending')} className="form-check-input" id="isTrending" />
                  <label className="form-check-label" htmlFor="isTrending">
                    Trending Product
                  </label>
                </div>
              </Col>
              <Col lg={4}>
                <div className="form-check">
                  <input type="checkbox" {...register('isNewArrival')} className="form-check-input" id="isNewArrival" />
                  <label className="form-check-label" htmlFor="isNewArrival">
                    New Arrival
                  </label>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Submit */}
        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <button type="submit" className="btn btn-primary w-100" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </button>
            </Col>
            <Col lg={2}>
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => router.push('/products/product-list')}
              >
                Cancel
              </button>
            </Col>
          </Row>
        </div>
      </Col>
    </form>
  )
}

export default EditProduct
