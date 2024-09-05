import React, { useEffect, useState } from "react";
import { createUseHttp } from "../hooks/http.hook"; // Adjust the path if needed

const useHttp = createUseHttp();

function AdminPanel() {
  const [user, setUser] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState("");
  const { request, loading } = useHttp();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await request("/user", "GET", null, {
          Authorization: `Bearer ${token}`,
        });
        setUser(data);
      } catch (e) {
        console.error(e);
        setError("Error fetching user data");
      }
    };

    fetchUser();
  }, [request]);

  const handleUpdate = async () => {
    // Validation functions
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => {
      const minLength = 6;
      const maxLength = 20;
      const hasLowerCase = /[a-z]/.test(password);
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const startsWithSpecialChar = /^[!@#$%^&*(),.?":{}|<>]/.test(password);
      const endsWithSpecialChar = /[!@#$%^&*(),.?":{}|<>]$/i.test(password);

      return (
        password.length >= minLength &&
        password.length <= maxLength &&
        hasLowerCase &&
        hasUpperCase &&
        hasNumber &&
        hasSpecialChar &&
        !startsWithSpecialChar &&
        !endsWithSpecialChar
      );
    };

    // Validate fields
    if (newEmail && !validateEmail(newEmail)) {
      setError("Invalid email format");
      return;
    }
    if (newPassword && !validatePassword(newPassword)) {
      setError(
        "Password must be 6-20 characters long, include at least one lowercase letter, one uppercase letter, one number, and one special character. Special characters cannot be at the beginning or end."
      );
      return;
    }

    // Proceed with update if validation passes
    if (newEmail || newPassword || newImage) {
      try {
        const token = localStorage.getItem("token");

        // If there is a new image, upload it first
        let newImageUrl = null;
        if (newImage) {
          const formData = new FormData();
          formData.append("image", newImage);

          const imageResponse = await request(
            "/upload-image",
            "POST",
            formData,
            {
              Authorization: `Bearer ${token}`,
            }
          );

          newImageUrl = imageResponse.image; // Make sure this is the correct path returned by your backend
        }

        // Update the user data, including the new image URL if applicable
        const response = await request(
          "/update",
          "PUT",
          {
            email: user.email,
            newEmail,
            newPassword,
            newImage: newImageUrl,
          },
          { Authorization: `Bearer ${token}` }
        );

        // Check if a new token was returned and update local storage
        if (response.token) {
          localStorage.setItem("token", response.token);
        }

        // Fetch the updated user data
        const updatedUser = await request("/user", "GET", null, {
          Authorization: `Bearer ${response.token || token}`,
        });

        // Update user state with new data
        setUser(updatedUser);

        // Clear input fields
        setNewEmail("");
        setNewPassword("");
        setNewImage(null);
        setError("Updated successfully");
      } catch (e) {
        console.error("Error during update:", e);
        setError("Error updating user");
      }
    } else {
      setError("At least one field is required");
    }
  };

  const handleImageUpload = async () => {
    if (newImage) {
      const formData = new FormData();
      formData.append("image", newImage);
      console.log(user);

      try {
        const token = localStorage.getItem("token");
        const response = await request("/upload-image", "POST", formData, {
          Authorization: `Bearer ${token}`,
        });
        const newImageUrl = response.image; // Ensure this is the correct path returned by the server

        // Update user state with the new image URL
        setUser({ ...user, image: `${newImageUrl}` });
        setError("Image uploaded successfully");
      } catch (e) {
        setError("Error uploading image");
      }
    } else {
      setError("No image selected");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="main">
      <h2>Admin Panel</h2>
      <p style={{ width: "100%", margin: "auto", textAlign: "center" }}>
        {error}
      </p>
      <div>
        {user.image && (
          <img src={`http://localhost:5000/${user.image}`} alt="User profile" />
        )}
        <p className="inputField" style={{ marginTop: "50px" }}>
          Email: {user.email}
        </p>
        <p className="inputField" style={{ marginTop: "10px" }}>
          Password: {user.password}
        </p>{" "}
        {/* Display plaintext password */}
        <input
          className="inputField"
          type="email"
          placeholder="New Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <input
          className="inputField"
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          className="inputField"
          type="file"
          onChange={(e) => setNewImage(e.target.files[0])}
        />
        <button
          onClick={handleUpdate}
          disabled={loading}
          style={{ marginRight: "20px" }}>
          Update
        </button>
        <button onClick={handleImageUpload} disabled={loading}>
          Upload Image
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;
