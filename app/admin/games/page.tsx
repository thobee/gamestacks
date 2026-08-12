"use client";

import { useEffect, useState, useCallback, useRef, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { formatNaira, calcDiscountPercentage } from "@/lib/utils";
import { FileUpload, FileUploadItem } from "@/components/FileUpload";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import {
  CATALOG_GENRES,
  CATALOG_CATEGORIES,
  CATALOG_ITEM_TYPES,
  DEFAULT_CATEGORY_BY_ITEM_TYPE,
  type CatalogItemType,
} from "@/lib/catalog";

interface Game {
  id: string;
  title: string;
  price_naira: number;
  sale_price?: number | null;
  discountPercentage?: number;
  discount_percentage?: number;
  category: string;
  item_type?: string;
  is_published: boolean;
  rating: number | null;
  created_at: string;
}

interface NewGame {
  title: string;
  description: string;
  longDescription: string;
  price_naira: string;
  sale_price: string;
  category: string;
  itemType: string;
  platform: string;
  platformNote: string;
  deliveryType: string;
  region: string;
  genres: string[];
  image_url: string;
  download_url: string;
  is_published: boolean;
  isFeatured: boolean;
  editorsChoice: boolean;
  comingSoon: boolean;
  staffPick: boolean;
  weekendDeal: boolean;
  isOffline: boolean;
  isNew: boolean;

  systemRequirementsCpu: string;
  systemRequirementsRam: string;
  systemRequirementsGpu: string;
  systemRequirementsStorage: string;
  systemRequirementsOs: string;
  fileSizeGb: string;
  screenshotsUrls: string[];
  videoPreviewUrl: string;
}

const EMPTY_FORM: NewGame = {
  title: "",
  description: "",
  longDescription: "",
  price_naira: "",
  sale_price: "",
  category: "PC",
  itemType: "game",
  platform: "",
  platformNote: "",
  deliveryType: "",
  region: "",
  genres: [],
  image_url: "",
  download_url: "",
  is_published: false,
  isFeatured: false,
  editorsChoice: false,
  comingSoon: false,
  staffPick: false,
  weekendDeal: false,
  isOffline: false,
  isNew: false,
  systemRequirementsCpu: "",
  systemRequirementsRam: "",
  systemRequirementsGpu: "",
  systemRequirementsStorage: "",
  systemRequirementsOs: "",
  fileSizeGb: "",
  screenshotsUrls: [],
  videoPreviewUrl: "",
};

/* ── Platform options with inline SVG logos ── */
const PLATFORMS: { id: string; label: string; icon: ReactNode }[] = [
  {
    id: "PC",
    label: "PC",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M4 2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v12h16V4H4zm4 14v2H6v-2h2zm4 0v2h-2v-2h2zm4 0v2h-2v-2h2z" />
      </svg>
    ),
  },
  {
    id: "Steam",
    label: "Steam",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z" />
      </svg>
    ),
  },
  {
    id: "PS4",
    label: "PS4",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M8.985 2.596v17.548l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.76.814.76 1.505v5.876c2.441 1.193 4.362-.001 4.362-3.039 0-3.091-1.046-4.485-4.057-5.501L8.985 2.596zM2.963 17.473C1.19 18.033 1 19.099 1.99 19.683c1.073.628 2.726.468 3.798-.166l2.669-1.698-2.626-.838-2.868.492zm16.02.619c.848-.483.742-1.295-.302-1.608l-4.055-.958-1.202.765c1.268.451 2.429.905 2.429 1.906 0 .952-.92 1.507-2.168 1.857l5.298-1.962z" />
      </svg>
    ),
  },
  {
    id: "PS5",
    label: "PS5",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M8.985 2.596v17.548l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.76.814.76 1.505v5.876c2.441 1.193 4.362-.001 4.362-3.039 0-3.091-1.046-4.485-4.057-5.501L8.985 2.596zM2.963 17.473C1.19 18.033 1 19.099 1.99 19.683c1.073.628 2.726.468 3.798-.166l2.669-1.698-2.626-.838-2.868.492zm16.02.619c.848-.483.742-1.295-.302-1.608l-4.055-.958-1.202.765c1.268.451 2.429.905 2.429 1.906 0 .952-.92 1.507-2.168 1.857l5.298-1.962z" />
      </svg>
    ),
  },
  {
    id: "Xbox",
    label: "Xbox",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M4.102 5.481C2.781 6.842 2 8.623 2 10.5c0 3.534 2.346 6.513 5.59 7.608L12.5 12.5 7.51 6.5c-.888.88-2.136 1.5-3.408-1.019zm15.796 0C18.624 8 17.388 7.38 16.49 6.5L11.5 12.5l4.91 5.608C19.654 17.013 22 14.034 22 10.5c0-1.877-.781-3.658-2.102-5.019zM12 2c-1.798 0-3.526.57-4.99 1.61C8.232 4.8 9.85 6.2 11.5 8.2c.167.2.333.4.5.6.167-.2.333-.4.5-.6 1.65-2 3.268-3.4 4.49-4.59C15.526 2.57 13.798 2 12 2z" />
      </svg>
    ),
  },
  {
    id: "Nintendo Switch",
    label: "Switch",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M6.5 2C4.57 2 3 3.57 3 5.5v13C3 20.43 4.57 22 6.5 22h2V2h-2zm9 0v20h2c1.93 0 3.5-1.57 3.5-3.5v-13C21 3.57 19.43 2 17.5 2h-2zM7.5 15.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9-6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
      </svg>
    ),
  },
];

const CATEGORIES = [...CATALOG_CATEGORIES];

const ITEM_TYPES = CATALOG_ITEM_TYPES.map((t) => ({
  value: t.value,
  label: t.label,
  desc: t.desc,
}));

const GENRES = [...CATALOG_GENRES];

/** Soft-normalize optional link fields (add https, extract iframe src). */
function normalizeOptionalUrl(raw: string): string {
  let value = raw.trim();
  if (!value) return "";

  // Pasted iframe / HTML — pull the src
  const iframeSrc = value.match(/src=["']([^"']+)["']/i);
  if (iframeSrc?.[1]) value = iframeSrc[1].trim();

  // Protocol-relative or missing scheme
  if (value.startsWith("//")) value = `https:${value}`;
  else if (!/^https?:\/\//i.test(value) && /^[\w.-]+\.[\w.-]+/.test(value)) {
    value = `https://${value}`;
  }

  return value;
}

/** Prefer a clean YouTube watch URL when we can extract an ID. */
function normalizeVideoUrl(raw: string): string {
  const value = normalizeOptionalUrl(raw);
  if (!value) return "";

  const idMatch = value.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
  );
  if (idMatch?.[1]) {
    return `https://www.youtube.com/watch?v=${idMatch[1]}`;
  }

  return value;
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewGame>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const uploadRequestsRef = useRef<{ [id: string]: XMLHttpRequest }>({});

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importingCsv, setImportingCsv] = useState(false);
  const [seedingMockData, setSeedingMockData] = useState(false);

  const fetchGames = async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/games?limit=50${q ? `&search=${encodeURIComponent(q)}` : ""}`,
      );
      const json = await res.json();
      if (json.error) setError(json.error.message);
      else setGames(json.data || []);
    } catch {
      setError("Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGames(search);
  };

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setFormError("");
    setUploadItems([]);
    setUploadedImageUrls([]);
    setShowForm(true);
  };

  const openEdit = async (game: Game) => {
    setFormError("");
    setUploadItems([]);
    setUploadedImageUrls([]);
    setEditId(game.id);
    const res = await fetch(`/api/admin/games/${game.id}`);
    const json = await res.json();
    if (json.data) {
      const d = json.data;
      setForm({
        title: d.title || "",
        description: d.description || "",
        longDescription: d.longDescription || d.long_description || "",
        price_naira: String(d.price_naira || d.priceNaira || ""),
        sale_price: d.salePrice != null ? String(d.salePrice) : "",
        category: d.category || "",
        itemType: d.itemType || d.item_type || "game",
        platform: d.platform || "",
        platformNote: d.platformNote || d.platform_note || "",
        deliveryType: d.deliveryType || d.delivery_type || "",
        region: d.region || "",
        genres: Array.isArray(d.genres) ? d.genres : [],
        image_url: d.coverImageUrl || d.cover_image_url || d.image_url || "",
        download_url: d.downloadLink || d.download_link || d.download_url || "",
        is_published: d.isPublished ?? d.is_published ?? false,
        isFeatured: d.isFeatured ?? d.is_featured ?? false,
        editorsChoice: d.editorsChoice ?? d.editors_choice ?? false,
        comingSoon: d.comingSoon ?? d.coming_soon ?? false,
        staffPick: d.staffPick ?? d.staff_pick ?? false,
        weekendDeal: d.weekendDeal ?? d.weekend_deal ?? false,
        isOffline: d.isOffline ?? d.is_offline ?? false,
        isNew: d.isNew ?? d.is_new ?? false,
        systemRequirementsCpu:
          d.systemRequirementsCpu || d.system_requirements_cpu || "",
        systemRequirementsRam:
          d.systemRequirementsRam || d.system_requirements_ram || "",
        systemRequirementsGpu:
          d.systemRequirementsGpu || d.system_requirements_gpu || "",
        systemRequirementsStorage:
          d.systemRequirementsStorage || d.system_requirements_storage_gb || "",
        systemRequirementsOs:
          d.systemRequirementsOs || d.system_requirements_os || "",
        fileSizeGb: d.fileSizeGb != null ? String(d.fileSizeGb) : "",
        screenshotsUrls: Array.isArray(d.screenshotsUrls)
          ? d.screenshotsUrls
          : Array.isArray(d.screenshots_urls)
            ? d.screenshots_urls
            : [],
        videoPreviewUrl:
          d.installationGuideUrl || d.installation_guide_url || "",
      });
      if (d.coverImageUrl || d.cover_image_url) {
        setUploadedImageUrls([d.coverImageUrl || d.cover_image_url]);
      }
    }
    setShowForm(true);
  };

  const toggleGenre = (genre: string) => {
    setForm((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const selectItemType = (value: string) => {
    const next = value as CatalogItemType;
    const suggested = DEFAULT_CATEGORY_BY_ITEM_TYPE[next];
    setForm((prev) => {
      const previousDefault =
        DEFAULT_CATEGORY_BY_ITEM_TYPE[prev.itemType as CatalogItemType];
      const shouldSuggestCategory =
        !prev.category || prev.category === previousDefault;
      return {
        ...prev,
        itemType: next,
        category: shouldSuggestCategory ? suggested : prev.category,
        deliveryType:
          next === "game-key"
            ? prev.deliveryType || "Digital Delivery"
            : ["console", "gamepad", "accessory"].includes(next)
              ? prev.deliveryType || "Home Delivery"
              : prev.deliveryType,
      };
    });
  };

  const toggleFlag = (key: string, value: boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const startUpload = useCallback((id: string, file: File) => {
    const xhr = new XMLHttpRequest();
    uploadRequestsRef.current[id] = xhr;

    const body = new FormData();
    body.append("file", file);

    xhr.open("POST", "/api/admin/upload-image");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, progress: percent } : item,
          ),
        );
      }
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && json?.data?.url) {
          const url = json.data.url;
          setUploadItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? { ...item, status: "success", progress: 100 }
                : item,
            ),
          );
          setUploadedImageUrls((prev) => {
            const next = [...prev, url];
            setForm((f) => ({
              ...f,
              image_url: f.image_url || url,
              screenshotsUrls: next,
            }));
            return next;
          });
        } else {
          setUploadItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: "error",
                    error: json?.error?.message || "Upload failed",
                  }
                : item,
            ),
          );
        }
      } catch {
        setUploadItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: "error", error: "Upload failed" }
              : item,
          ),
        );
      }
      delete uploadRequestsRef.current[id];
    };

    xhr.onerror = () => {
      setUploadItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "error", error: "Network error" }
            : item,
        ),
      );
      delete uploadRequestsRef.current[id];
    };

    xhr.send(body);
  }, []);

  const abortUpload = useCallback((id: string) => {
    const xhr = uploadRequestsRef.current[id];
    if (xhr) {
      xhr.abort();
      delete uploadRequestsRef.current[id];
    }
  }, []);

  const handleCsvImport = async () => {
    if (!csvFile) {
      setError("Please select a CSV file first");
      return;
    }
    setError("");
    setImportingCsv(true);
    try {
      const body = new FormData();
      body.append("file", csvFile);
      const res = await fetch("/api/admin/games/import-csv", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (json.error) setError(json.error.message || "CSV import failed");
      else {
        const { inserted, skipped } = json.data || { inserted: 0, skipped: 0 };
        setError(
          `CSV import complete: ${inserted} inserted, ${skipped} skipped.`,
        );
        setCsvFile(null);
        fetchGames(search);
      }
    } catch {
      setError("CSV import failed");
    } finally {
      setImportingCsv(false);
    }
  };

  const handleSeedMockData = async () => {
    setError("");
    setSeedingMockData(true);
    try {
      const res = await fetch("/api/admin/seed-mock-data", { method: "POST" });
      const json = await res.json();
      if (json.error) setError(json.error.message || "Mock data seed failed");
      else {
        const { inserted, skipped } = json.data || { inserted: 0, skipped: 0 };
        setError(
          `Mock seed complete: ${inserted} inserted, ${skipped} skipped.`,
        );
        fetchGames(search);
      }
    } catch {
      setError("Mock data seed failed");
    } finally {
      setSeedingMockData(false);
    }
  };

  const showSaveError = (message: string) => {
    setFormError(message);
    // Error sits above the long form — jump so the admin actually sees it
    requestAnimationFrame(() => {
      document
        .getElementById("admin-item-form-error")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const title = form.title.trim();
    const description = form.description.trim();
    const category = form.category.trim();
    const price = parseFloat(form.price_naira);
    const saleRaw = (form.sale_price ?? "").trim();

    if (!title) {
      showSaveError("Title is required");
      return;
    }
    if (!description) {
      showSaveError("Short description is required");
      return;
    }
    if (!category) {
      showSaveError("Store category is required");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      showSaveError("Price must be a valid number (₦)");
      return;
    }

    let salePrice: number | null = null;
    if (saleRaw) {
      const sp = parseFloat(saleRaw);
      if (!Number.isFinite(sp) || sp < 0) {
        showSaveError("Sale price must be a valid non-negative number");
        return;
      }
      if (sp >= price) {
        showSaveError("Sale price must be lower than the regular price");
        return;
      }
      salePrice = sp;
    }

    const parsedFileSize = (form.fileSizeGb ?? "").trim()
      ? parseFloat(form.fileSizeGb)
      : null;
    if (
      parsedFileSize != null &&
      (!Number.isFinite(parsedFileSize) || parsedFileSize < 0)
    ) {
      showSaveError("File size must be a valid number (GB)");
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `/api/admin/games/${editId}` : "/api/admin/games";
      const method = editId ? "PUT" : "POST";

      const normalizedDownload = normalizeOptionalUrl(form.download_url);
      const normalizedVideo = normalizeVideoUrl(form.videoPreviewUrl);

      const payload: any = {
        title,
        description,
        longDescription: form.longDescription,
        price_naira: price,
        category,
        itemType: form.itemType,
        platform: form.platform,
        platformNote: form.platformNote || null,
        deliveryType: form.deliveryType,
        region: form.region,
        genres: form.genres,
        image_url: form.image_url,
        download_url: normalizedDownload || "",
        downloadLink: normalizedDownload || null,
        is_published: form.is_published,
        isFeatured: form.isFeatured,
        editorsChoice: form.editorsChoice,
        comingSoon: form.comingSoon,
        staffPick: form.staffPick,
        weekendDeal: form.weekendDeal,
        isOffline: form.isOffline,
        isNew: form.isNew,
        systemRequirementsCpu: form.systemRequirementsCpu || null,
        systemRequirementsRam: form.systemRequirementsRam || null,
        systemRequirementsGpu: form.systemRequirementsGpu || null,
        systemRequirementsStorage: form.systemRequirementsStorage || null,
        systemRequirementsOs: form.systemRequirementsOs || null,
        fileSizeGb: parsedFileSize,
        screenshotsUrls: form.screenshotsUrls || [],
        installationGuideUrl: normalizedVideo || null,
        salePrice,
        discountPercentage: calcDiscountPercentage(price, salePrice),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        showSaveError(
          `Save failed (HTTP ${res.status}). Check your connection and try again.`,
        );
        return;
      }

      if (!res.ok || json?.error) {
        const msg =
          json?.error?.message ||
          (typeof json?.error === "string" ? json.error : null) ||
          `Save failed (HTTP ${res.status})`;
        showSaveError(msg);
        return;
      }

      setShowForm(false);
      fetchGames(search);
    } catch (err) {
      console.error("Admin save item failed:", err);
      showSaveError(
        err instanceof Error ? err.message : "Failed to save item",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (game: Game) => {
    setActionLoading(game.id);
    try {
      await fetch(`/api/admin/games/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !game.is_published }),
      });
      fetchGames(search);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (game: Game) => {
    if (!confirm(`Delete "${game.title}"? This cannot be undone.`)) return;
    setActionLoading(game.id);
    try {
      await fetch(`/api/admin/games/${game.id}`, { method: "DELETE" });
      fetchGames(search);
    } finally {
      setActionLoading(null);
    }
  };

  const itemTypeLabel = (type?: string) => {
    const found = ITEM_TYPES.find((t) => t.value === type);
    return found ? found.label : type || "Game";
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Inventory"
        subtitle="Games, consoles, gamepads, discs, keys & accessories"
        action={{ label: "+ Add Item", onClick: openAdd }}
      />

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <form
          onSubmit={handleSearch}
          className="flex gap-2 w-full max-w-md relative group"
        >
          <input
            type="text"
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cfc4c5] text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-[#000] focus:ring-0 transition duration-155"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none group-focus-within:text-[#000] transition">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            type="submit"
            className="noir-btn-outline px-4 py-2 text-xs uppercase tracking-wide cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 noir-card border-[#ba1a1a]/30 text-[#ba1a1a] text-sm flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="noir-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#5e5e5e] flex flex-col items-center justify-center gap-2">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#cfc4c5] border-t-[#000]" />
            <span className="font-label-mono text-[#5e5e5e] uppercase">
              Loading catalog...
            </span>
          </div>
        ) : games.length === 0 ? (
          <div className="p-12 text-center text-[#5e5e5e]">
            No items found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="noir-table-head">
                <tr>
                  <th className="px-6 py-3.5 text-left">Title</th>
                  <th className="px-6 py-3.5 text-left">Type</th>
                  <th className="px-6 py-3.5 text-left">Category</th>
                  <th className="px-6 py-3.5 text-left">Price</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cfc4c5]">
                {games.map((game) => (
                  <tr
                    key={game.id}
                    className="hover:bg-[#f8f9fa] transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-[#000] font-bold text-sm">
                      {game.title}
                    </td>
                    <td className="px-6 py-4 text-[#5e5e5e] font-medium text-xs">
                      {itemTypeLabel(game.item_type)}
                    </td>
                    <td className="px-6 py-4 text-[#5e5e5e] font-medium">
                      {game.category}
                    </td>
                    <td className="px-6 py-4 text-[#000] font-extrabold font-label-mono text-sm">
                      {game.sale_price != null &&
                      game.sale_price > 0 &&
                      game.sale_price < game.price_naira ? (
                        <div className="flex flex-col gap-0.5">
                          <span>{formatNaira(game.sale_price)}</span>
                          <span className="text-[10px] font-semibold text-[#5e5e5e] line-through">
                            {formatNaira(game.price_naira)}
                          </span>
                          <span className="text-[10px] font-bold text-[#111]">
                            −
                            {game.discountPercentage ??
                              game.discount_percentage ??
                              calcDiscountPercentage(
                                game.price_naira,
                                game.sale_price,
                              )}
                            %
                          </span>
                        </div>
                      ) : (
                        formatNaira(game.price_naira)
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 font-label-mono ${game.is_published ? "text-[#191c1d]" : "text-[#5e5e5e]"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${game.is_published ? "bg-[#000]" : "bg-[#5e5e5e]"}`}
                        />
                        {game.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(game)}
                          className="noir-btn-outline text-xs px-3 py-1.5 uppercase tracking-wide cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleTogglePublish(game)}
                          disabled={actionLoading === game.id}
                          className="noir-btn-outline text-xs px-3 py-1.5 uppercase tracking-wide disabled:opacity-50 cursor-pointer"
                        >
                          {game.is_published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDelete(game)}
                          disabled={actionLoading === game.id}
                          className="text-xs font-bold px-3 py-1.5 border border-[#ba1a1a]/40 text-[#ba1a1a] uppercase tracking-wide transition duration-150 disabled:opacity-50 cursor-pointer hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setShowForm(false)}
          />
          <div className="relative noir-card rounded-none w-full max-w-5xl max-h-[92vh] overflow-y-auto z-10">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#cfc4c5] bg-white">
              <h2 className="text-lg font-bold text-[#000] tracking-tight">
                {editId ? "Edit Item" : "Add New Item"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 border border-[#cfc4c5] hover:bg-[#f8f9fa] text-[#5e5e5e] hover:text-[#000] cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div
                id="admin-item-form-error"
                role="alert"
                className="sticky top-[57px] z-20 mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-semibold shadow-sm"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} noValidate className="p-6 space-y-8">
              {/* ── ITEM TYPE ── */}
              <Section
                title="Item Type"
                subtitle="Choose the product type — fields below adapt to match"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ITEM_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => selectItemType(t.value)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer",
                        form.itemType === t.value
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 hover:border-neutral-400 text-neutral-700",
                      )}
                    >
                      <span className="text-sm font-bold">{t.label}</span>
                      <span
                        className={cn(
                          "text-xs",
                          form.itemType === t.value
                            ? "text-neutral-300"
                            : "text-neutral-400",
                        )}
                      >
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </Section>

              {/* ── BASIC INFO ── */}
              <Section
                title="Basic Info"
                subtitle="Title, store category, and pricing"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <Field label="Title *">
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                        placeholder="e.g. Cyberpunk 2077, PlayStation 5, DualSense Controller"
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Short Description *">
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0 resize-none"
                        placeholder="Short blurb shown on cards and listings"
                      />
                    </Field>
                  </div>

                  {(form.itemType === "game" ||
                    form.itemType === "disc" ||
                    form.itemType === "game-key") && (
                    <div className="md:col-span-2">
                      <Field
                        label="Long Description"
                        hint="Optional — detail page"
                      >
                        <textarea
                          value={form.longDescription}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              longDescription: e.target.value,
                            })
                          }
                          rows={4}
                          className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0 resize-none"
                          placeholder="Full product description for the detail page"
                        />
                      </Field>
                    </div>
                  )}

                  <Field
                    label="Store Category *"
                    hint="Product line on the storefront"
                  >
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                    >
                      <option value="">Select category...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Price (₦) *">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={form.price_naira}
                      onChange={(e) =>
                        setForm({ ...form, price_naira: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                      placeholder="e.g. 15000"
                    />
                  </Field>

                  <Field
                    label="Sale Price (₦)"
                    hint="Optional discount price — leave empty if not on sale"
                  >
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={form.sale_price}
                      onChange={(e) =>
                        setForm({ ...form, sale_price: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                      placeholder="e.g. 9999"
                    />
                  </Field>
                </div>

                {(() => {
                  const priceNum = parseFloat(form.price_naira);
                  const saleNum = (form.sale_price ?? "").trim()
                    ? parseFloat(form.sale_price)
                    : NaN;
                  if (
                    !Number.isFinite(priceNum) ||
                    !Number.isFinite(saleNum) ||
                    priceNum <= 0
                  ) {
                    return null;
                  }
                  if (saleNum >= priceNum) {
                    return (
                      <p className="mt-3 text-xs font-semibold text-[#ba1a1a]">
                        Sale price must be lower than the regular price.
                      </p>
                    );
                  }
                  const pct = calcDiscountPercentage(priceNum, saleNum);
                  return (
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-label-mono text-[#5e5e5e] uppercase">
                        Discount preview
                      </span>
                      <span className="line-through text-[#999]">
                        {formatNaira(priceNum)}
                      </span>
                      <span className="font-bold text-[#000]">
                        {formatNaira(saleNum)}
                      </span>
                      <span className="bg-[#FDD835] text-[#111] text-xs font-bold px-2 py-0.5">
                        −{pct}%
                      </span>
                      <span className="text-xs text-[#5e5e5e]">
                        Tip: turn on “Weekend Deal” under Catalog Flags to
                        feature this on the Deals page.
                      </span>
                    </div>
                  );
                })()}
              </Section>

              {/* ── GAME ── */}
              {form.itemType === "game" && (
                <>
                  <Section
                    title="Game Details"
                    subtitle="Platform, download link, and file size"
                  >
                    <div className="space-y-4">
                      <PlatformPicker
                        value={form.platform}
                        note={form.platformNote}
                        onChange={(val) =>
                          setForm((prev) => ({ ...prev, platform: val }))
                        }
                        onNoteChange={(val) =>
                          setForm((prev) => ({ ...prev, platformNote: val }))
                        }
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="File Size (GB)">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={form.fileSizeGb}
                            onChange={(e) =>
                              setForm({ ...form, fileSizeGb: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                            placeholder="e.g. 70"
                          />
                        </Field>
                        <Field
                          label="Download URL"
                          hint="Optional — digital download link"
                        >
                          <input
                            type="text"
                            inputMode="url"
                            value={form.download_url}
                            onChange={(e) =>
                              setForm({ ...form, download_url: e.target.value })
                            }
                            onBlur={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                download_url: normalizeOptionalUrl(
                                  e.target.value,
                                ),
                              }))
                            }
                            className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                            placeholder="https://..."
                          />
                        </Field>
                        <Field
                          label="Video Preview URL"
                          hint="Paste a YouTube link, youtu.be link, embed URL, or iframe code"
                        >
                          <input
                            type="text"
                            inputMode="url"
                            value={form.videoPreviewUrl}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                videoPreviewUrl: e.target.value,
                              })
                            }
                            onBlur={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                videoPreviewUrl: normalizeVideoUrl(
                                  e.target.value,
                                ),
                              }))
                            }
                            className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </Field>
                        <Field label="Region" hint="Optional">
                          <input
                            type="text"
                            value={form.region}
                            onChange={(e) =>
                              setForm({ ...form, region: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                            placeholder="e.g. Global, Nigeria"
                          />
                        </Field>
                      </div>
                    </div>
                  </Section>

                  <GenreSection genres={form.genres} onToggle={toggleGenre} />

                  <SystemReqsSection
                    form={form}
                    setForm={setForm}
                    subtitle="Shown on the game detail page"
                  />
                </>
              )}

              {/* ── CONSOLE ── */}
              {form.itemType === "console" && (
                <Section
                  title="Console Details"
                  subtitle="Physical delivery — platform and shipping"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Platform / Model *">
                      <input
                        type="text"
                        value={form.platform}
                        onChange={(e) =>
                          setForm({ ...form, platform: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                        placeholder="e.g. PlayStation 5, Xbox Series X"
                      />
                    </Field>
                    <Field label="Region">
                      <input
                        type="text"
                        value={form.region}
                        onChange={(e) =>
                          setForm({ ...form, region: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                        placeholder="e.g. Global, Nigeria, US"
                      />
                    </Field>
                    <Field label="Delivery Type">
                      <select
                        value={form.deliveryType}
                        onChange={(e) =>
                          setForm({ ...form, deliveryType: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                      >
                        <option value="">Select...</option>
                        <option value="Home Delivery">Home Delivery</option>
                        <option value="Console">Walk-in / Pickup</option>
                      </select>
                    </Field>
                  </div>
                </Section>
              )}

              {/* ── GAMEPAD ── */}
              {form.itemType === "gamepad" && (
                <Section
                  title="Gamepad Details"
                  subtitle="Physical delivery — compatibility and shipping"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Compatible Platform">
                      <input
                        type="text"
                        value={form.platform}
                        onChange={(e) =>
                          setForm({ ...form, platform: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                        placeholder="e.g. PS4/PS5, Xbox, PC"
                      />
                    </Field>
                    <Field label="Delivery Type">
                      <select
                        value={form.deliveryType}
                        onChange={(e) =>
                          setForm({ ...form, deliveryType: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                      >
                        <option value="">Select...</option>
                        <option value="Home Delivery">Home Delivery</option>
                        <option value="Accessory">Walk-in / Pickup</option>
                      </select>
                    </Field>
                  </div>
                </Section>
              )}

              {/* ── DISC ── */}
              {form.itemType === "disc" && (
                <>
                  <Section
                    title="Disc Details"
                    subtitle="Physical disc — platform, region, and delivery"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Compatible Platform">
                        <input
                          type="text"
                          value={form.platform}
                          onChange={(e) =>
                            setForm({ ...form, platform: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                          placeholder="e.g. PS5, PS4"
                        />
                      </Field>
                      <Field label="Region">
                        <input
                          type="text"
                          value={form.region}
                          onChange={(e) =>
                            setForm({ ...form, region: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                          placeholder="e.g. Global, Nigeria, US"
                        />
                      </Field>
                      <Field label="Delivery Type">
                        <select
                          value={form.deliveryType}
                          onChange={(e) =>
                            setForm({ ...form, deliveryType: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                        >
                          <option value="">Select...</option>
                          <option value="Home Delivery">Home Delivery</option>
                          <option value="Digital Delivery">
                            Digital Delivery
                          </option>
                        </select>
                      </Field>
                      <Field label="Disc / Install Size (GB)" hint="Optional">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={form.fileSizeGb}
                          onChange={(e) =>
                            setForm({ ...form, fileSizeGb: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                          placeholder="e.g. 70"
                        />
                      </Field>
                    </div>
                  </Section>

                  <GenreSection genres={form.genres} onToggle={toggleGenre} />
                </>
              )}

              {/* ── GAME KEY ── */}
              {form.itemType === "game-key" && (
                <>
                  <Section
                    title="Game Key Details"
                    subtitle="Digital license — platform, region, and redemption"
                  >
                    <div className="space-y-4">
                      <PlatformPicker
                        value={form.platform}
                        note={form.platformNote}
                        onChange={(val) =>
                          setForm((prev) => ({ ...prev, platform: val }))
                        }
                        onNoteChange={(val) =>
                          setForm((prev) => ({ ...prev, platformNote: val }))
                        }
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Region">
                          <input
                            type="text"
                            value={form.region}
                            onChange={(e) =>
                              setForm({ ...form, region: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                            placeholder="e.g. Global, Nigeria, US Account"
                          />
                        </Field>
                        <Field label="Delivery Type">
                          <select
                            value={form.deliveryType}
                            onChange={(e) =>
                              setForm({ ...form, deliveryType: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                          >
                            <option value="">Select...</option>
                            <option value="Digital Delivery">
                              Digital Delivery
                            </option>
                          </select>
                        </Field>
                        <div className="sm:col-span-2">
                          <Field
                            label="Redemption / Download URL"
                            hint="Optional — where the key is activated"
                          >
                            <input
                              type="text"
                              inputMode="url"
                              value={form.download_url}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  download_url: e.target.value,
                                })
                              }
                              onBlur={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  download_url: normalizeOptionalUrl(
                                    e.target.value,
                                  ),
                                }))
                              }
                              className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                              placeholder="https://..."
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <GenreSection genres={form.genres} onToggle={toggleGenre} />

                  <SystemReqsSection
                    form={form}
                    setForm={setForm}
                    subtitle="Optional — useful for PC keys"
                  />
                </>
              )}

              {/* ── ACCESSORY ── */}
              {form.itemType === "accessory" && (
                <Section
                  title="Accessory Details"
                  subtitle="Physical delivery — headsets, cables, and more"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Compatible Platform" hint="Optional">
                      <input
                        type="text"
                        value={form.platform}
                        onChange={(e) =>
                          setForm({ ...form, platform: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                        placeholder="e.g. PC, PS5, Universal"
                      />
                    </Field>
                    <Field label="Delivery Type">
                      <select
                        value={form.deliveryType}
                        onChange={(e) =>
                          setForm({ ...form, deliveryType: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
                      >
                        <option value="">Select...</option>
                        <option value="Home Delivery">Home Delivery</option>
                        <option value="Accessory">Walk-in / Pickup</option>
                      </select>
                    </Field>
                  </div>
                </Section>
              )}

              {/* ── COVER IMAGE (all types) ── */}
              <Section
                title="Cover Image"
                subtitle="Upload a cover photo or paste a URL"
              >
                <FileUpload
                  value={uploadItems}
                  onValueChange={setUploadItems}
                  onFilesAdded={(added, files) => {
                    added.forEach((item, idx) =>
                      startUpload(item.id, files[idx]),
                    );
                  }}
                  onRemove={(item) => abortUpload(item.id)}
                  onRetry={(item) => {
                    if (item.file) startUpload(item.id, item.file);
                  }}
                  accept="image/*"
                  multiple={true}
                  title="Drop images here or click to browse"
                  description="Supports JPG, PNG, WEBP (Max 5MB)"
                />

                {uploadedImageUrls.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-[#777] mb-2">
                      Uploaded — tap to set as cover
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {uploadedImageUrls.map((url, idx) => (
                        <button
                          key={`${url}-${idx}`}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, image_url: url }))
                          }
                          className={cn(
                            "relative rounded-lg border p-0.5 bg-white hover:border-blue-600 cursor-pointer overflow-hidden transition-all duration-150 aspect-video",
                            form.image_url === url
                              ? "border-blue-600 ring-2 ring-blue-500/20 scale-[0.98]"
                              : "border-neutral-200",
                          )}
                        >
                          <img
                            src={url}
                            alt={`Uploaded ${idx + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                          {form.image_url === url && (
                            <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                              <span className="bg-blue-600 text-white rounded-full text-[8px] font-bold h-4 w-4 flex items-center justify-center">
                                ✓
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.image_url && (
                  <div className="mt-4 rounded-lg border border-neutral-200 p-2 bg-neutral-50 flex flex-col">
                    <span className="text-xs font-semibold text-[#777] mb-2">
                      Cover Preview
                    </span>
                    <img
                      src={form.image_url}
                      alt="Cover preview"
                      className="w-full h-40 object-cover rounded shadow-xs"
                    />
                  </div>
                )}
              </Section>

              {/* ── CATALOG FLAGS ── */}
              <Section
                title="Catalog Flags"
                subtitle="Homepage collections and badges — optional"
              >
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { key: "isFeatured", label: "Featured" },
                      { key: "editorsChoice", label: "Editor's Choice" },
                      { key: "staffPick", label: "Staff Pick" },
                      { key: "weekendDeal", label: "Weekend Deal" },
                      { key: "comingSoon", label: "Coming Soon" },
                      { key: "isNew", label: "New Arrival" },
                    ] as const
                  ).map(({ key, label }) => {
                    const active = form[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 cursor-pointer select-none",
                          active
                            ? "bg-neutral-900 border-neutral-900 text-white"
                            : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400",
                        )}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* ── VISIBILITY ── */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  id="published"
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm({ ...form, is_published: e.target.checked })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <label
                  htmlFor="published"
                  className="text-sm font-semibold text-neutral-700 cursor-pointer select-none"
                >
                  Publish immediately (visible on storefront)
                </label>
              </div>

              {/* ── ACTIONS ── */}
              {formError && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-semibold"
                >
                  {formError}
                </div>
              )}
              <p className="text-xs text-[#5e5e5e]">
                Required: title, short description, store category, and price.
              </p>
              <div className="flex gap-3 pt-4 border-t border-[#cfc4c5]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 noir-btn-outline px-4 py-2.5 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 noir-btn-primary px-4 py-2.5 text-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving && (
                    <svg
                      className="h-4 w-4 animate-spin text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {saving ? "Saving..." : editId ? "Update Item" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="border-b border-neutral-100 pb-2">
        <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
        {subtitle && (
          <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-[#777]">
          {label}
        </label>
        {hint && <span className="text-xs text-neutral-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/* ── Platform Picker ── */
function PlatformPicker({
  value,
  note,
  onChange,
  onNoteChange,
}: {
  value: string;
  note: string;
  onChange: (val: string) => void;
  onNoteChange: (val: string) => void;
}) {
  const selected = value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onChange(next.join(", "));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#777]">
          Platform
        </label>
        {selected.length > 0 && (
          <span className="text-xs text-neutral-400 font-medium">
            {selected.join(" · ")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PLATFORMS.map((p) => {
          const isSelected = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              title={p.label}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl border text-center transition-all duration-150 cursor-pointer select-none",
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[0.97]"
                  : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-800 hover:bg-neutral-50",
              )}
            >
              <span
                className={cn(
                  "transition-colors",
                  isSelected ? "text-white" : "text-neutral-500",
                )}
              >
                {p.icon}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold leading-none",
                  isSelected ? "text-white" : "text-neutral-500",
                )}
              >
                {p.label}
              </span>
            </button>
          );
        })}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#777] mb-1.5">
          Additional / Custom Platform Note
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="e.g. Epic Games, Battle.net, Origin…"
          className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0 placeholder:text-neutral-400"
        />
      </div>
    </div>
  );
}

function GenreSection({
  genres,
  onToggle,
}: {
  genres: string[];
  onToggle: (genre: string) => void;
}) {
  return (
    <Section title="Genres" subtitle="Same list as storefront filters — tap to toggle">
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const selected = genres.includes(genre);
          return (
            <button
              key={genre}
              type="button"
              onClick={() => onToggle(genre)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 cursor-pointer select-none",
                selected
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900",
              )}
            >
              {selected && <span className="mr-1">✓</span>}
              {genre}
            </button>
          );
        })}
      </div>
      {genres.length > 0 && (
        <p className="mt-2 text-[11px] text-neutral-500 font-medium">
          Selected: {genres.join(", ")}
        </p>
      )}
    </Section>
  );
}

function SystemReqsSection({
  form,
  setForm,
  subtitle,
}: {
  form: NewGame;
  setForm: Dispatch<SetStateAction<NewGame>>;
  subtitle: string;
}) {
  return (
    <Section title="Minimum System Requirements" subtitle={subtitle}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Processor">
          <input
            type="text"
            value={form.systemRequirementsCpu}
            onChange={(e) =>
              setForm({ ...form, systemRequirementsCpu: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
            placeholder="e.g. Intel i5 7500 OR AMD Ryzen 5 1600"
          />
        </Field>
        <Field label="GPU / Video Memory">
          <input
            type="text"
            value={form.systemRequirementsGpu}
            onChange={(e) =>
              setForm({ ...form, systemRequirementsGpu: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
            placeholder="e.g. 4 GB GTX 1660 OR AMD Rx 590"
          />
        </Field>
        <Field label="RAM">
          <input
            type="text"
            value={form.systemRequirementsRam}
            onChange={(e) =>
              setForm({ ...form, systemRequirementsRam: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
            placeholder="e.g. 8 GB"
          />
        </Field>
        <Field label="Storage">
          <input
            type="text"
            value={form.systemRequirementsStorage}
            onChange={(e) =>
              setForm({
                ...form,
                systemRequirementsStorage: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
            placeholder="e.g. 40 GB"
          />
        </Field>
        <Field label="Operating System">
          <input
            type="text"
            value={form.systemRequirementsOs}
            onChange={(e) =>
              setForm({ ...form, systemRequirementsOs: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-[#cfc4c5] text-neutral-900 text-sm focus:outline-none focus:border-[#000] focus:ring-0"
            placeholder="e.g. Windows 10 64-bit or higher"
          />
        </Field>
      </div>
    </Section>
  );
}
