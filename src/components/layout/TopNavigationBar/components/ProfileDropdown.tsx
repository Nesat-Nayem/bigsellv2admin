'use client'

import avatar1 from '@/assets/images/users/avatar-1.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useAppDispatch } from '@/hooks'
import { logout } from '@/store/authSlice'
import { authService } from '@/services/authService'
import { useRouter } from 'next/navigation'

const ProfileDropdown = () => {
  const dispatch = useAppDispatch()
  const { push } = useRouter()

  const handleLogout = () => {
    dispatch(logout())
    authService.removeToken()
    push('/auth/sign-in')
  }

  return (
    <Dropdown className="topbar-item">
      <DropdownToggle
        as={'a'}
        type="button"
        className="topbar-button content-none"
        id="page-header-user-dropdown "
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <span className="d-flex align-items-center">
          <Image className="rounded-circle" width={32} src={avatar1} alt="avatar-3" />
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end">
        <DropdownHeader as={'h6'} className="dropdown-header">
          Welcome Big Sell!
        </DropdownHeader>

        <div className="dropdown-divider my-1" />
        <DropdownItem as="button" type="button" className=" text-danger" onClick={handleLogout}>
          <IconifyIcon icon="bx:log-out" className="fs-18 align-middle me-1" />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ProfileDropdown
