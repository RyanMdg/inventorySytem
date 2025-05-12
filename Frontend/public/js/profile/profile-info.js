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
const DEFAULT_PROFILE_IMAGE = './images/tako.png';

let userData = {};
let editingField = null;
let newPassword = null;
let newProfilePicFile = null;
let removeProfilePic = false;

async function fetchAndRenderNavProfilePic() {
  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) return;

    const { data: user, error } = await supabase
      .from('users_table')
      .select('profilepicture')
      .eq('id', authUser.user.id)
      .single();

    if (error) throw error;

    // Get both profile picture elements
    const navProfilePic = document.querySelector('.cursor-pointer.flex.gap-3 img');
    const dropdownProfilePic = document.querySelector('#ProfileDropdown figure img');
    
    if (navProfilePic) {
      navProfilePic.src = user.profilepicture || './images/human.png';
      navProfilePic.alt = 'Profile Picture';
      navProfilePic.className = 'w-10 h-10 rounded-full object-cover';
    }

    if (dropdownProfilePic) {
      dropdownProfilePic.src = user.profilepicture || './images/human.png';
      dropdownProfilePic.alt = 'Profile Picture';
      dropdownProfilePic.className = 'w-14 h-14 rounded-full object-cover';
    }
  } catch (error) {
    console.error('Error fetching profile picture:', error.message);
  }
}

async function uploadProfilePicture(file, userId) {
  try {
    // First, delete the old file if it exists
    if (userData.profilepicture) {
      const oldFilePath = userData.profilepicture.split('/').pop();
      await supabase.storage.from('affotako').remove([oldFilePath]);
    }

    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    // Upload the new file
    const { data, error } = await supabase.storage
      .from('affotako')
      .upload(fileName, file);
      
    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('affotako')
      .getPublicUrl(fileName);

    // Update the profile with the new URL
    const { error: updateError } = await supabase
      .from('users_table')
      .update({ profilepicture: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Update local user data and nav profile picture
    userData.profilepicture = publicUrl;
    renderProfile();
    fetchAndRenderNavProfilePic();

    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

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
      try {
        const date = new Date(userData[key]);
        if (!isNaN(date.getTime())) {
          el.textContent = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } else {
          el.textContent = '';
        }
      } catch (e) {
        el.textContent = '';
      }
    } else {
      el.textContent = userData[key] || '';
    }
  });
  
  if (passwordField) passwordField.textContent = '•••••••••••••••';
  
  // Profile picture handling
  if (profilePicture) {
    if (userData.profilepicture && !removeProfilePic) {
      profilePicture.src = userData.profilepicture;
      removePictureBtn.style.display = 'block';
    } else {
      profilePicture.src = DEFAULT_PROFILE_IMAGE;
      removePictureBtn.style.display = 'none';
    }
  }
}

// Edit field logic
editBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const field = btn.getAttribute('data-field');
    if (!field) return;
    
    // If already editing a different field, save it first
    if (editingField && editingField !== field) {
      const previousInput = document.querySelector(`#profile-${editingField.replace('_', '-')} input, #profile-${editingField.replace('_', '-')} select`);
      if (previousInput) {
        if (editingField === 'password') {
          newPassword = previousInput.value;
        } else if (editingField === 'date_of_birth') {
          userData[editingField] = previousInput.value ? previousInput.value : null;
        } else {
          userData[editingField] = previousInput.value;
        }
        renderProfile();
      }
    }
    
    editingField = field;
    const el = document.getElementById('profile-' + field.replace('_', '-'));
    if (!el) return;
    
    const currentValue = userData[field] || '';
    
    if (field === 'gender') {
      // Create select element for gender
      const select = document.createElement('select');
      select.className = 'bg-transparent border-2 border-gray-300 rounded px-2 py-1 outline-none w-full font-semibold text-gray-800';
      ['male', 'female', 'other'].forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option.charAt(0).toUpperCase() + option.slice(1);
        if (currentValue === option) opt.selected = true;
        select.appendChild(opt);
      });
      
      // Replace text with select
      el.innerHTML = '';
      el.appendChild(select);
      select.focus();
      
      // Handle select change
      select.addEventListener('change', () => {
        userData[field] = select.value;
        editingField = null;
        renderProfile();
      });
      
      select.addEventListener('blur', () => {
        editingField = null;
        renderProfile();
      });
      
      return;
    } else if (field === 'date_of_birth') {
      const input = document.createElement('input');
      input.type = 'date';
      if (currentValue) {
        try {
          const date = new Date(currentValue);
          if (!isNaN(date.getTime())) {
            input.value = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Invalid date:', e);
        }
      }
      input.className = 'bg-transparent border-2 border-gray-300 rounded px-2 py-1 outline-none w-full font-semibold text-gray-800';
      el.innerHTML = '';
      el.appendChild(input);
      input.focus();
      
      const handleDateChange = () => {
        userData[field] = input.value;
        editingField = null;
        renderProfile();
      };
      
      input.addEventListener('change', handleDateChange);
      input.addEventListener('blur', handleDateChange);
    } else if (field === 'contact_number') {
      const input = document.createElement('input');
      input.type = 'tel';
      input.value = currentValue;
      input.maxLength = 11;
      input.placeholder = '09xxxxxxxxx';
      input.pattern = '09[0-9]{9}';
      input.className = 'bg-transparent border-2 border-gray-300 rounded px-2 py-1 outline-none w-full font-semibold text-gray-800';
      
      // Only allow numbers and proper format
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0 && !value.startsWith('09')) {
          value = '09' + value.slice(2);
        }
        e.target.value = value;
      });
      
      el.innerHTML = '';
      el.appendChild(input);
      input.focus();
      
      const handleContactChange = () => {
        const value = input.value;
        if (value && !/^09\d{9}$/.test(value)) {
          alert('Please enter a valid phone number starting with 09 followed by 9 digits');
          input.focus();
          return;
        }
        userData[field] = value;
        editingField = null;
        renderProfile();
      };
      
      input.addEventListener('blur', handleContactChange);
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          handleContactChange();
          ev.preventDefault();
        }
      });
    } else {
      // Handle other fields
      const input = document.createElement('input');
      input.type = field === 'password' ? 'password' : 'text';
      input.value = field === 'password' ? '' : currentValue;
      input.placeholder = field === 'password' ? 'Enter new password' : '';
      input.className = 'bg-transparent border-2 border-gray-300 rounded px-2 py-1 outline-none w-full font-semibold text-gray-800';
      
      el.innerHTML = '';
      el.appendChild(input);
      input.focus();
      
      const handleChange = () => {
        if (field === 'password') {
          newPassword = input.value;
        } else {
          userData[field] = input.value;
        }
        editingField = null;
        renderProfile();
      };
      
      input.addEventListener('blur', handleChange);
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          handleChange();
          ev.preventDefault();
        }
      });
    }
  });
});

// Profile picture preview and file handling
if (profilePictureInput) {
  profilePictureInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      newProfilePicFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        profilePicture.src = ev.target.result;
        removePictureBtn.style.display = 'block'; // Show remove button when new image is selected
      };
      reader.readAsDataURL(file);
      removeProfilePic = false;
    }
  });
}

if (removePictureBtn) {
  removePictureBtn.addEventListener('click', async () => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user) return;

      // Remove from storage if exists
      if (userData.profilepicture) {
        const oldFilePath = userData.profilepicture.split('/').pop();
        const { error } = await supabase.storage.from('affotako').remove([oldFilePath]);
        if (error) throw error;
      }

      // Update database
      const { error } = await supabase
        .from('users_table')
        .update({ profilepicture: null })
        .eq('id', authUser.user.id);
      
      if (error) throw error;

      newProfilePicFile = null;
      removeProfilePic = true;
      profilePicture.src = DEFAULT_PROFILE_IMAGE;
      userData.profilepicture = null;
      removePictureBtn.style.display = 'none'; // Hide remove button
      
      alert('Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Failed to remove profile picture: ' + error.message);
    }
  });
}

// Save changes with image upload
if (saveBtn) {
  saveBtn.addEventListener('click', async () => {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser?.user) return;
      const userId = authUser.user.id;
      let updates = { ...userData };

      // Handle profile picture upload
      if (newProfilePicFile) {
        const publicUrl = await uploadProfilePicture(newProfilePicFile, userId);
        updates.profilepicture = publicUrl;
        newProfilePicFile = null;
        removePictureBtn.style.display = 'block'; // Show remove button after successful upload
      }

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
      const { error } = await supabase
        .from('users_table')
        .update(updates)
        .eq('id', userId);

      if (!error) {
        alert('Profile updated successfully!');
        fetchProfile();
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    }
  });
}

// Initial fetch
fetchProfile();

// Call this function when the page loads and after profile picture updates
fetchAndRenderNavProfilePic(); 