"use client";


import { useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient';


function SignupPage() {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [confirm, setConfirm] = useState('')
const [loading, setLoading] = useState(false)


const handleSignup = async (e: React.FormEvent) => {
e.preventDefault()
if (password !== confirm) return alert('Passwords do not match')
setLoading(true)
const { error } = await supabase.auth.signUp({ email, password })
setLoading(false)
if (error) return alert(error.message)
alert('Check your email to confirm sign up')
}


return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purplecrm-50 to-white">
<form onSubmit={handleSignup} className="w-full max-w-md bg-white p-8 rounded-xl shadow-card">
<h2 className="text-2xl font-semibold mb-4 text-purplecrm-700">Create an account</h2>

