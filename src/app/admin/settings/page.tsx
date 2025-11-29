import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSettings, updateSettings } from "@/lib/settings";
import { requireRole } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { auditLog } from "@/lib/audit-log";
import { MAX_SITE_NAME_LENGTH, MAX_URL_LENGTH } from "@/lib/constants";

async function updateSettingsAction(formData: FormData) {
  "use server";
  const session = await requireRole("ADMIN");

  const siteName = formData.get("siteName")?.toString().trim();
  const primaryColor = formData.get("primaryColor")?.toString().trim();
  const logoUrl = formData.get("logoUrl")?.toString().trim() || null;

  // Validate siteName
  if (!siteName || siteName.length === 0) {
    throw new ValidationError("Site name is required");
  }
  if (siteName.length > MAX_SITE_NAME_LENGTH) {
    throw new ValidationError(`Site name must be ${MAX_SITE_NAME_LENGTH} characters or less`);
  }

  // Validate primaryColor
  if (!primaryColor) {
    throw new ValidationError("Primary color is required");
  }
  if (!/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
    throw new ValidationError("Primary color must be a valid hex color (e.g., #FF0000)");
  }

  // Validate logoUrl
  if (logoUrl) {
    try {
      new URL(logoUrl);
      if (logoUrl.length > MAX_URL_LENGTH) {
        throw new ValidationError(`Logo URL must be ${MAX_URL_LENGTH} characters or less`);
      }
    } catch {
      throw new ValidationError("Logo URL must be a valid URL");
    }
  }

  await updateSettings({
    siteName,
    primaryColor,
    logoUrl: logoUrl || null,
  });

  // Audit log
  await auditLog({
    userId: session.user.id,
    action: "SETTINGS_UPDATED",
    resourceType: "Settings",
    details: { siteName, primaryColor, logoUrlChanged: !!logoUrl },
  });

  revalidatePath("/admin/settings");
  redirect("/admin/settings?success=true");
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Application Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Customize the appearance and branding of your VBS app.
        </p>
      </div>

      {resolvedSearchParams.success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">Settings saved successfully!</p>
        </div>
      )}

      <form
        action={updateSettingsAction}
        className="space-y-6 rounded-lg border border-gray-200 bg-white p-6"
      >
        <div>
          <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
            Site Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="siteName"
            name="siteName"
            required
            defaultValue={settings.siteName}
            placeholder="VBS App"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            This name appears in the navigation and page titles
          </p>
        </div>

        <div>
          <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
            Primary Color <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="color"
              id="colorPicker"
              defaultValue={settings.primaryColor}
              className="h-10 w-20 rounded border border-gray-300"
              onChange={(e) => {
                const textInput = document.getElementById("primaryColor") as HTMLInputElement;
                if (textInput) textInput.value = e.target.value;
              }}
            />
            <input
              type="text"
              id="primaryColor"
              name="primaryColor"
              required
              defaultValue={settings.primaryColor}
              placeholder="#2563eb"
              pattern="^#[0-9A-Fa-f]{6}$"
              className="block flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Primary color used for buttons, links, and accents (hex format)
          </p>
        </div>

        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
            Logo URL
          </label>
          <input
            type="url"
            id="logoUrl"
            name="logoUrl"
            defaultValue={settings.logoUrl || ""}
            placeholder="https://example.com/logo.png"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            URL to your logo image (optional). For now, upload to a hosting service and paste the
            URL here.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
        <div className="mt-4 rounded-md border border-gray-200 p-4" style={{ backgroundColor: "#f9fafb" }}>
          <div className="flex items-center gap-3">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto" />
            )}
            <span className="text-lg font-semibold" style={{ color: settings.primaryColor }}>
              {settings.siteName}
            </span>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="rounded-md px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: settings.primaryColor }}
            >
              Example Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
