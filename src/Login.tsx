import { useState, useRef, useEffect } from 'react'
import { EyeIcon, EyeSlashIcon, ArrowRightIcon, CheckCircleIcon, EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import logoLightBrand from './assets/logo-light-brand.png'
import logoDarkBrand from './assets/logo-dark-brand.png'
import { useAuth } from './context/AuthContext'
import { validatePassword, getDomainError, isAllowedDomain } from './lib/auth-utils'
import type { PasswordValidation } from './lib/auth-utils'
import { useToast, ToastContainer } from './components/AuthToast'

type ViewMode = 'login' | 'register' | 'forgot-password';

export default function Login() {
    const { signIn, signUp, signInWithMicrosoft, resetPassword, clearError } = useAuth()
    const { toasts, addToast, dismissToast } = useToast()

    const [viewMode, setViewMode] = useState<ViewMode>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [domainError, setDomainError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>(
        validatePassword('')
    )

    const emailInputRef = useRef<HTMLInputElement>(null)

    // Reset state when switching views
    useEffect(() => {
        setSuccessMessage(null)
        setDomainError(null)
        clearError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode])

    // Real-time password validation
    const handlePasswordChange = (value: string) => {
        setPassword(value)
        setPasswordValidation(validatePassword(value))
    }

    // Domain validation on blur
    const handleEmailBlur = () => {
        if (email && email.includes('@')) {
            const error = getDomainError(email)
            setDomainError(error)
        } else {
            setDomainError(null)
        }
    }

    const handleEmailChange = (value: string) => {
        setEmail(value)
        if (domainError) {
            setDomainError(null)
        }
    }

    // --- Handlers ---

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const result = await signIn(email, password)
        setIsSubmitting(false)

        if (!result.success) {
            addToast('error', result.error ?? 'Login failed')
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!fullName.trim()) {
            addToast('error', 'Full name is required.')
            return
        }

        const domainErr = getDomainError(email)
        if (domainErr) {
            addToast('error', domainErr)
            return
        }

        if (!passwordValidation.isValid) {
            addToast('error', 'Please meet all password requirements.')
            return
        }

        setIsSubmitting(true)
        const result = await signUp(email, password, fullName.trim())
        setIsSubmitting(false)

        if (!result.success) {
            addToast('error', result.error ?? 'Registration failed')
        } else if (result.needsVerification) {
            setSuccessMessage('Account created! Please check your email to verify your account before logging in.')
            addToast('success', 'Account created! Check your email to verify your account.')
        }
    }

    const handleMicrosoftLogin = async () => {
        setIsSubmitting(true)
        const result = await signInWithMicrosoft()
        setIsSubmitting(false)
        if (!result.success) {
            addToast('error', result.error ?? 'Microsoft login failed')
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            addToast('error', 'Please enter your email address.')
            return
        }

        if (!isAllowedDomain(email)) {
            addToast('error', 'Access is restricted to authorized organization emails only.')
            return
        }

        setIsSubmitting(true)
        const result = await resetPassword(email)
        setIsSubmitting(false)

        if (!result.success) {
            addToast('error', result.error ?? 'Failed to send reset email')
        } else {
            setSuccessMessage('Password reset email sent! Check your inbox for the reset link.')
            addToast('success', 'Password reset email sent! Check your inbox.')
        }
    }

    const switchView = (mode: ViewMode) => {
        setViewMode(mode)
        setPassword('')
        setFullName('')
        setShowPassword(false)
        setPasswordValidation(validatePassword(''))
    }

    // --- Password Requirement Item ---
    const PasswordCheck = ({ met, label }: { met: boolean; label: string }) => (
        <li className="flex items-center gap-2">
            {met ? (
                <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-3 h-3 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            <span className={met ? 'text-green-400' : 'text-zinc-500'}>{label}</span>
        </li>
    )

    // --- Spinner Component ---
    const Spinner = () => (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    )

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-background transition-colors duration-300">
            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />

            {/* Left Side - Branding */}
            <div className="relative overflow-hidden flex flex-col justify-center p-12 lg:p-20 bg-sidebar text-sidebar-foreground transition-colors duration-300">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sidebar-accent/50 to-sidebar/50 pointer-events-none" />

                <div className="relative z-10 max-w-lg space-y-8">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="mb-4">
                            <img src={logoLightBrand} alt="Strata" className="h-20 w-auto block dark:hidden" />
                            <img src={logoDarkBrand} alt="Strata" className="h-20 w-auto hidden dark:block" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-brand font-bold leading-tight text-sidebar-foreground">
                        Transform your workflow with Strata
                    </h1>

                    <p className="text-sidebar-foreground/70 text-lg leading-relaxed">
                        At Strata, we provide comprehensive solutions for contract dealers and manufacturers, combining sales enablement, financial services, and expert consulting with cutting-edge technology to optimize operations and drive business growth.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2">
                            Talk to an Expert <ArrowRightIcon className="w-4 h-4" />
                        </button>
                        <button className="px-6 py-3 bg-transparent text-sidebar-foreground font-semibold rounded-full hover:bg-sidebar-accent transition-colors border border-sidebar-border">
                            Browse all Services
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 relative overflow-hidden bg-[url('/login-bg.jpg')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

                <div className="w-full max-w-[440px] p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 transition-all duration-300">
                    <div className="space-y-6">

                        {/* Success Message */}
                        {successMessage ? (
                            <div className="space-y-6 text-center">
                                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircleIcon className="w-8 h-8 text-green-400" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{successMessage}</p>
                                </div>
                                <button
                                    onClick={() => { setSuccessMessage(null); switchView('login') }}
                                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowLeftIcon className="w-4 h-4" />
                                    Back to Login
                                </button>
                            </div>
                        ) : viewMode === 'forgot-password' ? (
                            /* Forgot Password View */
                            <div className="space-y-6">
                                <div className="space-y-2 text-center lg:text-left">
                                    <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                                    <p className="text-sm text-zinc-300">Enter your email and we'll send you a link to reset your password.</p>
                                </div>

                                <form className="space-y-4" onSubmit={handleForgotPassword}>
                                    <div>
                                        <label className="text-zinc-200 text-sm font-medium mb-1 block">Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => handleEmailChange(e.target.value)}
                                                onBlur={handleEmailBlur}
                                                placeholder="you@company.com"
                                                className="w-full bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-0 rounded-lg h-12 px-4 pl-10 placeholder:text-zinc-500 outline-none transition-colors"
                                            />
                                            <EnvelopeIcon className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-lg shadow-black/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Spinner /> : 'Send Reset Link'}
                                    </button>
                                </form>

                                <div className="text-center">
                                    <button
                                        onClick={() => switchView('login')}
                                        className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1 mx-auto"
                                    >
                                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                                        Back to Login
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Login / Register View */
                            <>
                                <div className="space-y-2 text-center lg:text-left">
                                    <h2 className="text-3xl font-bold text-white">
                                        {viewMode === 'register' ? 'Create Account' : 'Welcome Back!'}
                                    </h2>
                                    <div className="flex flex-wrap gap-1 text-sm text-zinc-200 justify-center lg:justify-start">
                                        <span>{viewMode === 'register' ? 'Already have an account?' : "Don't have an account?"}</span>
                                        <button
                                            onClick={() => switchView(viewMode === 'register' ? 'login' : 'register')}
                                            className="font-medium text-white hover:underline decoration-white/50 underline-offset-4"
                                        >
                                            {viewMode === 'register' ? 'Login now' : 'Create a new account now,'}
                                        </button>
                                        {viewMode === 'login' && <span>it's FREE! Takes less than a minute.</span>}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {viewMode === 'login' && (
                                        <>
                                            <button
                                                onClick={handleMicrosoftLogin}
                                                disabled={isSubmitting}
                                                className="w-full h-12 flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><path fill="#f25022" d="M1 1h9v9H1z" /><path fill="#7fba00" d="M11 1h9v9h-9z" /><path fill="#00a4ef" d="M1 11h9v9H1z" /><path fill="#ffb900" d="M11 11h9v9h-9z" /></svg>
                                                Login with Microsoft
                                            </button>

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <span className="w-full border-t border-white/20" />
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-transparent px-2 text-zinc-300 font-medium tracking-wider">Or login with email</span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <form className="space-y-4" onSubmit={viewMode === 'register' ? handleRegister : handleLogin}>
                                        {/* Full Name (Register only) */}
                                        {viewMode === 'register' && (
                                            <div>
                                                <label className="text-zinc-200 text-sm font-medium mb-1 block">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="John Doe"
                                                    className="w-full bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-0 rounded-lg h-12 px-4 placeholder:text-zinc-500 outline-none transition-colors"
                                                />
                                            </div>
                                        )}

                                        {/* Email */}
                                        <div>
                                            <label className="text-zinc-200 text-sm font-medium mb-1 block">
                                                {viewMode === 'register' ? 'Work Email' : 'Email'}
                                            </label>
                                            <input
                                                ref={emailInputRef}
                                                type="email"
                                                value={email}
                                                onChange={(e) => handleEmailChange(e.target.value)}
                                                onBlur={handleEmailBlur}
                                                placeholder="you@company.com"
                                                className={`w-full bg-white/10 border text-white focus:border-white/40 focus:ring-0 rounded-lg h-12 px-4 placeholder:text-zinc-500 outline-none transition-colors ${
                                                    domainError ? 'border-red-500/50' : 'border-white/20'
                                                }`}
                                            />
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Access restricted to @agenticdream.com and @goavanto.com
                                            </p>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label className="text-zinc-200 text-sm font-medium mb-1 block">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                                    placeholder="Enter your password"
                                                    className="w-full bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-0 rounded-lg h-12 px-4 pr-10 placeholder:text-zinc-500 outline-none transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3.5 text-zinc-300 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Password Requirements (Register only) */}
                                        {viewMode === 'register' && (
                                            <div className={`rounded-lg p-4 border ${
                                                passwordValidation.isValid
                                                    ? 'bg-green-500/10 border-green-500/20'
                                                    : 'bg-white/5 border-white/10'
                                            }`}>
                                                <div className="text-xs">
                                                    <p className={`font-medium mb-2 ${passwordValidation.isValid ? 'text-green-200' : 'text-zinc-300'}`}>
                                                        Password requirements:
                                                    </p>
                                                    <ul className="space-y-1 ml-1">
                                                        <PasswordCheck met={passwordValidation.hasMinLength} label="Minimum 8 characters" />
                                                        <PasswordCheck met={passwordValidation.hasUppercase} label="At least one uppercase letter" />
                                                        <PasswordCheck met={passwordValidation.hasNumber} label="At least one number" />
                                                        <PasswordCheck met={passwordValidation.hasSpecialChar} label="At least one special character" />
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-lg shadow-black/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <Spinner />
                                            ) : (
                                                viewMode === 'register' ? 'Create Account' : 'Login Now'
                                            )}
                                        </button>
                                    </form>

                                    {/* Forgot Password Link */}
                                    {viewMode === 'login' && (
                                        <div className="text-center">
                                            <button
                                                onClick={() => switchView('forgot-password')}
                                                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                                            >
                                                Forget password? <span className="text-white underline decoration-zinc-400 underline-offset-4">Click here</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
