function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const folder = import.meta.env.VITE_CLOUDINARY_FOLDER;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Missing Cloudinary env vars: set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET"
    );
  }

  return { cloudName, uploadPreset, folder };
}

export async function uploadImageToCloudinary(file) {
  if (!file) throw new Error("No file provided");

  const { cloudName, uploadPreset, folder } = getCloudinaryConfig();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (folder) formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.error?.message || "Cloudinary upload failed";
    throw new Error(message);
  }

  const url = payload?.secure_url;
  if (!url) throw new Error("Cloudinary did not return secure_url");

  return url;
}
