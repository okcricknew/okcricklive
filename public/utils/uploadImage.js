import {
  CLOUDINARY_UPLOAD_URL,
  UPLOAD_PRESET,
} from "../lib/cloudinary";

export async function uploadImage(file) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();

  return data.secure_url;
}
