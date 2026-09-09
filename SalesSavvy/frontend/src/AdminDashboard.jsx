import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import Logo from "./Logo";
import "./assets/styles.css";
import CustomModal from "./CustomModal";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [response, setResponse] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const cardData = [
    {
      title: "Add Product",
      description: "Create and manage new product listings with validation",
      team: "Product Management",
      modalType: "addProduct",
    },
    {
      title: "Delete Product",
      description: "Remove products from inventory system",
      team: "Product Management",
      modalType: "deleteProduct",
    },
    {
      title: "Modify User",
      description: "Update user details and manage roles",
      team: "User Management",
      modalType: "modifyUser",
    },
    {
      title: "View User Details",
      description: "Fetch and display details of a specific user",
      team: "User Management",
      modalType: "viewUser",
    },
    {
      title: "Monthly Business",
      description: "View revenue metrics for specific months",
      team: "Analytics",
      modalType: "monthlyBusiness",
    },
    {
      title: "Day Business",
      description: "Track daily revenue and transactions",
      team: "Analytics",
      modalType: "dailyBusiness",
    },
    {
      title: "Yearly Business",
      description: "Analyze annual revenue performance",
      team: "Analytics",
      modalType: "yearlyBusiness",
    },
    {
      title: "Overall Business",
      description: "View total revenue since inception",
      team: "Analytics",
      modalType: "overallBusiness",
    },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:9090/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
      });
      if (res.ok) {
        localStorage.clear();
        navigate("/");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleOverallBusiness = async () => {
    setModalType("overallBusiness");
    setResponse(null);
    try {
      const res = await fetch("http://localhost:9090/admin/business/overall", {
        method: "GET",
        credentials: "include",
        headers: getHeaders(),
      });
      if (res.ok) {
        const businessData = await res.json();
        setResponse({ 
          overallBusiness: {
            totalBusiness: businessData?.totalBusiness ?? businessData?.totalRevenue ?? 0,
            categorySales: businessData?.categorySales || {}
          } 
        });
      } else {
        setResponse({ 
          overallBusiness: {
            totalBusiness: 0,
            categorySales: {}
          } 
        });
      }
    } catch (error) {
      console.error("Error fetching overall business:", error);
      setResponse({ 
        overallBusiness: {
          totalBusiness: 0,
          categorySales: {}
        } 
      });
    }
  };

  const handleAddProductSubmit = async (productData) => {
    try {
      const res = await fetch("http://localhost:9090/admin/products/add", {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      setResponse({ product: data });
      setModalType("addProduct");
    } catch (error) {
      console.error("Error adding product:", error);
      setResponse({ message: "Error: Failed to add product" });
      setModalType("response");
    }
  };

  const handleDeleteProductSubmit = async ({ productId }) => {
    try {
      const res = await fetch("http://localhost:9090/admin/products/delete", {
        method: "DELETE",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setResponse({ message: "Delete Success" });
      } else {
        const errorMessage = await res.text();
        setResponse({ message: `Error: ${errorMessage}` });
      }
      setModalType("response");
    } catch (error) {
      console.error("Error deleting product:", error);
      setResponse({ message: "Error: Something went wrong" });
      setModalType("response");
    }
  };

  const handleViewUserSubmit = async ({ userId }) => {
    try {
      const res = await fetch("http://localhost:9090/admin/user/getbyid", {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setResponse({ user: data });
      } else {
        const errorMessage = await res.text();
        setResponse({ message: `Error: ${errorMessage}` });
      }
      setModalType("response");
    } catch (error) {
      console.error("Error fetching user details:", error);
      setResponse({ message: "Error: Something went wrong" });
      setModalType("response");
    }
  };

  const handleMonthlyBusiness = async (data) => {
    try {
      const res = await fetch(
        `http://localhost:9090/admin/business/monthly?month=${data?.month}&year=${data?.year}`,
        {
          method: "GET",
          credentials: "include",
          headers: getHeaders(),
        }
      );
      if (res.ok) {
        const businessData = await res.json();
        setResponse({ monthlyBusiness: businessData });
      } else {
        setResponse({ message: "Error fetching data" });
      }
      setModalType("monthlyBusiness");
    } catch (error) {
      console.error("Error fetching monthly business:", error);
      setResponse({ message: "Error: Something went wrong" });
      setModalType("monthlyBusiness");
    }
  };

  const handleDailyBusiness = async (data) => {
    try {
      const res = await fetch(
        `http://localhost:9090/admin/business/daily?date=${data?.date}`,
        {
          method: "GET",
          credentials: "include",
          headers: getHeaders(),
        }
      );
      if (res.ok) {
        const businessData = await res.json();
        setResponse({ dailyBusiness: businessData });
      } else {
        setResponse({ message: "Error fetching data" });
      }
      setModalType("dailyBusiness");
    } catch (error) {
      console.error("Error fetching daily business:", error);
      setResponse({ message: "Error: Something went wrong" });
      setModalType("dailyBusiness");
    }
  };

  const handleYearlyBusiness = async (data) => {
    try {
      const res = await fetch(
        `http://localhost:9090/admin/business/yearly?year=${data?.year}`,
        {
          method: "GET",
          credentials: "include",
          headers: getHeaders(),
        }
      );
      if (res.ok) {
        const businessData = await res.json();
        setResponse({ yearlyBusiness: businessData });
      } else {
        setResponse({ message: "Error fetching data" });
      }
      setModalType("yearlyBusiness");
    } catch (error) {
      console.error("Error fetching yearly business:", error);
      setResponse({ message: "Error: Something went wrong" });
      setModalType("yearlyBusiness");
    }
  };

  const handleCardClick = (card) => {
    setResponse(null);
    setModalData(null);
    if (card.modalType === "overallBusiness") {
      handleOverallBusiness();
    } else {
      setModalType(card.modalType);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <Logo />
        <div className="user-info">
          <span className="username">Admin</span>
          <div className="dropdown">
            <button className="dropdown-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="cards-grid">
          {cardData.map((card, index) => (
            <div
              key={index}
              className="card"
              onClick={() => handleCardClick(card)}
            >
              <div className="card-content">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
                <span className="card-team">Team: {card.team}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {modalType && (
        <CustomModal
          modalType={modalType}
          onClose={() => {
            setModalType(null);
            setResponse(null);
          }}
          onSubmit={(data) => {
            switch (modalType) {
              case "addProduct":
                handleAddProductSubmit(data);
                break;
              case "deleteProduct":
                handleDeleteProductSubmit(data);
                break;
              case "viewUser":
                handleViewUserSubmit(data);
                break;
              case "monthlyBusiness":
                handleMonthlyBusiness(data);
                break;
              case "dailyBusiness":
                handleDailyBusiness(data);
                break;
              case "yearlyBusiness":
                handleYearlyBusiness(data);
                break;
              case "overallBusiness":
                handleOverallBusiness();
                break;
              default:
                break;
            }
          }}
          response={response}
        />
      )}
    </div>
  );
};

export default AdminDashboard;