'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetCategoryTreeQuery, useGetChildrenByParentQuery } from '@/store/productCategoryApi'
import { useCreateProductMutation } from '@/store/productsApi'
import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
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
  discountType: 'percentage' | 'flat' | 'other' | ''
  sku: string
  category: string
  subcategory: string
  brand: string
  images: string[] // Changed from File[] to string[]
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
  shippingInfo: {
    weight: number
    freeShipping: boolean
    shippingCost: number
    estimatedDelivery: string
  }
  categoryAttributes?: Record<string, any> // Add this for dynamic attributes
}

const AddProduct = () => {
  const router = useRouter()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([])
  const [subcategoryAttributes, setSubcategoryAttributes] = useState<any[]>([])
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([])
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const [imageProgress, setImageProgress] = useState<number[]>([])
  const [thumbProgress, setThumbProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [imageStatus, setImageStatus] = useState<Array<'idle' | 'uploading' | 'success' | 'error' | 'canceled'>>([])
  const [imageError, setImageError] = useState<Array<string | null>>([])
  const [imageXhrs, setImageXhrs] = useState<Array<XMLHttpRequest | null>>([])
  const [imageUrlsState, setImageUrlsState] = useState<Array<string | null>>([])
  const [thumbStatus, setThumbStatus] = useState<'idle' | 'uploading' | 'success' | 'error' | 'canceled'>('idle')
  const [thumbError, setThumbError] = useState<string | null>(null)
  const [thumbXhr, setThumbXhr] = useState<XMLHttpRequest | null>(null)
  const [thumbUrlState, setThumbUrlState] = useState<string | null>(null)

  const API_BASE = 'http://localhost:8080/v1/api'
  const token = useSelector((s: IRootState) => (s as any)?.auth?.token)
  const role = useSelector((s: IRootState) => (s as any)?.auth?.user?.role)

  // Get main categories from tree (root level categories)
  const { data: categoryTree = [], isLoading: categoriesLoading, error: categoryError } = useGetCategoryTreeQuery()
  const categories = useMemo(() => (categoryTree || []).filter((cat: any) => !cat.parentId), [categoryTree])

  // Debug logs: log once after categories load to avoid render-loop spam
  const hasLoggedCategoriesRef = React.useRef(false)
  useEffect(() => {
    if (!categoriesLoading && !hasLoggedCategoriesRef.current) {
      // Uncomment if you need a single snapshot after load:
      // console.log('Category Tree:', categoryTree)
      // console.log('Categories:', categories)
      // console.log('Category error:', categoryError)
      hasLoggedCategoriesRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesLoading])

  // Get subcategories based on selected category
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useGetChildrenByParentQuery(selectedCategoryId, { skip: !selectedCategoryId })

  const [createProduct, { isLoading: isCreating, error }] = useCreateProductMutation()

  const {
    register,
    handleSubmit,
    reset,
    control,
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
      status: 'active', // Set default to active
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

  // Watch category and subcategory changes
  const watchedCategory = watch('category')
  const watchedSubcategory = watch('subcategory')
  const watchedName = watch('name')
  const watchedDescription = watch('description')
  const watchedPrice = watch('price')

  // Function to generate SKU from product name
  const generateSKU = (productName: string): string => {
    if (!productName) return ''

    // Remove special characters and convert to uppercase
    const cleanName = productName
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '') // Remove special characters
      .trim()

    // Split into words and take first letters of each word (max 3-4 words)
    const words = cleanName.split(/\s+/)
    let sku = ''

    if (words.length === 1) {
      // If single word, take first 3-4 letters
      sku = words[0].substring(0, 4)
    } else {
      // Multiple words: take first letter of each word (max 4 words)
      sku = words
        .slice(0, 4)
        .map((word) => word[0])
        .join('')
    }

    // Add a random number for uniqueness
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')

    // Add timestamp portion for more uniqueness (last 4 digits of timestamp)
    const timestamp = Date.now().toString().slice(-4)

    return `${sku}-${randomNum}-${timestamp}`
  }

  // Auto-generate SKU when product name changes
  useEffect(() => {
    if (watchedName && watchedName.trim()) {
      const generatedSKU = generateSKU(watchedName)
      setValue('sku', generatedSKU)
    } else {
      setValue('sku', '')
    }
  }, [watchedName, setValue])

  // Update selected category and get category attributes
  useEffect(() => {
    const wc = String(watchedCategory || '')
    if (wc !== selectedCategoryId) {
      setSelectedCategoryId(wc)
      // Reset subcategory only if not already empty
      if (watchedSubcategory) {
        setValue('subcategory', '')
      }

      // Get selected category's attributes
      const selectedCat = categories.find((cat: any) => cat._id === wc)

      const nextAttrs: any[] = selectedCat && Array.isArray((selectedCat as any).attributes)
        ? ((selectedCat as any).attributes as any[])
        : []
      setCategoryAttributes((prev) => {
        const sameRef = prev === nextAttrs
        const sameLen = Array.isArray(prev) && prev.length === nextAttrs.length
        const sameItems = sameLen && prev.every((v, i) => v === nextAttrs[i])
        return sameRef || sameItems ? prev : nextAttrs
      })
    }
  }, [watchedCategory, watchedSubcategory, selectedCategoryId, setValue, categories])

  // Update subcategory attributes when subcategory changes
  // Guard against redundant updates to avoid render loops when `subcategories` ref changes frequently
  useEffect(() => {
    if (watchedSubcategory) {
      const selectedSubcat = subcategories.find((cat) => cat._id === watchedSubcategory)
      const attrs: any[] = selectedSubcat && Array.isArray((selectedSubcat as any).attributes)
        ? ((selectedSubcat as any).attributes as any[])
        : []
      setSubcategoryAttributes((prev) => {
        // shallow compare by reference and by items order
        const sameRef = prev === attrs
        const sameLen = Array.isArray(prev) && prev.length === attrs.length
        const sameItems = sameLen && prev.every((v, i) => v === attrs[i])
        return sameRef || sameItems ? prev : attrs
      })
    } else {
      setSubcategoryAttributes((prev) => (Array.isArray(prev) && prev.length === 0 ? prev : []))
    }
  }, [watchedSubcategory, subcategories])

  // Update form values when selections change
  useEffect(() => {
    setValue('sizes', selectedSizes)
  }, [selectedSizes, setValue])

  // (Removed noisy debug effect)

  useEffect(() => {
    setValue('colors', selectedColors)
  }, [selectedColors, setValue])

  useEffect(() => {
    setValue('tags', selectedTags)
  }, [selectedTags, setValue])

  useEffect(() => {
    setValue('features', selectedFeatures)
  }, [selectedFeatures, setValue])

  useEffect(() => {
    setValue('seoKeywords', selectedKeywords)
  }, [selectedKeywords, setValue])

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

  // Previews and progress setup on file selection
  useEffect(() => {
    // Revoke old URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    const previews = selectedImageFiles.map((f) => URL.createObjectURL(f))
    setImagePreviews(previews)
    setImageProgress(Array(selectedImageFiles.length).fill(0))
    setImageStatus(Array(previews.length).fill('idle'))
    setImageError(Array(previews.length).fill(null))
    setImageXhrs(Array(previews.length).fill(null))
    setImageUrlsState(Array(previews.length).fill(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageFiles])

  useEffect(() => {
    if (thumbPreview) URL.revokeObjectURL(thumbPreview)
    setThumbPreview(selectedThumbnailFile ? URL.createObjectURL(selectedThumbnailFile) : null)
    setThumbProgress(0)
    setThumbStatus('idle')
    setThumbError(null)
    setThumbXhr(null)
    setThumbUrlState(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThumbnailFile])

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      if (thumbPreview) URL.revokeObjectURL(thumbPreview)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Upload helper with progress
  const uploadFileWithProgress = (file: File, onProgress: (p: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE}/upload/single`)
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      if (role) xhr.setRequestHeader('X-User-Role', String(role))
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const p = Math.round((e.loaded / e.total) * 100)
          onProgress(p)
        }
      }
      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText)
            const url = res?.data?.url || res?.url
            if (url) return resolve(url)
            return reject(new Error(res?.message || 'Upload failed'))
          }
          reject(new Error(`Upload failed (${xhr.status})`))
        } catch (e: any) {
          reject(e)
        }
      }
      xhr.onerror = () => reject(new Error('Network error during upload'))
      const fd = new FormData()
      fd.append('image', file)
      xhr.send(fd)
    })
  }

  // Helpers to immutably set array index
  const setAt = <T,>(arr: T[], idx: number, val: T): T[] => {
    const next = [...arr]
    next[idx] = val
    return next
  }

  // Upload specific image index with cancel/retry support
  const uploadImageAtIndex = (idx: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const file = selectedImageFiles[idx]
      if (!file) return reject(new Error('File not found'))
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE}/upload/single`)
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      if (role) xhr.setRequestHeader('X-User-Role', String(role))

      setImageStatus((prev) => setAt(prev, idx, 'uploading'))
      setImageError((prev) => setAt(prev, idx, null))
      setImageXhrs((prev) => setAt(prev, idx, xhr))

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const p = Math.round((e.loaded / e.total) * 100)
          setImageProgress((prev) => setAt(prev, idx, p))
        }
      }
      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText)
            const url = res?.data?.url || res?.url
            if (url) {
              setImageUrlsState((prev) => setAt(prev, idx, url))
              setImageStatus((prev) => setAt(prev, idx, 'success'))
              setImageXhrs((prev) => setAt(prev, idx, null))
              return resolve(url)
            }
            const err = new Error(res?.message || 'Upload failed')
            setImageStatus((prev) => setAt(prev, idx, 'error'))
            setImageError((prev) => setAt(prev, idx, err.message))
            return reject(err)
          }
          const err = new Error(`Upload failed (${xhr.status})`)
          setImageStatus((prev) => setAt(prev, idx, 'error'))
          setImageError((prev) => setAt(prev, idx, err.message))
          reject(err)
        } catch (e: any) {
          setImageStatus((prev) => setAt(prev, idx, 'error'))
          setImageError((prev) => setAt(prev, idx, e?.message || 'Upload failed'))
          reject(e)
        }
      }
      xhr.onerror = () => {
        const err = new Error('Network error during upload')
        setImageStatus((prev) => setAt(prev, idx, 'error'))
        setImageError((prev) => setAt(prev, idx, err.message))
        reject(err)
      }
      const fd = new FormData()
      fd.append('image', file)
      xhr.send(fd)
    })
  }

  const cancelImageUpload = (idx: number) => {
    const x = imageXhrs[idx]
    if (x) {
      x.abort()
      setImageStatus((prev) => setAt(prev, idx, 'canceled'))
      setImageError((prev) => setAt(prev, idx, 'Upload canceled'))
      setImageXhrs((prev) => setAt(prev, idx, null))
    }
  }

  const retryImageUpload = (idx: number) => {
    setImageError((prev) => setAt(prev, idx, null))
    return uploadImageAtIndex(idx)
  }

  // Thumbnail upload with cancel/retry
  const uploadThumbnail = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!selectedThumbnailFile) return reject(new Error('No thumbnail selected'))
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE}/upload/single`)
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      if (role) xhr.setRequestHeader('X-User-Role', String(role))
      setThumbStatus('uploading')
      setThumbError(null)
      setThumbXhr(xhr)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const p = Math.round((e.loaded / e.total) * 100)
          setThumbProgress(p)
        }
      }
      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText)
            const url = res?.data?.url || res?.url
            if (url) {
              setThumbUrlState(url)
              setThumbStatus('success')
              setThumbXhr(null)
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
      fd.append('image', selectedThumbnailFile)
      xhr.send(fd)
    })
  }

  const cancelThumbnailUpload = () => {
    if (thumbXhr) {
      thumbXhr.abort()
      setThumbStatus('canceled')
      setThumbError('Upload canceled')
      setThumbXhr(null)
    }
  }

  const retryThumbnailUpload = () => uploadThumbnail()

  // Remove and reorder helpers
  const removeImageAt = (idx: number) => {
    const x = imageXhrs[idx]
    if (x) x.abort()
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== idx))
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx))
    setImageProgress((prev) => prev.filter((_, i) => i !== idx))
    setImageStatus((prev) => prev.filter((_, i) => i !== idx))
    setImageError((prev) => prev.filter((_, i) => i !== idx))
    setImageXhrs((prev) => prev.filter((_, i) => i !== idx))
    setImageUrlsState((prev) => prev.filter((_, i) => i !== idx))
  }

  const swapAt = <T,>(arr: T[], i: number, j: number): T[] => {
    const next = [...arr]
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  }

  const moveLeft = (idx: number) => {
    if (idx <= 0) return
    setSelectedImageFiles((prev) => swapAt(prev, idx, idx - 1))
    setImagePreviews((prev) => swapAt(prev, idx, idx - 1))
    setImageProgress((prev) => swapAt(prev, idx, idx - 1))
    setImageStatus((prev) => swapAt(prev, idx, idx - 1))
    setImageError((prev) => swapAt(prev, idx, idx - 1))
    setImageXhrs((prev) => swapAt(prev, idx, idx - 1))
    setImageUrlsState((prev) => swapAt(prev, idx, idx - 1))
  }

  const moveRight = (idx: number) => {
    if (idx >= selectedImageFiles.length - 1) return
    setSelectedImageFiles((prev) => swapAt(prev, idx, idx + 1))
    setImagePreviews((prev) => swapAt(prev, idx, idx + 1))
    setImageProgress((prev) => swapAt(prev, idx, idx + 1))
    setImageStatus((prev) => swapAt(prev, idx, idx + 1))
    setImageError((prev) => swapAt(prev, idx, idx + 1))
    setImageXhrs((prev) => swapAt(prev, idx, idx + 1))
    setImageUrlsState((prev) => swapAt(prev, idx, idx + 1))
  }

  // Dropzone for images
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    onDrop: (acceptedFiles) => {
      if (!acceptedFiles?.length) return
      setSelectedImageFiles((prev) => [...prev, ...acceptedFiles])
    },
  })

  const isFormValid = useMemo(() => {
    const nameOk = (watchedName || '').trim().length > 0
    const descOk = (watchedDescription || '').trim().length > 0
    const catOk = Boolean(watchedCategory)
    const priceOk = Number(watchedPrice || 0) > 0
    const imagesOk = selectedImageFiles.length > 0
    const thumbOk = Boolean(selectedThumbnailFile)
    return nameOk && descOk && catOk && priceOk && imagesOk && thumbOk
  }, [watchedName, watchedDescription, watchedCategory, watchedPrice, selectedImageFiles.length, selectedThumbnailFile])

  const onSubmit = async (values: FormValues) => {
    try {
      // Validate files
      if (!selectedThumbnailFile) {
        toast?.error?.('Please select a thumbnail image')
        return
      }
      if (!selectedImageFiles || selectedImageFiles.length === 0) {
        toast?.error?.('Please select at least one product image')
        return
      }

      setIsUploading(true)
      // 1) Pre-upload images with per-file status/controls
      const imageUrls = await Promise.all(selectedImageFiles.map((_, idx) => uploadImageAtIndex(idx)))
      const thumbnailUrl = await uploadThumbnail()

      // 2) Normalize discountType to match backend ('percentage' | 'fixed')
      const normalizedDiscountType =
        values.discountType === 'flat' ? 'fixed' : values.discountType === 'percentage' ? 'percentage' : undefined

      // 3) Build specifications record from array + dynamic attributes
      const manualSpecs = Array.isArray(values.specifications)
        ? values.specifications.reduce((acc: Record<string, string>, item) => {
            if (item && item.key) acc[item.key] = String(item.value ?? '')
            return acc
          }, {})
        : {}
      const dynamicSpecs = (values as any).categoryAttributes
        ? Object.entries((values as any).categoryAttributes).reduce((acc: Record<string, string>, [k, v]) => {
            if (v !== undefined && v !== null && String(v).trim() !== '') acc[k] = String(v)
            return acc
          }, {})
        : {}
      const mergedSpecs = { ...manualSpecs, ...dynamicSpecs }
      const specsRecord = Object.keys(mergedSpecs).length > 0 ? mergedSpecs : undefined

      // 4) Clean up the data before sending
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
        ...(values.brand ? { brand: values.brand } : {}),
        images: imageUrls,
        thumbnail: thumbnailUrl,
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
        tags: selectedTags,
        features: selectedFeatures,
        specifications: specsRecord,
        status: values.status || undefined,
        isFeatured: Boolean(values.isFeatured),
        isTrending: Boolean(values.isTrending),
        isNewArrival: Boolean(values.isNewArrival),
        seoTitle: values.seoTitle || undefined,
        seoDescription: values.seoDescription || undefined,
        seoKeywords: selectedKeywords,
        shippingInfo: {
          weight: Number(values.shippingInfo?.weight) || 0,
          freeShipping: Boolean(values.shippingInfo?.freeShipping),
          shippingCost: Number(values.shippingInfo?.shippingCost) || 0,
          estimatedDelivery: values.shippingInfo?.estimatedDelivery || '',
        },
      }

      // 5) Remove empty string fields
      Object.keys(productData).forEach((key) => {
        if ((productData as any)[key] === '' || (productData as any)[key] === null) {
          delete (productData as any)[key]
        }
      })

      const result = await createProduct(productData).unwrap()
      // Success notification
      if (typeof toast !== 'undefined') {
        toast.success('Product created successfully!')
      } else {
        alert('Product created successfully!')
      }

      // Reset form
      reset()
      setSelectedSizes([])
      setSelectedColors([])
      setSelectedTags([])
      setSelectedFeatures([])
      setSelectedKeywords([])
      setSelectedCategoryId('')
      setSelectedImageFiles([])
      setSelectedThumbnailFile(null)
      setImageProgress([])
      setThumbProgress(0)
      setIsUploading(false)

      // Redirect to product list with success flag
      router.push('/products/product-list?created=1')
    } catch (err: any) {
      console.error('Error creating product:', err)

      // Error notification
      const errorMessage = err?.data?.message || err?.message || 'Failed to create product'

      if (typeof toast !== 'undefined') {
        toast.error(errorMessage)
      } else {
        alert(errorMessage)
      }
      setIsUploading(false)
    }
  }

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
        <div className="mb-3">
          <label className="form-label">Product Images</label>
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
          {imagePreviews.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-3">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="position-relative border rounded p-2 bg-light" style={{ width: 140 }}>
                  {/* Image Preview */}
                  <div className="d-flex justify-content-center mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`preview-${idx}`} className="img-thumbnail" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                  </div>
                  
                  {/* Progress Bar */}
                  {isUploading && (
                    <div className="progress mb-2" style={{ height: 4 }}>
                      <div className="progress-bar" role="progressbar" style={{ width: `${imageProgress[idx] || 0}%` }} aria-valuenow={imageProgress[idx] || 0} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                  )}
                  
                  {/* Status Text */}
                  <div className="text-center mb-2">
                    <small className={`${imageStatus[idx] === 'error' ? 'text-danger' : imageStatus[idx] === 'success' ? 'text-success' : 'text-muted'}`}>
                      {imageStatus[idx] || 'idle'}
                    </small>
                    {imageError[idx] && (
                      <div className="text-danger" style={{ fontSize: '10px' }} title={imageError[idx]}>
                        Error occurred
                      </div>
                    )}
                  </div>
                  
                  {/* Control Buttons - Two rows for better spacing */}
                  <div className="d-flex flex-column gap-1">
                    {/* Row 1: Move buttons */}
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
                        disabled={idx === imagePreviews.length - 1} 
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
                    {(imageStatus[idx] === 'uploading' || imageStatus[idx] === 'error' || imageStatus[idx] === 'canceled') && (
                      <div className="d-flex justify-content-center">
                        {imageStatus[idx] === 'uploading' ? (
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
                        ) : (imageStatus[idx] === 'error' || imageStatus[idx] === 'canceled') ? (
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
        </div>
        <div className="mb-3">
          <label className="form-label">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setSelectedThumbnailFile(e.target.files?.[0] || null)}
          />
          {thumbPreview && (
            <div className="mt-2 border rounded p-2 bg-light d-inline-block" style={{ width: 140 }}>
              {/* Thumbnail Preview */}
              <div className="d-flex justify-content-center mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbPreview} alt="thumb-preview" className="img-thumbnail" style={{ width: 100, height: 100, objectFit: 'cover' }} />
              </div>
              
              {/* Progress Bar */}
              {isUploading && (
                <div className="progress mb-2" style={{ height: 4 }}>
                  <div className="progress-bar" role="progressbar" style={{ width: `${thumbProgress}%` }} aria-valuenow={thumbProgress} aria-valuemin={0} aria-valuemax={100}></div>
                </div>
              )}
              
              {/* Status Text */}
              <div className="text-center mb-2">
                <small className={`${thumbStatus === 'error' ? 'text-danger' : thumbStatus === 'success' ? 'text-success' : 'text-muted'}`}>
                  {thumbStatus || 'idle'}
                </small>
                {thumbError && (
                  <div className="text-danger" style={{ fontSize: '10px' }} title={thumbError}>
                    Error occurred
                  </div>
                )}
              </div>
              
              {/* Control Buttons */}
              <div className="d-flex flex-column gap-1">
                {/* Remove button always visible */}
                <div className="d-flex justify-content-center">
                  <button 
                    type="button" 
                    className="btn btn-sm px-2" 
                    onClick={() => setSelectedThumbnailFile(null)} 
                    title="Remove Thumbnail"
                    style={{ width: '32px', height: '28px', border: 'none', background: 'transparent' }}
                  >
                    <IconifyIcon icon="solar:trash-bin-minimalistic-broken" className="fs-14 text-danger" />
                  </button>
                </div>
                
                {/* Action buttons (Cancel/Retry) */}
                {(thumbStatus === 'uploading' || thumbStatus === 'error' || thumbStatus === 'canceled') && (
                  <div className="d-flex justify-content-center">
                    {thumbStatus === 'uploading' ? (
                      <button 
                        type="button" 
                        className="btn btn-sm btn-warning px-3" 
                        onClick={cancelThumbnailUpload} 
                        title="Cancel Upload"
                        style={{ fontSize: '11px', height: '26px' }}
                      >
                        <IconifyIcon icon="solar:close-circle-broken" className="me-1" />
                        Cancel
                      </button>
                    ) : (thumbStatus === 'error' || thumbStatus === 'canceled') ? (
                      <button 
                        type="button" 
                        className="btn btn-sm btn-secondary px-3" 
                        onClick={retryThumbnailUpload} 
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
          )}
        </div>

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
                <label>
                  SKU <small className="text-muted">(Auto-generated)</small>
                </label>
                <div className="input-group">
                  <input {...register('sku')} className="form-control" placeholder="Enter SKU or auto-generate from name" readOnly={!!watchedName} />
                  {watchedName && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => {
                        const newSKU = generateSKU(watchedName)
                        setValue('sku', newSKU)
                      }}
                      title="Regenerate SKU">
                      <i className="bi bi-arrow-clockwise"></i> Regenerate
                    </button>
                  )}
                </div>
                <small className="text-muted">SKU is automatically generated from product name</small>
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
                  <option value="">Select Category</option>
                  {categories.map((category: any) => (
                    <option key={category._id} value={category._id}>
                      {category.title}
                    </option>
                  ))}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
                {categoriesLoading && <small className="text-muted">Loading categories...</small>}
              </Col>
              <Col lg={6} className="mb-3">
                <label>SubCategory</label>
                <select {...register('subcategory')} className="form-control" disabled={!selectedCategoryId || subcategoriesLoading}>
                  <option value="">Select SubCategory</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory._id} value={subcategory._id}>
                      {subcategory.title}
                    </option>
                  ))}
                </select>
                {subcategoriesLoading && <small className="text-muted">Loading subcategories...</small>}
                {!selectedCategoryId && <small className="text-muted">Please select a category first</small>}
              </Col>
            </Row>

            {/* Dynamic Category Attributes */}
            {categoryAttributes && categoryAttributes.length > 0 && (
              <Row>
                <Col lg={12}>
                  <h5 className="mt-3 mb-3">Category Specific Attributes</h5>
                  <small className="text-muted">Found {categoryAttributes.length} attributes</small>
                </Col>
                {categoryAttributes.map((attribute, index) => {
                  // Skip if it's sizes or colors (handled separately)
                  if (
                    attribute.name.toLowerCase() === 'size' ||
                    attribute.name.toLowerCase() === 'sizes' ||
                    attribute.name.toLowerCase() === 'color' ||
                    attribute.name.toLowerCase() === 'colors'
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
            {subcategoryAttributes.length > 0 && (
              <Row>
                <Col lg={12}>
                  <h5 className="mt-3 mb-3">Subcategory Specific Attributes</h5>
                </Col>
                {subcategoryAttributes.map((attribute, index) => {
                  // Skip if it's sizes or colors (handled separately)
                  if (
                    attribute.name.toLowerCase() === 'size' ||
                    attribute.name.toLowerCase() === 'sizes' ||
                    attribute.name.toLowerCase() === 'color' ||
                    attribute.name.toLowerCase() === 'colors'
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
              // Check if category or subcategory has size/color attributes
              const sizeAttribute = [...categoryAttributes, ...subcategoryAttributes].find(
                (attr) => attr.name && (attr.name.toLowerCase() === 'size' || attr.name.toLowerCase() === 'sizes'),
              )
              const colorAttribute = [...categoryAttributes, ...subcategoryAttributes].find(
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
                <label>Weight (grams)</label>
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

        {/* Tags & Features */}
        {/* <Card>
          <CardHeader>
            <CardTitle as="h4">Tags & Features</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col className="mb-3">
                <label>Product Tags</label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="product-tags"
                      data-choices
                      data-choices-removeitem
                      options={{ removeItemButton: true }}
                      multiple
                      onChange={(e: any) => {
                        const values = Array.from(e.target.selectedOptions, (option: any) => option.value)
                        setSelectedTags(values)
                        field.onChange(values)
                      }}>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="accessories">Accessories</option>
                      <option value="new">New</option>
                    </ChoicesFormInput>
                  )}
                />
              </Col>
              <Col className="mb-3">
                <label>Product Features</label>
                <Controller
                  name="features"
                  control={control}
                  render={({ field }) => (
                    <ChoicesFormInput
                      {...field}
                      className="form-control"
                      id="product-features"
                      data-choices
                      data-choices-removeitem
                      options={{ removeItemButton: true }}
                      multiple
                      onChange={(e: any) => {
                        const values = Array.from(e.target.selectedOptions, (option: any) => option.value)
                        setSelectedFeatures(values)
                        field.onChange(values)
                      }}>
                      <option value="waterproof">Waterproof</option>
                      <option value="wireless">Wireless</option>
                      <option value="durable">Durable</option>
                      <option value="lightweight">Lightweight</option>
                    </ChoicesFormInput>
                  )}
                />
              </Col>
            </Row>
          </CardBody>
        </Card> */}

        {/* SEO */}
        {/* <Card>
          <CardHeader>
            <CardTitle as="h4">SEO Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-3">
              <label>SEO Title</label>
              <input {...register('seoTitle')} placeholder="SEO Title" className="form-control" />
            </div>
            <div className="mb-3">
              <label>SEO Description</label>
              <textarea {...register('seoDescription')} placeholder="SEO Description" className="form-control" rows={3} />
            </div>
            <div className="mb-3">
              <label>SEO Keywords</label>
              <Controller
                name="seoKeywords"
                control={control}
                render={({ field }) => (
                  <ChoicesFormInput
                    {...field}
                    className="form-control"
                    id="seo-keywords"
                    data-choices
                    data-choices-removeitem
                    options={{ removeItemButton: true }}
                    multiple
                    onChange={(e: any) => {
                      const values = Array.from(e.target.selectedOptions, (option: any) => option.value)
                      setSelectedKeywords(values)
                      field.onChange(values)
                    }}>
                    <option value="keyword1">Keyword 1</option>
                    <option value="keyword2">Keyword 2</option>
                    <option value="keyword3">Keyword 3</option>
                  </ChoicesFormInput>
                )}
              />
            </div>
          </CardBody>
        </Card> */}
        {/* Vendor Info removed as per requirement */}

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
              <Col lg={3} className="mb-3">
                <label>Shipping Cost</label>
                <input {...register('shippingInfo.shippingCost')} type="number" step="0.01" placeholder="Cost" className="form-control" />
              </Col>
              <Col lg={3} className="mb-3">
                <label>Estimated Delivery</label>
                <input {...register('shippingInfo.estimatedDelivery')} placeholder="e.g., 3-5 days" className="form-control" />
              </Col>
              <Col lg={3} className="mb-3">
                <div className="mt-4">
                  <div className="form-check">
                    <input type="checkbox" {...register('shippingInfo.freeShipping')} className="form-check-input" id="freeShipping" />
                    <label className="form-check-label" htmlFor="freeShipping">
                      Free Shipping
                    </label>
                  </div>
                </div>
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
              <button type="submit" className="btn btn-primary w-100" disabled={isCreating || isUploading || !isFormValid}>
                {isCreating || isUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isUploading ? 'Uploading...' : 'Creating...'}
                  </>
                ) : (
                  'Create Product'
                )}
              </button>
            </Col>
            <Col lg={2}>
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  reset()
                  setSelectedSizes([])
                  setSelectedColors([])
                  setSelectedTags([])
                  setSelectedFeatures([])
                  setSelectedKeywords([])
                  setSelectedCategoryId('')
                }}>
                Reset Form
              </button>
            </Col>
          </Row>

          {/* Error display */}
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              <strong>Error:</strong> {(error as any)?.data?.message || 'Failed to create product'}
            </div>
          )}
        </div>
      </Col>
    </form>
  )
}

export default AddProduct
