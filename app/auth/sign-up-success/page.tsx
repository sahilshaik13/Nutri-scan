import { Leaf, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const neu = { raised: '8px 8px 20px #c4ccc5, -8px -8px 20px #ffffff', sm: '4px 4px 10px #c4ccc5, -4px -4px 10px #ffffff' }

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6" style={{ background: '#eaf0eb' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
            <Leaf className="h-7 w-7 text-[#3ecf66]" />
          </div>
          <span className="text-xl font-black text-[#1a231b]">NutriScan</span>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 text-center" style={{ background: '#eaf0eb', boxShadow: neu.raised }}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: '#eaf0eb', boxShadow: 'inset 4px 4px 10px #c4ccc5, inset -4px -4px 10px #ffffff' }}>
            <Mail className="h-7 w-7 text-[#3ecf66]" />
          </div>
          <h1 className="mb-2 text-2xl font-black text-[#1a231b]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Check your email
          </h1>
          <p className="mb-2 text-sm font-semibold text-[#6b7e6d]">We&apos;ve sent you a confirmation link</p>
          <p className="mb-8 text-sm leading-relaxed text-[#6b7e6d]">
            Click the link in your email to activate your account and start scanning food for nutrition insights.
          </p>
          <Link href="/"
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-[#6b7e6d] transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: '#eaf0eb', boxShadow: neu.sm }}>
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}