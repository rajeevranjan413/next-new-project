'use client';

import React, { useState } from 'react';
import SectionLayout from '../Layout/SectionLayout';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        countryCode: '+1',
        phone: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted:', formData);
    };

    return (
        <section className=" bg-white">
            <SectionLayout>
                <div className="max-w-2xl mx-auto">
                    
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-semibold text-[#1a1c3d] mb-4">
                            Get in <span className="text-blue-600">Touch</span>
                        </h2>
                        <p className="text-slate-500 text-lg">
                            Have questions about getting your crypto card? We're here to help.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50 p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
                        
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                                Phone Number
                            </label>
                            <div className="flex gap-2">
                                {/* Country Code Dropdown */}
                                <select
                                    name="countryCode"
                                    value={formData.countryCode}
                                    onChange={handleChange}
                                    className="w-24 px-3 py-3 rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none"
                                >
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+61">🇦🇺 +61</option>
                                    <option value="+49">🇩🇪 +49</option>
                                    <option value="+91">🇮🇳 +91</option>
                                    <option value="+971">🇦🇪 +971</option>
                                    {/* Add more country codes as needed */}
                                </select>
                                
                                {/* Phone Number Input */}
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(555) 000-0000"
                                    required
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full mt-4 py-4 px-6 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                        >
                            Contact Us
                        </button>
                    </form>
                    
                </div>
            </SectionLayout>
        </section>
    );
};

export default ContactSection;