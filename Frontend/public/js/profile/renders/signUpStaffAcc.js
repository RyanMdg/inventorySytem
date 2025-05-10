"strict";

import { getAuthUserAndBranch } from "../../Authentication/auth-utils.js";
import { dynamicAlert } from "../../modals_Js/dynamicInventory.js";
import supabase from "../../../Backend2/config/SupabaseClient.js";

// Helper for uploading profile picture
async function uploadProfilePicture(file) {
  if (!file) return null;
  const fileName = `profilepics/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("affotako")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }
  const { data: urlData } = supabase.storage
    .from("affotako")
    .getPublicUrl(fileName);
  return urlData ? urlData.publicUrl : null;
}

const form = document.getElementById("addStaff");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  //  Gather form values
  const formData = new FormData(this);
  const values = Object.fromEntries(formData.entries());

  // Confirm password check
  const password = values.password || "";
  const confirmPassword = values.confirm_password || "";
  const mismatchEl = document.getElementById("password-mismatch");
  if (password !== confirmPassword) {
    mismatchEl.classList.remove("hidden");
    return;
  } else {
    mismatchEl.classList.add("hidden");
  }

  //  Validate blanks (except file input and confirm_password)
  const empty = Object.entries(values)
    .filter(
      ([k, v]) =>
        k !== "profilepicture" && k !== "confirm_password" && !v.trim()
    )
    .map(([k]) => k);

  if (empty.length) {
    greenCheck.classList.add("hidden");
    redCheck.classList.remove("hidden");
    return dynamicAlert(
      "Registration failed!",
      `Please fill in the following field(s):\n- ${empty.join("\n- ")}`
    );
  }

  try {
    const { branchId } = await getAuthUserAndBranch();
    // Sign up user
    const { data: signData, error: signErr } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });
    if (signErr) throw signErr;
    const userId = signData.user.id;

    // Upload profile picture if provided
    let profilePicUrl = null;
    const fileInput = this.querySelector('input[name="profilepicture"]');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      profilePicUrl = await uploadProfilePicture(fileInput.files[0]);
    }

    const { error: userErr } = await supabase.from("users_table").insert([
      {
        id: userId,
        email: values.email,
        password: values.password,
        name: values.name,
        role: values.role,
        branch_id: branchId,
        contact_number: values.contact_number,
        date_of_birth: values.date_of_birth,
        gender: values.gender,
        address: values.address,
        profilepicture: profilePicUrl,
      },
    ]);
    if (userErr) throw userErr;

    greenCheck.classList.remove("hidden");
    redCheck.classList.add("hidden");
    dynamicAlert(
      "New Staff Account register!",
      "Please notify them to verify their email accounts."
    );

    this.reset();
  } catch (err) {
    console.error(err.message);
    greenCheck.classList.add("hidden");
    redCheck.classList.remove("hidden");
    dynamicAlert(
      "Error registering new franchise account",
      err.message.includes("duplicate key")
        ? "Email already exists!"
        : err.message
    );
  }
});
