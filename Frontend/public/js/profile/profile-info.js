import supabase from '../../Backend2/config/SupabaseClient.js';

const fields = [
  { id: 'profile-name', key: 'name' },
  { id: 'profile-dob', key: 'date_of_birth' },
  { id: 'profile-contact', key: 'contact_number' },
  { id: 'profile-gender', key: 'gender' },
  { id: 'profile-address', key: 'address' },
  { id: 'profile-email', key: 'email' },
  { id: 'profile-role', key: 'role' },
];

const passwordField = document.getElementById('profile-password');
const saveBtn = document.getElementById('save-profile-btn');
const editBtns = document.querySelectorAll('.edit-btn');
const profilePicture = document.getElementById('profile-picture');
const profilePictureInput = document.getElementById('profile-picture-input');
const removePictureBtn = document.getElementById('remove-picture-btn');

let userData = {};
let editingField = null;
let newPassword = null;
let newProfilePicFile = null;
let removeProfilePic = false;

async function fetchProfile() {
  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser?.user) return;
  const userId = authUser.user.id;
  const { data, error } = await supabase
    .from('users_table')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return;
  userData = data;
  renderProfile();
}

function renderProfile() {
  fields.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (key === 'date_of_birth' && userData[key]) {
      el.textContent = new Date(userData[key]).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } else {
      el.textContent = userData[key] || '';
    }
  });
  // Password is not fetched for security, so just show dots
  if (passwordField) passwordField.textContent = '•••••••••••••••';
  // Profile picture
  if (profilePicture && userData.profile_picture_url && !removeProfilePic) {
    profilePicture.src = userData.profile_picture_url;
  } else if (profilePicture) {
    profilePicture.src = '/public/images/human.png';
  }
}

// Edit field logic
editBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const field = btn.getAttribute('data-field');
    if (!field) return;
    if (editingField) return; // Only one at a time
    editingField = field;
    const el = document.getElementById('profile-' + field.replace('_', '-'));
    if (!el) return;
    const currentValue = userData[field] || '';
    const input = document.createElement(field === 'date_of_birth' ? 'input' : 'input');
    input.type = field === 'date_of_birth' ? 'date' : 'text';
    input.value = field === 'date_of_birth' && currentValue ? new Date(currentValue).toISOString().split('T')[0] : currentValue;
    input.className = 'border rounded px-2 py-1 w-full';
    el.replaceWith(input);
    input.focus();
    input.addEventListener('blur', () => {
      userData[field] = input.value;
      editingField = null;
      fetchProfile();
    });
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        userData[field] = input.value;
        editingField = null;
        fetchProfile();
      }
    });
  });
});

// Password edit
if (passwordField) {
  const passwordEditBtn = document.querySelector('.edit-btn[data-field="password"]');
  if (passwordEditBtn) {
    passwordEditBtn.addEventListener('click', () => {
      if (editingField) return;
      editingField = 'password';
      const input = document.createElement('input');
      input.type = 'password';
      input.placeholder = 'New password';
      input.className = 'border rounded px-2 py-1 w-full';
      passwordField.replaceWith(input);
      input.focus();
      input.addEventListener('blur', () => {
        newPassword = input.value;
        editingField = null;
        fetchProfile();
      });
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          newPassword = input.value;
          editingField = null;
          fetchProfile();
        }
      });
    });
  }
}

// Profile picture preview only (no upload)
if (profilePictureInput) {
  profilePictureInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      newProfilePicFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        profilePicture.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      removeProfilePic = false;
    }
  });
}

if (removePictureBtn) {
  removePictureBtn.addEventListener('click', () => {
    newProfilePicFile = null;
    removeProfilePic = true;
    profilePicture.src = '/public/images/human.png';
  });
}

// Save changes (ignore image changes)
if (saveBtn) {
  saveBtn.addEventListener('click', async () => {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser?.user) return;
    const userId = authUser.user.id;
    let updates = { ...userData };
    // Ignore profile picture changes (do not upload or update URL)
    // Update password if changed
    if (newPassword) {
      await supabase.auth.updateUser({ password: newPassword });
      newPassword = null;
    }
    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.email;
    delete updates.role;
    // Update user info
    const { error } = await supabase.from('users_table').update(updates).eq('id', userId);
    if (!error) {
      alert('Profile updated successfully!');
      fetchProfile();
    } else {
      alert('Failed to update profile.');
    }
  });
}

// Initial fetch
fetchProfile(); 