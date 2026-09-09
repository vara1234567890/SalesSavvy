import React, { useState } from "react";
import "./assets/modalStyles.css";

const CustomModal = ({ modalType, onClose, onSubmit, response }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
    month: "",
    year: "",
    date: "",
  });

  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneralInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    switch (modalType) {
      case "addProduct":
        onSubmit({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
          categoryId: parseInt(formData.categoryId, 10),
          imageUrl: formData.imageUrl.trim() || null,
        });
        break;
      case "deleteProduct":
        onSubmit({ productId: parseInt(inputValue, 10) });
        break;
      case "viewUser":
        onSubmit({ userId: parseInt(inputValue, 10) });
        break;
      case "monthlyBusiness":
        onSubmit({ month: parseInt(formData.month, 10), year: parseInt(formData.year, 10) });
        break;
      case "dailyBusiness":
        onSubmit({ date: formData.date });
        break;
      case "yearlyBusiness":
        onSubmit({ year: parseInt(formData.year, 10) });
        break;
      case "overallBusiness":
        onSubmit();
        break;
      default:
        break;
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(Number(val))) return "0.00";
    return Number(val).toFixed(2);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Add Product */}
        {modalType === "addProduct" &&
          (!response ? (
            <>
              <h2>Add Product</h2>
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="modal-form-item">
                  <label htmlFor="name">Name:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="modal-form-item">
                  <label htmlFor="price">Price:</label>
                  <input
                    type="number"
                    step="0.01"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="modal-form-item">
                  <label htmlFor="stock">Stock:</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="modal-form-item">
                  <label htmlFor="categoryId">Category ID:</label>
                  <input
                    type="number"
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="modal-form-item">
                  <label htmlFor="imageUrl">Image URL:</label>
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-form-item">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit">Submit</button>
                <button type="button" onClick={onClose}>Cancel</button>
              </form>
            </>
          ) : (
            <>
              <h2>Product Added Successfully</h2>
              <button type="button" onClick={onClose}>Close</button>
            </>
          ))}

        {/* Delete Product */}
        {modalType === "deleteProduct" &&
          (!response ? (
            <>
              <h2>Delete Product</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="number"
                  placeholder="Enter Product ID"
                  value={inputValue}
                  onChange={handleGeneralInputChange}
                  required
                />
                <button type="submit">Delete</button>
                <button type="button" onClick={onClose}>Cancel</button>
              </form>
            </>
          ) : (
            <div>
              <h2>{response.message || "Product Deleted"}</h2>
              <button type="button" onClick={onClose}>Close</button>
            </div>
          ))}

        {/* View User */}
        {modalType === "viewUser" && (
          <>
            <h2>View User Details</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="number"
                placeholder="Enter User ID"
                value={inputValue}
                onChange={handleGeneralInputChange}
                required
              />
              <button type="submit">Submit</button>
              <button type="button" onClick={onClose}>Cancel</button>
            </form>
          </>
        )}

        {/* Response */}
        {modalType === "response" && response && (
          <>
            {response.user ? (
              <div className="user-details">
                <h2>User Details</h2>
                <p><strong>User ID:</strong> {response.user.userId}</p>
                <p><strong>Username:</strong> {response.user.username}</p>
                <p><strong>Email:</strong> {response.user.email}</p>
                <p><strong>Role:</strong> {response.user.role}</p>
              </div>
            ) : (
              <div>
                <h2>Notification</h2>
                <p>{response.message || "Operation Completed."}</p>
              </div>
            )}
            <button type="button" onClick={onClose}>Back to Dashboard</button>
          </>
        )}

        {/* Monthly Business */}
        {modalType === "monthlyBusiness" && (
          <div className="modal-form">
            {!response?.monthlyBusiness ? (
              <form onSubmit={handleSubmit}>
                <div className="modal-form-item">
                  <label htmlFor="month">Month:</label>
                  <input
                    type="number"
                    id="month"
                    name="month"
                    min="1"
                    max="12"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="modal-form-item">
                  <label htmlFor="year">Year:</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button type="submit">Submit</button>
              </form>
            ) : (
              <div>
                <h3>Total Business: ₹{formatCurrency(response.monthlyBusiness.totalBusiness)}</h3>
                <h4>Category Sales</h4>
                {response.monthlyBusiness.categorySales && Object.keys(response.monthlyBusiness.categorySales).length > 0 ? (
                  Object.entries(response.monthlyBusiness.categorySales).map(([k, v]) => (
                    <p key={k}>{k}: {v}</p>
                  ))
                ) : (
                  <p>No sales recorded</p>
                )}
              </div>
            )}
            <button type="button" onClick={onClose}>Close</button>
          </div>
        )}

        {/* Daily Business */}
        {modalType === "dailyBusiness" && (
          <div className="modal-form">
            {!response?.dailyBusiness ? (
              <form onSubmit={handleSubmit}>
                <div className="modal-form-item">
                  <label htmlFor="date">Date:</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button type="submit">Submit</button>
              </form>
            ) : (
              <div>
                <h3>Total Business: ₹{formatCurrency(response.dailyBusiness.totalBusiness)}</h3>
                <h4>Category Sales</h4>
                {response.dailyBusiness.categorySales && Object.keys(response.dailyBusiness.categorySales).length > 0 ? (
                  Object.entries(response.dailyBusiness.categorySales).map(([k, v]) => (
                    <p key={k}>{k}: {v}</p>
                  ))
                ) : (
                  <p>No sales recorded</p>
                )}
              </div>
            )}
            <button type="button" onClick={onClose}>Close</button>
          </div>
        )}

        {/* Yearly Business */}
        {modalType === "yearlyBusiness" && (
          <div className="modal-form">
            {!response?.yearlyBusiness ? (
              <form onSubmit={handleSubmit}>
                <div className="modal-form-item">
                  <label htmlFor="year">Year:</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button type="submit">Submit</button>
              </form>
            ) : (
              <div>
                <h3>Total Business: ₹{formatCurrency(response.yearlyBusiness.totalBusiness)}</h3>
                <h4>Category Sales</h4>
                {response.yearlyBusiness.categorySales && Object.keys(response.yearlyBusiness.categorySales).length > 0 ? (
                  Object.entries(response.yearlyBusiness.categorySales).map(([k, v]) => (
                    <p key={k}>{k}: {v}</p>
                  ))
                ) : (
                  <p>No sales recorded</p>
                )}
              </div>
            )}
            <button type="button" onClick={onClose}>Close</button>
          </div>
        )}

        {/* Overall Business */}
        {modalType === "overallBusiness" && (
          <div className="modal-form">
            {!response?.overallBusiness ? (
              <p>Fetching overall business metrics...</p>
            ) : (
              <div>
                <h3>Total Business: ₹{formatCurrency(response.overallBusiness.totalBusiness)}</h3>
                <h4>Category Sales</h4>
                {response.overallBusiness.categorySales && Object.keys(response.overallBusiness.categorySales).length > 0 ? (
                  Object.entries(response.overallBusiness.categorySales).map(([k, v]) => (
                    <p key={k}><strong>{k}:</strong> {v} sold</p>
                  ))
                ) : (
                  <p>No category sales found</p>
                )}
              </div>
            )}
            <button type="button" onClick={onClose}>Close</button>
          </div>
        )}

        {/* Modify User */}
        {modalType === "modifyUser" && (
          <ModifyUserFormComponent onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default CustomModal;

const ModifyUserFormComponent = ({ onClose }) => {
  const [userId, setUserId] = useState("");
  const [userDetails, setUserDetails] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const handleFetchUser = async (e) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const response = await fetch("http://localhost:9090/admin/user/getbyid", {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify({ userId: parseInt(userId, 10) }),
      });

      if (response.ok) {
        const user = await response.json();
        setUserDetails(user);
      } else {
        alert("User not found");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch("http://localhost:9090/admin/user/modify", {
        method: "PUT",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify({
          userId: parseInt(userId, 10),
          username: formData.get("username"),
          email: formData.get("email"),
          role: formData.get("role"),
        }),
      });

      if (response.ok) {
        alert("User updated successfully");
        onClose();
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  if (!userDetails) {
    return (
      <form onSubmit={handleFetchUser}>
        <h2>Fetch User to Modify</h2>
        <div className="modal-form-item">
          <label htmlFor="user-id">User ID:</label>
          <input
            type="text"
            id="user-id"
            name="user-id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <button type="submit">Get User</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    );
  }

  return (
    <div>
      <h2>Modify User</h2>
      <form onSubmit={handleUpdateUser} className="modal-form">
        <div className="modal-form-item">
          <label htmlFor="edit-user-id">User ID:</label>
          <input
            type="text"
            id="edit-user-id"
            name="user-id"
            value={userDetails.userId}
            readOnly
          />
        </div>
        <div className="modal-form-item">
          <label htmlFor="edit-username">Username:</label>
          <input
            type="text"
            id="edit-username"
            name="username"
            defaultValue={userDetails.username}
            required
          />
        </div>
        <div className="modal-form-item">
          <label htmlFor="edit-email">Email:</label>
          <input
            type="email"
            id="edit-email"
            name="email"
            defaultValue={userDetails.email}
            required
          />
        </div>
        <div className="modal-form-item">
          <label htmlFor="edit-role">Role:</label>
          <input
            type="text"
            id="edit-role"
            name="role"
            defaultValue={userDetails.role}
            required
          />
        </div>
        <button type="submit">Submit</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};