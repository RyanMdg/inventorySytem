// "use strict";

// import supabase from "../Backend2/config/SupabaseClient.js";

// async function uploadImage(file) {
//   if (!file) {
//     console.error("No file selected!");
//     return;
//   }

//   const fileName = `images/${Date.now()}-${file.name}`;

//   const { data, error } = await supabase.storage
//     .from("affotako") // Ensure this matches your actual bucket name
//     .upload(fileName, file, {
//       cacheControl: "3600",
//       upsert: false,
//     });

//   if (error) {
//     console.error("Upload error:", error.message);
//     return null;
//   }

//   console.log("File uploaded:", data);
//   return data.path; // Return the file path
// }

// function getPublicUrl(filePath) {
//   const { data } = supabase.storage.from("affotako").getPublicUrl(filePath);

//   if (!data) {
//     console.error("Failed to retrieve public URL");
//     return null;
//   }
//   return data.publicUrl; // Return the public URL correctly
// }

// const uploadButton = document.querySelector(".uploadBtn");

// uploadButton.addEventListener("click", async () => {
//   const fileInput = document.getElementById("fileInput");
//   const file = fileInput.files[0];

//   if (!file) {
//     alert("Please select an image to upload.");
//     return;
//   }

//   const filePath = await uploadImage(file);

//   if (filePath) {
//     const imageUrl = getPublicUrl(filePath);

//     console.log("Generated Image URL:", imageUrl); // Debugging

//     if (imageUrl) {
//       document.getElementById("previewImage").src = imageUrl;
//     } else {
//       console.error("Failed to fetch image URL.");
//     }
//   }
// });
