'use client'
import Flatpickr from 'react-flatpickr'

type FlatpickrProps = {
  className?: string
  value?: any
  options?: any
  placeholder?: string
  name?: string
  onChange?: (value: any) => void
  onBlur?: () => void
}

const CustomFlatpickr = ({ className, value, options, placeholder, name, onChange, onBlur }: FlatpickrProps) => {
  return (
    <Flatpickr
      className={className}
      value={value}
      options={options}
      placeholder={placeholder}
      onChange={(selectedDates: Date[], dateStr: string) => {
        // For single-date picker we use first date
        const v = Array.isArray(selectedDates) ? selectedDates[0] : (selectedDates as any)
        onChange?.(v || null)
      }}
      onClose={() => onBlur?.()}
      data-enable-time={!!options?.enableTime}
      name={name}
    />
  )
}

export default CustomFlatpickr
