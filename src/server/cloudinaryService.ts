import crypto from "crypto";

export async function uploadAudioToCloudinary(
  audioBuffer: Buffer,
  folder: string = "grasp_audio"
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const errMsg = "Missing Cloudinary configuration in environment variables.";
    console.error("[CloudinaryService] [uploadAudioToCloudinary] Error: " + errMsg);
    throw new Error(errMsg);
  }

  console.log("[CloudinaryService] [uploadAudioToCloudinary] Start upload", { 
    folder, 
    audioBufferSize: audioBuffer.length 
  });

  const timestamp = Math.round(new Date().getTime() / 1000).toString();

  // Prepare parameters to sign (Cloudinary signature expects parameters sorted alphabetically)
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/wav" });
  formData.append("file", blob, "audio.wav");
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[CloudinaryService] [uploadAudioToCloudinary] Upload failed", { status: response.status, errorText });
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = (await response.json()) as { secure_url: string };
  console.log("[CloudinaryService] [uploadAudioToCloudinary] Success", { secure_url: data.secure_url });
  return data.secure_url;
}
