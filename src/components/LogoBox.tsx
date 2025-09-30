import logo from '@/assets/images/logo.png'
import Image from 'next/image'
import Link from 'next/link'

const LogoBox = () => {
  return (
    <div className="logo-box">
      {/* Dark Logo */}
      <Link href="/" className="logo-dark" aria-label="Home">
        <span className="logo-sm">
          <Image src={logo} width={28} height={26} alt="Small Dark Logo" />
        </span>
        <span className="logo-lg object-cover">
          <Image src={logo} width={60} height={60} alt="Large Dark Logo" />
        </span>
      </Link>

      {/* Light Logo */}
      <Link href="/" className="logo-light" aria-label="Home">
        <span className="logo-sm">
          <Image src={logo} width={28} height={26} alt="Small Light Logo" />
        </span>
        <span className="logo-lg object-cover">
          <Image src={logo} width={60} height={60} alt="Large Light Logo" />
        </span>
      </Link>
    </div>
  )
}

export default LogoBox
