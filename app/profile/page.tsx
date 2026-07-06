"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";
import { formatNaira, convertFromKobo } from "@/lib/utils";
import { UserDashboardLayout } from "@/components/UserDashboardNav";

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  profile: {
    bio: string;
    walletBalance: number;
    totalSpent: number;
    gamesPurchased: number;
    country: string;
    phoneNumber: string;
    whatsappNumber: string;
    preferredDeliveryMethod: string;
  };
}

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat" as const,
  backgroundPosition: "right 0.75rem center",
  backgroundSize: "1rem",
};

const inputCls =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-900 focus:outline-none transition-colors disabled:opacity-50";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const { success, error: toastError } = useToast();

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [country, setCountry] = useState("NG");
  const [preferredDeliveryMethod, setPreferredDeliveryMethod] = useState("digital");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?next=/profile");
      return;
    }
    if (user) {
      fetch("/api/users/profile")
        .then((r) => r.json())
        .then((data) => {
          const p = data.data;
          setProfileData(p);
          setName(p.name || "");
          setBio(p.profile.bio || "");
          setPhoneNumber(p.profile.phoneNumber || "");
          setWhatsappNumber(p.profile.whatsappNumber || "");
          setCountry(p.profile.country || "NG");
          setPreferredDeliveryMethod(p.profile.preferredDeliveryMethod || "digital");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, phoneNumber, whatsappNumber, country, preferredDeliveryMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || "Failed to update profile");
      setProfileData(data.data);
      success("Profile updated successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <UserDashboardLayout title="Profile" subtitle="Manage your personal information">
        <div className="flex items-center justify-center py-20">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900 animate-spin" />
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout title="Profile" subtitle="Manage your personal information">
      <div className="space-y-4">

        {/* Stats row */}
        {profileData && (
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Wallet Balance",
                value: formatNaira(convertFromKobo(profileData.profile.walletBalance)),
                href: "/wallet",
                cta: "Manage wallet",
              },
              {
                label: "Total Spent",
                value: formatNaira(convertFromKobo(profileData.profile.totalSpent)),
                href: "/orders",
                cta: "View orders",
              },
              {
                label: "Games Purchased",
                value: `${profileData.profile.gamesPurchased} titles`,
                href: "/library",
                cta: "Browse library",
              },
            ].map(({ label, value, href, cta }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">{label}</p>
                <p className="text-xl font-bold text-gray-900 mb-3">{value}</p>
                <Link href={href} className="text-xs text-gray-400 hover:text-gray-900 font-semibold transition-colors inline-flex items-center gap-1">
                  {cta} <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Form card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
            <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Personal Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">Update your personal information</p>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-5 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-gray-400">*</span></label>
                  <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)} disabled={saving} className={inputCls} placeholder="Your full name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <input type="text" id="email" disabled value={profileData?.email || ""} className={`${inputCls} pr-9 cursor-not-allowed opacity-60`} />
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">Email address cannot be changed</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input type="text" id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={saving} className={inputCls} placeholder="08012345678" />
                </div>
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <input type="text" id="whatsapp" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} disabled={saving} className={inputCls} placeholder="8012345678" />
                  <p className="mt-1.5 text-xs text-gray-400">Exclude country code (e.g. 234)</p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Preferences</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} disabled={saving} className={`${inputCls} appearance-none pr-9`} style={selectStyle}>
                    <option value="NG">🇳🇬 Nigeria</option>
                    <option value="GH">🇬🇭 Ghana</option>
                    <option value="KE">🇰🇪 Kenya</option>
                    <option value="US">🇺🇸 United States</option>
                    <option value="UK">🇬🇧 United Kingdom</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="delivery" className="block text-sm font-medium text-gray-700 mb-2">Preferred Delivery</label>
                  <select id="delivery" value={preferredDeliveryMethod} onChange={(e) => setPreferredDeliveryMethod(e.target.value)} disabled={saving} className={`${inputCls} appearance-none pr-9`} style={selectStyle}>
                    <option value="digital">📧 Digital Delivery</option>
                    <option value="home">🚚 Home Delivery</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">About You</p>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} disabled={saving} placeholder="Tell us about your gaming preferences, favourite genres, platforms..." className={`${inputCls} resize-none`} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">Fields marked * are required</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2">
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Account info strip */}
        {profileData && (
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Account Status</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-700">Active</span>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">User ID</p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">{profileData.id.slice(0, 16)}...</p>
              </div>
            </div>
            <Link href="/support" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
              Need help?
            </Link>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}